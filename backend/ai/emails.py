from openai import AsyncOpenAI
import json
import os
from models import Lead, Campaign, Email
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def draft_email_sequence(lead: Lead, campaign: Campaign) -> list[Email]:
    response = await get_client().chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are an expert cold email copywriter. Write concise, human, non-salesy emails. Always respond with valid JSON only.",
            },
            {
                "role": "user",
                "content": f"""
Write a 3-step cold email sequence.

SENDER'S PRODUCT: {campaign.company_description}

PROSPECT:
- Company: {lead.company_name}
- What they do: {lead.company_description}
- Industry: {lead.industry}
- Size: {lead.company_size}
- Best contact: {lead.contact_title}
- Why they fit: {lead.icp_reasoning}

RULES:
- Email 1: Open with something specific about them. 3-4 sentences. CTA = 15 min call.
- Email 2 (day 5): Reference email 1. New angle or social proof. 2-3 sentences.
- Email 3 (day 10): Short breakup email. Light, no pressure. 2 sentences.
- NEVER use "I hope this email finds you well" or similar filler
- Sound like a human founder, not a sales robot
- Be specific to THIS company, not generic

Return this exact JSON:
{{
  "emails": [
    {{"step": 1, "subject": "...", "body": "..."}},
    {{"step": 2, "subject": "...", "body": "..."}},
    {{"step": 3, "subject": "...", "body": "..."}}
  ]
}}
                """,
            },
        ],
    )

    data = json.loads(response.choices[0].message.content)
    return [
        Email(
            lead_id=lead.id,
            subject=e["subject"],
            body=e["body"],
            sequence_step=e["step"],
        )
        for e in data["emails"]
    ]
