from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from models import Email, Lead, UserIntegration
from email_providers.dispatcher import dispatch_email

router = APIRouter()


class ReplyRequest(BaseModel):
    email_id: str
    body: str


@router.post("/inbox/reply")
async def send_reply(req: ReplyRequest, db: Session = Depends(get_db)):
    """Send a reply email via the user's connected Gmail account."""
    email = db.query(Email).filter(Email.id == req.email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    lead = db.query(Lead).filter(Lead.id == email.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if not lead.contact_email:
        raise HTTPException(status_code=400, detail="Lead has no email address")

    integration = db.query(UserIntegration).filter(
        UserIntegration.provider == "gmail"
    ).first()
    if not integration:
        raise HTTPException(
            status_code=400,
            detail="No Gmail account connected. Go to Settings to connect Gmail."
        )

    subject = f"Re: {email.subject}" if email.subject else "Following up"
    try:
        result = await dispatch_email(lead.contact_email, subject, req.body, integration)
        db.commit()  # save any refreshed token
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Mark original email as replied-to
    email.replied_at = datetime.now()
    lead.status = "replied"
    db.commit()

    return {"ok": True, "message_id": result.get("message_id")}
