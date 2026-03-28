import asyncio
import json
import os
from pathlib import Path
from models import Campaign, Lead, Email, Product
from agents.tinyfish import run_tinyfish_task, _try_parse_list
from ai.scraping_planner import generate_scraping_plan
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

    # Fetch product for full ICP context
    product = None
    if campaign.product_id:
        product = db.query(Product).filter(Product.id == campaign.product_id).first()

    # Use OpenAI to generate a dynamic scraping plan
    await emit(cid, "🧠 Planning scraping strategy with AI...")
    plan, reasoning = await generate_scraping_plan(campaign, product)
    if reasoning:
        await emit(cid, f"💡 Strategy: {reasoning}")
    await emit(cid, f"🔍 Launching TinyFish agents across {len(plan)} sources...")
    for task in plan:
        await emit(cid, f"   → {task['source']}: {task['url']}")

    # Run scrapers in parallel batches — fast but keeps SSE alive between batches
    BATCH_SIZE = 5
    raw_leads = []
    batches = [plan[i:i + BATCH_SIZE] for i in range(0, len(plan), BATCH_SIZE)]
    await emit(cid, f"⚡ Running {len(plan)} sources in batches of {BATCH_SIZE}...")

    for batch_num, batch in enumerate(batches, 1):
        await emit(cid, f"📦 Batch {batch_num}/{len(batches)}: {', '.join(t['source'] for t in batch)}")

        async def scrape_task(task):
            try:
                result = await run_tinyfish_task(task["url"], task["goal"])
                for r in result:
                    r.setdefault("source", task["source"])
                return task["source"], result, None
            except Exception as e:
                return task["source"], [], str(e)

        batch_results = await asyncio.gather(*[scrape_task(t) for t in batch])

        for source, results, error in batch_results:
            if error:
                await emit(cid, f"⚠️ {source} failed: {error[:80]}")
            else:
                await emit(cid, f"✅ {source}: found {len(results)} companies")
                raw_leads.extend(results)

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
