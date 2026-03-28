from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Lead, Email, Campaign
from ai.emails import draft_email_sequence

router = APIRouter()


@router.get("/leads/{lead_id}")
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    emails = (
        db.query(Email)
        .filter(Email.lead_id == lead_id)
        .order_by(Email.sequence_step)
        .all()
    )
    return {"lead": lead, "emails": emails}


@router.put("/leads/{lead_id}/status")
def update_status(lead_id: str, body: dict, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = body["status"]
    db.commit()
    return {"ok": True}


@router.post("/leads/{lead_id}/regenerate")
async def regenerate_email(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    campaign = db.query(Campaign).filter(Campaign.id == lead.campaign_id).first()
    db.query(Email).filter(Email.lead_id == lead_id).delete()
    emails = await draft_email_sequence(lead, campaign)
    for email in emails:
        db.add(email)
    db.commit()
    return {"ok": True}
