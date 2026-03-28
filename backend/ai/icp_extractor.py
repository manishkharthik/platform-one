from openai import AsyncOpenAI
import json
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def extract_icp_from_text(document_text: str) -> dict:
    """Read a product document and extract ICP fields using OpenAI."""
    response = await get_client().chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are a B2B sales expert who reads product documents and extracts Ideal Customer Profile information. Always respond with valid JSON only.",
            },
            {
                "role": "user",
                "content": f"""
Read this product document and extract the Ideal Customer Profile (ICP).

DOCUMENT:
{document_text[:8000]}

Extract and return this exact JSON:
{{
  "company_description": "<2-3 sentence description of what the product does and who it helps>",
  "target_industry": "<primary target industry, e.g. SaaS, Fintech, E-commerce>",
  "target_company_size": "<ideal company size range, e.g. 10-200>",
  "target_job_titles": ["<job title 1>", "<job title 2>", "<job title 3>"],
  "target_keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>"],
  "pain_points": ["<pain point 1>", "<pain point 2>", "<pain point 3>"]
}}

Be specific and actionable. These fields will be used to find real buyers on the internet.
                """,
            },
        ],
    )

    return json.loads(response.choices[0].message.content)
