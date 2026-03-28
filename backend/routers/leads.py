from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Lead, Email, Campaign, Product
from ai.emails import draft_email_sequence
from ai.email_generator import generate_reply_draft
from datetime import datetime
import json

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


@router.post("/leads/{lead_id}/approve")
def approve_email(lead_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(
        Email.lead_id == lead_id, Email.sequence_step == 1
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    email.is_approved = True
    db.commit()
    return {"ok": True}


@router.post("/leads/{lead_id}/send")
async def send_email(lead_id: str, db: Session = Depends(get_db)):
    """Send step-1 email via connected Gmail account."""
    from models import UserIntegration
    from email_providers.dispatcher import dispatch_email

    email = db.query(Email).filter(
        Email.lead_id == lead_id, Email.sequence_step == 1
    ).first()
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not email or not lead:
        raise HTTPException(status_code=404, detail="Not found")

    if not lead.contact_email:
        raise HTTPException(status_code=400, detail="Lead has no email address — add one first.")

    integration = db.query(UserIntegration).filter(
        UserIntegration.provider == "gmail"
    ).first()
    if not integration:
        raise HTTPException(
            status_code=400,
            detail="No Gmail account connected. Go to Settings → Integrations to connect Gmail."
        )

    try:
        await dispatch_email(lead.contact_email, email.subject, email.body, integration)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    email.is_sent = True
    email.sent_at = datetime.now()
    lead.status = "contacted"
    db.commit()
    return {"ok": True}


@router.post("/leads/{lead_id}/simulate-open")
def simulate_open(lead_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(
        Email.lead_id == lead_id, Email.sequence_step == 1
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    email.open_count = (email.open_count or 0) + 1
    email.opened_at = datetime.now()
    db.commit()
    return {"ok": True, "open_count": email.open_count}


@router.post("/leads/{lead_id}/simulate-click")
def simulate_click(lead_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(
        Email.lead_id == lead_id, Email.sequence_step == 1
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    email.click_count = (email.click_count or 0) + 1
    email.clicked_at = datetime.now()
    db.commit()
    return {"ok": True}


@router.post("/leads/{lead_id}/simulate-reply")
async def simulate_reply(lead_id: str, db: Session = Depends(get_db)):
    """Generate a realistic mock reply via OpenAI and trigger full reply flow."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    email = db.query(Email).filter(
        Email.lead_id == lead_id, Email.sequence_step == 1
    ).first()
    campaign = db.query(Campaign).filter(Campaign.id == lead.campaign_id).first()

    from ai.scoring import get_client
    import json as json_lib

    # Generate realistic reply
    reply_response = await get_client().chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Simulate a realistic reply to a cold sales email. Always return valid JSON."},
            {
                "role": "user",
                "content": f"""
Simulate a reply from {lead.contact_name or 'the contact'} at {lead.company_name}.
Original email: {email.body[:400] if email else 'Hi, I noticed your company...'}

Return: {{"reply": "<realistic 2-4 sentence reply>", "classification": "<Interested|Objection|Wrong person|Out of office>"}}

Make it realistic — maybe 60% interested, 25% objection, 15% other.
                """,
            },
        ],
    )
    reply_data = json_lib.loads(reply_response.choices[0].message.content)
    reply_text = reply_data.get("reply", "Thanks for reaching out. Can you tell me more?")
    classification = reply_data.get("classification", "Interested")

    # Generate follow-up draft
    product = db.query(Product).filter(Product.id == campaign.product_id).first() if campaign else None
    product_desc = (product.description if product else campaign.company_description) or "our product"

    reply_draft = await generate_reply_draft(
        product_description=product_desc,
        original_email=email.body if email else "",
        reply_content=reply_text,
        reply_classification=classification,
        lead_name=lead.contact_name or "there",
        company_name=lead.company_name or "your company",
    )

    if email:
        email.reply_content = reply_text
        email.reply_classification = classification
        email.reply_draft = reply_draft
        email.replied_at = datetime.now()

    lead.status = "replied"
    db.commit()

    return {
        "reply": reply_text,
        "classification": classification,
        "reply_draft": reply_draft,
    }


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


@router.get("/inbox")
def get_inbox(db: Session = Depends(get_db)):
    """All leads that have replied, across all campaigns, sorted by reply date."""
    emails_with_replies = (
        db.query(Email)
        .filter(Email.reply_content.isnot(None))
        .order_by(Email.replied_at.desc())
        .all()
    )
    result = []
    for email in emails_with_replies:
        lead = db.query(Lead).filter(Lead.id == email.lead_id).first()
        campaign = db.query(Campaign).filter(Campaign.id == lead.campaign_id).first() if lead else None
        result.append({
            "email_id": str(email.id),
            "lead_id": str(lead.id) if lead else None,
            "contact_name": lead.contact_name or lead.company_name or "Unknown",
            "contact_title": lead.contact_title,
            "company_name": lead.company_name,
            "campaign_name": campaign.name if campaign else "Unknown campaign",
            "campaign_id": str(campaign.id) if campaign else None,
            "subject": email.subject,
            "original_body": email.body,
            "reply_content": email.reply_content,
            "reply_classification": email.reply_classification,
            "reply_draft": email.reply_draft,
            "replied_at": email.replied_at.isoformat() if email.replied_at else None,
            "sent_at": email.sent_at.isoformat() if email.sent_at else None,
            "is_read": lead.status != "replied",
        })
    return result
