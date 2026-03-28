from openai import AsyncOpenAI
import json
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def get_client():
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_email_template(
    product_description: str,
    value_proposition: str,
    pain_points: list,
    campaign_goal: str,
    target_titles: list,
    target_industry: str,
) -> dict:
    """Generate a 3-step cold email sequence template for a campaign."""
    response = await get_client().chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are an expert cold email copywriter. Write concise, human, non-salesy B2B emails. Always respond with valid JSON.",
            },
            {
                "role": "user",
                "content": f"""
Write a 3-step cold email sequence template.

PRODUCT: {product_description}
VALUE PROP: {value_proposition}
PAIN POINTS: {', '.join(pain_points or [])}
CAMPAIGN GOAL: {campaign_goal}
TARGET TITLES: {', '.join(target_titles or [])}
TARGET INDUSTRY: {target_industry}

Variables available (replaced per lead at send time):
- {{{{first_name}}}} - lead's first name
- {{{{company_name}}}} - lead's company
- {{{{company_description}}}} - what their company does
- {{{{pain_point}}}} - the most relevant pain point for this lead
- {{{{custom_reason}}}} - AI-generated reason this lead fits

RULES:
- Email 1: Opening hook specific to their pain. 3-4 sentences. CTA = 15-min call.
- Email 2 (day 5 if no reply): Brief follow-up. New angle. 2-3 sentences.
- Email 3 (day 10 if no reply): Short breakup. 1-2 sentences. Light.
- NEVER use "I hope this email finds you well"
- Sound like a human founder, not a sales rep
- Use the variables naturally

Return this exact JSON:
{{
  "subject": "<subject line for email 1>",
  "body": "<body of email 1 with variables>",
  "followup1_subject": "<subject for follow-up 1>",
  "followup1_body": "<body of follow-up 1>",
  "followup2_subject": "<subject for follow-up 2 (breakup)>",
  "followup2_body": "<body of follow-up 2>"
}}
                """,
            },
        ],
    )
    return json.loads(response.choices[0].message.content)


async def generate_reply_draft(
    product_description: str,
    original_email: str,
    reply_content: str,
    reply_classification: str,
    lead_name: str,
    company_name: str,
) -> str:
    """Generate a contextual follow-up to a lead's reply."""
    response = await get_client().chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "Write a short, human follow-up email responding to the lead's reply. 3-5 sentences max. No subject line. Just the body.",
            },
            {
                "role": "user",
                "content": f"""
Product: {product_description}

Original email sent: {original_email[:500]}

Lead's reply ({reply_classification}): {reply_content}

Lead: {lead_name} at {company_name}

Write a response that directly addresses what they said. Be warm, brief, and move toward booking a call.
                """,
            },
        ],
    )
    return response.choices[0].message.content.strip()
