from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Campaign, Lead, Email, Product
from agents.pipeline import run_discovery_pipeline_task
from ai.email_generator import generate_email_template
from pydantic import BaseModel
from typing import Optional, List
import csv
import io
import json

router = APIRouter()


class CampaignCreate(BaseModel):
    name: str
    product_id: Optional[str] = None
    goal: Optional[str] = None
    company_description: Optional[str] = None
    target_industry: Optional[str] = None
    target_company_size: Optional[str] = None
    target_job_titles: Optional[List[str]] = []
    target_keywords: Optional[List[str]] = []
    funding_stage: Optional[str] = None
    geography: Optional[str] = None
    custom_signal: Optional[str] = None
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    followup1_body: Optional[str] = None
    followup2_body: Optional[str] = None


class GenerateEmailRequest(BaseModel):
    product_description: str
    value_proposition: Optional[str] = ""
    pain_points: Optional[List[str]] = []
    campaign_goal: Optional[str] = ""
    target_job_titles: Optional[List[str]] = []
    target_industry: Optional[str] = ""


class ChatRequest(BaseModel):
    message: str
    table_state: Optional[dict] = None


@router.post("/campaigns")
def create_campaign(data: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(**data.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/campaigns/generate-email")
async def generate_email(data: GenerateEmailRequest):
    result = await generate_email_template(
        product_description=data.product_description,
        value_proposition=data.value_proposition,
        pain_points=data.pain_points,
        campaign_goal=data.campaign_goal,
        target_titles=data.target_job_titles,
        target_industry=data.target_industry,
    )
    return result


@router.post("/campaigns/{campaign_id}/run")
def run_campaign(campaign_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    background_tasks.add_task(run_discovery_pipeline_task, campaign_id)
    return {"status": "started"}


@router.post("/campaigns/{campaign_id}/chat")
async def chat(campaign_id: str, data: ChatRequest, db: Session = Depends(get_db)):
    from ai.scoring import get_client
    leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
    table_summary = [
        {
            "company": l.company_name,
            "score": l.icp_score,
            "status": l.status,
            "source": l.source,
            "contact_title": l.contact_title,
        }
        for l in leads
    ]

    response = await get_client().chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """You are an AI assistant for a B2B lead generation platform called FishHook.
You help users manage their leads table via natural language.
Always respond with valid JSON: {"message": "<short 1-2 sentence response>", "action": "<filter|select|none>", "filter": {"field": "<score|status|source>", "op": "<gte|lte|eq|contains>", "value": "<value>"}}
Be concise. Max 2 sentences.""",
            },
            {
                "role": "user",
                "content": f"Current leads table:\n{json.dumps(table_summary)}\n\nUser command: {data.message}",
            },
        ],
    )
    return json.loads(response.choices[0].message.content)


@router.get("/campaigns")
def list_campaigns(product_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Campaign)
    if product_id:
        q = q.filter(Campaign.product_id == product_id)
    return q.order_by(Campaign.created_at.desc()).all()


@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    lead_count = db.query(Lead).filter(Lead.campaign_id == campaign_id).count()
    sent_count = db.query(Email).join(Lead, Email.lead_id == Lead.id).filter(
        Lead.campaign_id == campaign_id, Email.is_sent == True
    ).count()
    replied_count = db.query(Lead).filter(
        Lead.campaign_id == campaign_id, Lead.status == "replied"
    ).count()
    result = {
        "id": str(campaign.id),
        "name": campaign.name,
        "goal": campaign.goal,
        "company_description": campaign.company_description,
        "target_industry": campaign.target_industry,
        "target_company_size": campaign.target_company_size,
        "target_job_titles": campaign.target_job_titles,
        "target_keywords": campaign.target_keywords,
        "funding_stage": campaign.funding_stage,
        "geography": campaign.geography,
        "custom_signal": campaign.custom_signal,
        "email_subject": campaign.email_subject,
        "email_body": campaign.email_body,
        "followup1_body": campaign.followup1_body,
        "followup2_body": campaign.followup2_body,
        "status": campaign.status,
        "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
        "lead_count": lead_count,
        "sent_count": sent_count,
        "replied_count": replied_count,
    }
    return result


@router.get("/campaigns/{campaign_id}/leads")
def get_leads(campaign_id: str, db: Session = Depends(get_db)):
    leads = (
        db.query(Lead)
        .filter(Lead.campaign_id == campaign_id)
        .order_by(Lead.icp_score.desc())
        .all()
    )
    result = []
    for lead in leads:
        email = db.query(Email).filter(
            Email.lead_id == lead.id, Email.sequence_step == 1
        ).first()
        email_status = "not_sent"
        if email:
            if email.reply_content:
                email_status = "replied"
            elif email.open_count and email.open_count > 0:
                email_status = "opened"
            elif email.is_sent:
                email_status = "sent"
            elif email.is_approved:
                email_status = "approved"
        result.append({
            "id": str(lead.id),
            "company_name": lead.company_name,
            "company_url": lead.company_url,
            "company_description": lead.company_description,
            "company_size": lead.company_size,
            "industry": lead.industry,
            "funding_stage": lead.funding_stage,
            "location": lead.location,
            "contact_name": lead.contact_name,
            "contact_title": lead.contact_title,
            "contact_email": lead.contact_email,
            "icp_score": lead.icp_score,
            "icp_reasoning": lead.icp_reasoning,
            "source": lead.source,
            "status": lead.status,
            "email_status": email_status,
            "email_id": str(email.id) if email else None,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
        })
    return result


@router.get("/campaigns/{campaign_id}/export")
def export_csv(campaign_id: str, db: Session = Depends(get_db)):
    leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Company", "URL", "Score", "Reasoning", "Contact Title",
        "Source", "Status", "Email Subject", "Email Body",
    ])
    for lead in leads:
        email = db.query(Email).filter(
            Email.lead_id == lead.id, Email.sequence_step == 1
        ).first()
        writer.writerow([
            lead.company_name, lead.company_url, lead.icp_score,
            lead.icp_reasoning, lead.contact_title, lead.source, lead.status,
            email.subject if email else "",
            email.body if email else "",
        ])
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fishhook_leads.csv"},
    )
