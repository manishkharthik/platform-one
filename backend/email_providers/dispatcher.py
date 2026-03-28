from email_providers.gmail_sender import send_via_gmail


async def dispatch_email(to: str, subject: str, body: str, integration) -> dict:
    """
    Send an email using the connected Gmail integration.
    `integration` is a UserIntegration ORM object.
    """
    if not integration:
        raise ValueError("No email provider connected. Please connect Gmail first.")

    token_data = {
        "access_token": integration.access_token,
        "refresh_token": integration.refresh_token,
    }

    result = await send_via_gmail(to, subject, body, token_data)

    # Update stored access token if it was refreshed
    if result.get("access_token") and result["access_token"] != integration.access_token:
        integration.access_token = result["access_token"]

    return result
