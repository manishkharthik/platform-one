import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

KNOWN_SOURCES = """
Available sources (choose 4):
- producthunt.com — new product launches by category/topic
- crunchbase.com/discover/organizations — company search by industry/stage/size
- news.ycombinator.com — Ask HN: Who is Hiring? thread (early-stage B2B startups)
- github.com/trending — trending repos by topic/language
- wellfound.com — AngelList startup jobs by role/stage/location
- techcrunch.com/category/startups/ — recently funded startups in the news
- devpost.com — hackathon winners and builders by category
- g2.com — software review categories (shows companies evaluating tools in a space)
- capterra.com — software review categories (similar to G2)
- indiehackers.com — bootstrapped/early-stage product builders
"""


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


FALLBACK_TASKS = [
    {
        "url": "https://www.producthunt.com",
        "goal": "Find 8 recently launched B2B SaaS products. For each extract: name, tagline, website, description, upvotes. Return a list of items.",
        "source": "producthunt",
    },
    {
        "url": "https://www.crunchbase.com/discover/organizations",
        "goal": "Find 8 early-stage SaaS companies with 10-200 employees. Extract: name, website, description, funding_stage, employee_count, location. Return a list of items.",
        "source": "crunchbase",
    },
    {
        "url": "https://news.ycombinator.com",
        "goal": "Find the latest Ask HN: Who is hiring? thread. Extract 8 early-stage B2B startups. Return: name, website, description, role, location as a list of items.",
        "source": "hn_hiring",
    },
    {
        "url": "https://github.com/trending",
        "goal": "Find 6 trending repos related to SaaS or developer tools. Extract: name, owner, website, description, stars, language. Return a list of items.",
        "source": "github",
    },
]


async def generate_scraping_plan(campaign, product) -> list[dict]:
    """
    Use OpenAI to pick the best 4 web sources and write optimized TinyFish
    goals based on the full product ICP and campaign context.
    """
    # Build context string from all available data
    icp_context = ""
    if product:
        icp_context += f"Product: {product.name}\n"
        if product.description:
            icp_context += f"Description: {product.description}\n"
        if product.value_proposition:
            icp_context += f"Value proposition: {product.value_proposition}\n"
        if product.pain_points:
            icp_context += f"Pain points solved: {', '.join(product.pain_points)}\n"
        if product.target_industries:
            icp_context += f"Target industries: {', '.join(product.target_industries)}\n"
        if product.target_company_size:
            icp_context += f"Target company size: {product.target_company_size}\n"
        if product.target_job_titles:
            icp_context += f"Target job titles: {', '.join(product.target_job_titles)}\n"
        if product.buying_signals:
            icp_context += f"Buying signals: {', '.join(product.buying_signals)}\n"
        if product.keywords:
            icp_context += f"Keywords: {', '.join(product.keywords)}\n"
        if product.competitors:
            icp_context += f"Competitors: {', '.join(product.competitors)}\n"

    campaign_context = ""
    if campaign.goal:
        campaign_context += f"Campaign goal: {campaign.goal}\n"
    if campaign.target_industry:
        campaign_context += f"Target industry: {campaign.target_industry}\n"
    if campaign.target_company_size:
        campaign_context += f"Company size filter: {campaign.target_company_size}\n"
    if campaign.target_job_titles:
        campaign_context += f"Target titles: {', '.join(campaign.target_job_titles)}\n"
    if campaign.funding_stage:
        campaign_context += f"Funding stage: {campaign.funding_stage}\n"
    if campaign.geography:
        campaign_context += f"Geography: {campaign.geography}\n"
    if campaign.custom_signal:
        campaign_context += f"Custom buying signal: {campaign.custom_signal}\n"

    try:
        response = await get_client().chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert B2B sales strategist. Given a product ICP and campaign settings, "
                        "you generate a web scraping plan to find the best-fit leads. "
                        "Always respond with valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": f"""
I need to find B2B leads for the following product. Generate a scraping plan with exactly 4 tasks.

--- PRODUCT ICP ---
{icp_context or "No product data available — use reasonable B2B SaaS defaults."}

--- CAMPAIGN SETTINGS ---
{campaign_context or "No additional campaign filters."}

--- AVAILABLE SOURCES ---
{KNOWN_SOURCES}

For each of the 4 tasks, provide:
1. The best starting URL (be specific — use category pages, filtered searches, or direct topic URLs)
2. A highly specific TinyFish browser agent goal that:
   - Names the exact type of company to find (industry, size, stage, role signals)
   - References the specific buying signals and pain points from the ICP
   - Asks for 6-10 results
   - Ends with: "Return a list of items with fields: [list the relevant fields]."
3. A short source label (e.g. "producthunt", "crunchbase", "hn_hiring", "wellfound", etc.)

Return this JSON structure:
{{
  "tasks": [
    {{"url": "https://...", "goal": "...", "source": "..."}},
    {{"url": "https://...", "goal": "...", "source": "..."}},
    {{"url": "https://...", "goal": "...", "source": "..."}},
    {{"url": "https://...", "goal": "...", "source": "..."}}
  ]
}}
""",
                },
            ],
        )
        data = json.loads(response.choices[0].message.content)
        tasks = data.get("tasks", [])
        # Validate each task has required fields
        valid = [t for t in tasks if t.get("url") and t.get("goal") and t.get("source")]
        if valid:
            return valid
    except Exception as e:
        print(f"[scraping_planner] OpenAI error: {e} — using fallback tasks")

    return FALLBACK_TASKS
