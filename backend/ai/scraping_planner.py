import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

NUM_SOURCES = 6


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


SOURCES_REFERENCE = """
SOURCE CATALOG (use this to decide which sources to pick and how to build URLs):

1. linkedin.com/search/results/companies/
   - Best for: finding companies by industry, size, location, keywords
   - URL params: keywords=, geoUrn= (location), facetN= (company size)
   - Also use: linkedin.com/search/results/people/ to find decision-makers by title at those companies
   - Can extract: company name, size, industry, location, website, employee names + titles

2. crunchbase.com/discover/organizations
   - Best for: filtering by funding stage, industry, geography, headcount
   - Build URL with query filters where possible
   - Can extract: company name, website, description, funding stage, employee count, location, last funding date

3. wellfound.com/companies or wellfound.com/jobs
   - Best for: seed/series A startups actively hiring, strong signal of growth
   - URL: wellfound.com/companies?filter_stage[]=Seed&filter_stage[]=Series+A&filter_role[]=Sales
   - Can extract: company name, website, description, stage, team size, open roles, location

4. news.ycombinator.com
   - Best for: "Ask HN: Who is Hiring?" thread — early-stage B2B tech companies
   - Navigate to the most recent monthly thread
   - Can extract: company name, website, what they do, open roles, location

5. producthunt.com
   - Best for: newly launched SaaS products, finding their makers/founders
   - URL: producthunt.com/topics/{category} or producthunt.com/search?q={keyword}
   - Can extract: product name, website, maker name, maker email (sometimes), description, upvotes

6. apollo.io/companies
   - Best for: finding companies + verified contact emails for decision-makers
   - Search by industry, company size, job title
   - Can extract: company name, website, contact name, contact title, contact email

7. hunter.io/companies
   - Best for: finding email addresses for people at specific companies
   - URL: hunter.io/companies/{company-domain}
   - Can extract: email addresses, names, job titles

8. github.com
   - Best for: developers/technical founders — github.com/trending or github.com/search
   - Profiles often have email addresses in bio
   - Can extract: username, name, email (if public), company, location, repos

9. techcrunch.com
   - Best for: recently funded companies (seed/series A/B) in specific verticals
   - URL: techcrunch.com/tag/{keyword} or search for recent funding rounds
   - Can extract: company name, website, funding amount, stage, founders, description

10. g2.com/categories/{category}
    - Best for: companies actively evaluating software in a category (high buying intent)
    - Shows who reviews tools in your competitor's category
    - Can extract: reviewer company names, roles, company size

11. twitter.com/search or x.com/search
    - Best for: founders/decision-makers talking about problems your product solves
    - Search for pain point keywords + job titles
    - Can extract: username, name, bio, company, sometimes email

12. reddit.com
    - Best for: finding communities of buyers discussing problems
    - Subreddits like r/entrepreneur, r/startups, r/sales
    - Can extract: username, company mentions, contact info if shared
"""

FALLBACK_TASKS = [
    {
        "url": "https://www.linkedin.com/search/results/companies/?keywords=saas+startup&origin=GLOBAL_SEARCH_HEADER",
        "goal": "Search LinkedIn for SaaS startup companies. For each company find: name, website, industry, company size, location, and if possible click into the company page to find key decision-maker names and titles (CEO, VP Sales, Head of Revenue). Return a list of items with fields: name, website, industry, size, location, contact_name, contact_title.",
        "source": "linkedin",
    },
    {
        "url": "https://www.crunchbase.com/discover/organizations",
        "goal": "Find 8 seed-stage SaaS companies with 10-100 employees. Extract: name, website, description, funding_stage, employee_count, location. Return a list of items.",
        "source": "crunchbase",
    },
    {
        "url": "https://news.ycombinator.com",
        "goal": "Find the latest Ask HN: Who is hiring? thread. Extract 8 early-stage B2B startups. For each: name, website, description, role, location. Return a list of items.",
        "source": "hn_hiring",
    },
    {
        "url": "https://wellfound.com/jobs",
        "goal": "Find 8 seed or Series A startups hiring for sales or marketing roles. Extract: company name, website, description, stage, location. Return a list of items.",
        "source": "wellfound",
    },
    {
        "url": "https://apollo.io/companies",
        "goal": "Search for B2B SaaS companies with 10-200 employees. For each find company name, website, and any available contact emails for decision-makers (CEO, VP Sales, Head of Marketing). Return a list of items.",
        "source": "apollo",
    },
    {
        "url": "https://www.producthunt.com",
        "goal": "Find 8 recently launched B2B SaaS products. Extract: name, tagline, website, description, maker name. Return a list of items.",
        "source": "producthunt",
    },
]


async def generate_scraping_plan(campaign, product) -> list[dict]:
    """
    Use OpenAI to reason about the ICP and generate a scraping plan:
    - Which sources are most likely to have the right leads
    - Precise, filtered URLs for each source
    - TinyFish goals that extract contact emails where possible
    """
    icp_parts = []
    if product:
        if product.name:
            icp_parts.append(f"Product: {product.name}")
        if product.description:
            icp_parts.append(f"Description: {product.description}")
        if product.value_proposition:
            icp_parts.append(f"Value proposition: {product.value_proposition}")
        if product.pain_points:
            icp_parts.append(f"Pain points: {', '.join(product.pain_points)}")
        if product.target_industries:
            icp_parts.append(f"Target industries: {', '.join(product.target_industries)}")
        if product.target_company_size:
            icp_parts.append(f"Company size: {product.target_company_size}")
        if product.target_job_titles:
            icp_parts.append(f"Target titles: {', '.join(product.target_job_titles)}")
        if product.buying_signals:
            icp_parts.append(f"Buying signals: {', '.join(product.buying_signals)}")
        if product.keywords:
            icp_parts.append(f"Keywords: {', '.join(product.keywords)}")
        if product.competitors:
            icp_parts.append(f"Competitors: {', '.join(product.competitors)}")

    campaign_parts = []
    if campaign.goal:
        campaign_parts.append(f"Goal: {campaign.goal}")
    if campaign.target_industry:
        campaign_parts.append(f"Industry filter: {campaign.target_industry}")
    if campaign.target_company_size:
        campaign_parts.append(f"Size filter: {campaign.target_company_size}")
    if campaign.target_job_titles:
        campaign_parts.append(f"Title filter: {', '.join(campaign.target_job_titles)}")
    if campaign.funding_stage:
        campaign_parts.append(f"Funding stage: {campaign.funding_stage}")
    if campaign.geography:
        campaign_parts.append(f"Geography: {campaign.geography}")
    if campaign.custom_signal:
        campaign_parts.append(f"Custom signal: {campaign.custom_signal}")

    icp_context = "\n".join(icp_parts) or "No product data — use B2B SaaS defaults."
    campaign_context = "\n".join(campaign_parts) or "No additional filters."

    try:
        response = await get_client().chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert B2B lead generation strategist. "
                        "Your job is to generate a web scraping plan that will find real companies with real contact emails. "
                        "Think carefully about where the buyer persona actually spends time online and where their contact info is discoverable. "
                        "Always respond with valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": f"""
Analyze this product ICP and campaign criteria, then generate {NUM_SOURCES} web scraping tasks to find the best-fit leads WITH contact emails.

--- PRODUCT ICP ---
{icp_context}

--- CAMPAIGN CRITERIA ---
{campaign_context}

--- SOURCE CATALOG ---
{SOURCES_REFERENCE}

Your task:
1. REASON about which sources best match this ICP. Consider:
   - Where do these types of companies get discovered? (funding news, product launches, job boards)
   - Where can we find contact emails for the target job titles?
   - Which geography/industry filters can be applied at the URL level?

2. For each of the {NUM_SOURCES} tasks:
   - Build the most precise starting URL possible (use filters, search params, category slugs)
   - Write a TinyFish goal that:
     * Describes exactly what type of company to find (be specific about industry, size, stage, signals)
     * Explicitly asks to extract contact email addresses wherever visible
     * Asks for 6-10 results
     * Ends with: "Return a list of items with fields: [list the exact fields to extract]."

3. Prioritize sources that expose contact emails (Apollo, Hunter, LinkedIn profiles, GitHub bios, ProductHunt maker pages).

Return this exact JSON:
{{
  "reasoning": "2-3 sentences explaining your source selection strategy",
  "tasks": [
    {{"url": "https://...", "goal": "...", "source": "source_label"}},
    ...
  ]
}}
""",
                },
            ],
        )
        data = json.loads(response.choices[0].message.content)
        tasks = data.get("tasks", [])
        reasoning = data.get("reasoning", "")
        if reasoning:
            print(f"[scraping_planner] Strategy: {reasoning}")

        valid = [t for t in tasks if t.get("url") and t.get("goal") and t.get("source")]
        if len(valid) >= 3:
            return valid, reasoning
    except Exception as e:
        print(f"[scraping_planner] OpenAI error: {e} — using fallback tasks")

    return FALLBACK_TASKS, ""
