from openai import AsyncOpenAI
import json
import os
from models import Lead, Campaign
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def enrich_and_score_lead(raw: dict, campaign: Campaign) -> Lead:
    response = await get_client().chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are a B2B sales expert. Always respond with valid JSON only.",
            },
            {
                "role": "user",
                "content": f"""
Score this company's fit as a sales lead.

OUR PRODUCT: {campaign.company_description}
TARGET PROFILE:
- Industry: {campaign.target_industry}
- Company size: {campaign.target_company_size}
- Best contacts: {campaign.target_job_titles}
- Keywords: {campaign.target_keywords}

COMPANY DATA:
{json.dumps(raw, indent=2)}

Return this exact JSON:
{{
  "icp_score": <integer 0-100>,
  "icp_reasoning": "<one sentence explaining the score>",
  "contact_title": "<best job title to reach out to>",
  "company_size_estimate": "<estimated headcount range>",
  "funding_stage": "<seed/series-a/bootstrap/unknown>",
  "industry": "<primary industry>"
}}
                """,
            },
        ],
    )

    data = json.loads(response.choices[0].message.content)

    return Lead(
        company_name=raw.get("name") or raw.get("company_name"),
        company_url=raw.get("website") or raw.get("url"),
        company_description=raw.get("description") or raw.get("tagline"),
        location=raw.get("location"),
        source=raw.get("source", "unknown"),
        raw_data=raw,
        icp_score=data.get("icp_score", 0),
        icp_reasoning=data.get("icp_reasoning", ""),
        contact_title=data.get("contact_title", ""),
        company_size=data.get("company_size_estimate", ""),
        funding_stage=data.get("funding_stage", "unknown"),
        industry=data.get("industry", ""),
    )
