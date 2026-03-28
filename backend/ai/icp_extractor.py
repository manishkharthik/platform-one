from openai import AsyncOpenAI
import json
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def extract_icp_from_text(document_text: str) -> dict:
    """Read product content and extract full ICP structure using OpenAI."""
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
Read this product content and extract a comprehensive Ideal Customer Profile (ICP).

CONTENT:
{document_text[:12000]}

Return this exact JSON structure:
{{
  "description": "<2-3 sentence description of what the product does and who it helps>",
  "value_proposition": "<the single most compelling thing the product offers, 1 sentence>",
  "pain_points": ["<pain point 1>", "<pain point 2>", "<pain point 3>", "<pain point 4>"],
  "target_industries": ["<industry 1>", "<industry 2>", "<industry 3>"],
  "target_company_size": "<ideal company size range, e.g. 10-200 employees>",
  "target_job_titles": ["<job title 1>", "<job title 2>", "<job title 3>"],
  "buying_signals": ["<signal 1>", "<signal 2>", "<signal 3>"],
  "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>"],
  "competitors": ["<competitor 1>", "<competitor 2>"]
}}

Be specific and actionable. Every field will be used to find real buyers.
                """,
            },
        ],
    )
    return json.loads(response.choices[0].message.content)
