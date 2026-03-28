import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
]

def _client_config():
    return {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }

def get_oauth_url(redirect_uri: str) -> str:
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
    flow.redirect_uri = redirect_uri
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    return auth_url

def exchange_code(code: str, redirect_uri: str) -> dict:
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
    flow.redirect_uri = redirect_uri
    flow.fetch_token(code=code)
    creds = flow.credentials

    service = build("oauth2", "v2", credentials=creds)
    user_info = service.userinfo().get().execute()

    return {
        "access_token": creds.token,
        "refresh_token": creds.refresh_token,
        "email": user_info.get("email"),
    }

def _build_service(token_data: dict):
    creds = Credentials(
        token=token_data["access_token"],
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        scopes=SCOPES,
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return build("gmail", "v1", credentials=creds), creds

async def send_via_gmail(to: str, subject: str, body: str, token_data: dict) -> dict:
    service, creds = _build_service(token_data)

    msg = MIMEMultipart("alternative")
    msg["to"] = to
    msg["subject"] = subject
    html = body.replace("\n", "<br>") if "<" not in body else body
    msg.attach(MIMEText(body, "plain"))
    msg.attach(MIMEText(f"<div style='font-family:sans-serif;font-size:14px;line-height:1.6'>{html}</div>", "html"))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    result = service.users().messages().send(userId="me", body={"raw": raw}).execute()

    return {"message_id": result.get("id"), "access_token": creds.token}
