from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Campaign, Lead, Email
from schemas import CampaignCreate, CampaignResponse
from agents.pipeline import run_discovery_pipeline_task
import csv
import io

router = APIRouter()


@router.post("/campaigns", response_model=CampaignResponse)
def create_campaign(data: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(
        name=data.name,
        company_description=data.company_description,
        target_industry=data.target_industry,
        target_company_size=data.target_company_size,
        target_job_titles=data.target_job_titles,
        target_keywords=data.target_keywords,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/campaigns/{campaign_id}/run")
def run_campaign(campaign_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    background_tasks.add_task(run_discovery_pipeline_task, campaign_id)
    return {"status": "started"}


@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("/campaigns/{campaign_id}/leads")
def get_leads(campaign_id: str, db: Session = Depends(get_db)):
    return (
        db.query(Lead)
        .filter(Lead.campaign_id == campaign_id)
        .order_by(Lead.icp_score.desc())
        .all()
    )


@router.get("/campaigns/{campaign_id}/export")
def export_csv(campaign_id: str, db: Session = Depends(get_db)):
    leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Company", "URL", "Score", "Reasoning", "Contact Title",
        "Source", "Status", "Email 1 Subject", "Email 1 Body",
    ])

    for lead in leads:
        email = (
            db.query(Email)
            .filter(Email.lead_id == lead.id, Email.sequence_step == 1)
            .first()
        )
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
