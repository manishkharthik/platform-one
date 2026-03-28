import asyncio
import json
import os
from pathlib import Path
from models import Campaign, Lead, Email
from agents.tinyfish import (
    scrape_producthunt,
    scrape_crunchbase,
    scrape_hn_hiring,
    scrape_github_trending,
)
from ai.scoring import enrich_and_score_lead
from ai.emails import draft_email_sequence

# In-memory SSE event queue per campaign
sse_queues: dict[str, asyncio.Queue] = {}


def get_queue(campaign_id: str) -> asyncio.Queue:
    if campaign_id not in sse_queues:
        sse_queues[campaign_id] = asyncio.Queue()
    return sse_queues[campaign_id]


async def emit(campaign_id: str, message: str):
    q = get_queue(campaign_id)
    await q.put(message)


def load_mock_leads() -> list[dict]:
    mock_path = Path(__file__).parent.parent / "mock_leads.json"
    if mock_path.exists():
        with open(mock_path) as f:
            return json.load(f)
    return []


async def run_discovery_pipeline_task(campaign_id: str):
    """Entry point for background task — creates its own DB session."""
    from database import SessionLocal

    db = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign:
            await run_discovery_pipeline(campaign, db)
    finally:
        db.close()


async def run_discovery_pipeline(campaign: Campaign, db):
    cid = str(campaign.id)
    campaign.status = "running"
    db.commit()

    await emit(cid, f"🚀 Starting FishHook pipeline for: {campaign.name}")
    await emit(cid, "🔍 Launching TinyFish agents across 4 sources...")

    tasks = [
        scrape_producthunt(campaign.target_industry or "SaaS"),
        scrape_crunchbase(
            campaign.target_industry or "SaaS",
            campaign.target_company_size or "10-200",
        ),
        scrape_hn_hiring(campaign.target_keywords or [campaign.target_industry or "tech"]),
        scrape_github_trending(campaign.target_industry or "tech"),
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    raw_leads = []
    source_names = ["Product Hunt", "Crunchbase", "HN Hiring", "GitHub"]
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            await emit(cid, f"⚠️ {source_names[i]} scrape failed: {str(result)[:80]}")
        else:
            await emit(cid, f"✅ {source_names[i]}: found {len(result)} companies")
            raw_leads.extend(result)

    # Fallback to mock data if all scrapers failed
    if not raw_leads:
        await emit(cid, "⚠️ All scrapers failed — using mock data for demo")
        raw_leads = load_mock_leads()
        for r in raw_leads:
            r.setdefault("source", "mock")

    await emit(cid, f"📊 Total raw leads: {len(raw_leads)} — starting enrichment...")

    qualified_count = 0
    for raw in raw_leads:
        company_name = raw.get("name") or raw.get("company_name") or "Unknown"
        await emit(cid, f"🤖 Scoring: {company_name}...")

        try:
            lead = await enrich_and_score_lead(raw, campaign)
            lead.campaign_id = campaign.id
            db.add(lead)
            db.commit()
            db.refresh(lead)

            score = lead.icp_score
            indicator = "🟢" if score >= 80 else "🟡" if score >= 60 else "🔴"
            await emit(cid, f"{indicator} {company_name} — score: {score}/100")

            if score >= 60:
                await emit(cid, f"✍️  Drafting email sequence for {company_name}...")
                emails = await draft_email_sequence(lead, campaign)
                for email in emails:
                    db.add(email)
                db.commit()
                qualified_count += 1

        except Exception as e:
            await emit(cid, f"⚠️ Failed to process {company_name}: {str(e)[:80]}")
            continue

    campaign.status = "complete"
    db.commit()

    await emit(
        cid,
        f"🎉 Done! {len(raw_leads)} leads discovered, {qualified_count} qualified with email sequences.",
    )
    await emit(cid, "__DONE__")
