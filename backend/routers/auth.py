import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import UserIntegration
from email_providers.gmail_sender import get_oauth_url, exchange_code

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _redirect_uri(request_base: str = None) -> str:
    base = os.getenv("BACKEND_URL", "http://localhost:8000")
    return f"{base}/api/auth/gmail/callback"


@router.get("/auth/gmail")
def gmail_oauth_start():
    """Redirect user to Google OAuth consent screen."""
    redirect_uri = _redirect_uri()
    url = get_oauth_url(redirect_uri)
    return RedirectResponse(url)


@router.get("/auth/gmail/callback")
def gmail_oauth_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback, store token, redirect to frontend."""
    redirect_uri = _redirect_uri()
    try:
        token_data = exchange_code(code, redirect_uri)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {e}")

    # Upsert integration (replace existing Gmail connection if any)
    existing = db.query(UserIntegration).filter(
        UserIntegration.provider == "gmail",
        UserIntegration.email == token_data["email"],
    ).first()

    if existing:
        existing.access_token = token_data["access_token"]
        existing.refresh_token = token_data.get("refresh_token") or existing.refresh_token
    else:
        db.add(UserIntegration(
            provider="gmail",
            email=token_data["email"],
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
        ))
    db.commit()

    return RedirectResponse(f"{FRONTEND_URL}/dashboard?gmail=connected&email={token_data['email']}")


@router.get("/auth/status")
def auth_status(db: Session = Depends(get_db)):
    """Return which email providers are connected."""
    gmail = db.query(UserIntegration).filter(UserIntegration.provider == "gmail").first()
    return {
        "gmail": {"connected": bool(gmail), "email": gmail.email if gmail else None},
    }


@router.delete("/auth/gmail")
def disconnect_gmail(db: Session = Depends(get_db)):
    """Disconnect Gmail integration."""
    db.query(UserIntegration).filter(UserIntegration.provider == "gmail").delete()
    db.commit()
    return {"ok": True}
