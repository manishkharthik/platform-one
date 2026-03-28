# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: FishHook

AI-powered B2B lead generation agent. Users upload a product doc → OpenAI extracts their ICP → TinyFish agents crawl 4 live web sources in parallel → OpenAI scores and enriches each lead → 3-step cold email sequences are drafted automatically.

**Hackathon:** TinyFish $2M Pre-Accelerator

---

## Running the App

### Backend (FastAPI)
```bash
cd backend
/opt/anaconda3/envs/fishhook/bin/uvicorn main:app --reload --port 8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev        # http://localhost:3000
npm run build
```

### Environment Variables
Add these to the root `.env`:
```
DATABASE_URL=postgresql://...        # Supabase connection (already set)
TINYFISH_API_KEY=...                 # TinyFish agent API key
OPENAI_API_KEY=...                   # OpenAI key
RESEND_API_KEY=...                   # (kept from previous project, optional)
```

The backend loads `.env` from the project root via `find_dotenv()`.

### Python Environment
Use the `fishhook` conda env: `/opt/anaconda3/envs/fishhook/bin/python`
Install deps: `/opt/anaconda3/envs/fishhook/bin/pip install -r backend/requirements.txt`

---

## Architecture

```
backend/
├── main.py              FastAPI app, CORS, router registration
├── database.py          SQLAlchemy engine + SessionLocal + get_db
├── models.py            Campaign, Lead, Email (SQLAlchemy ORM)
├── schemas.py           Pydantic schemas (CampaignCreate, CampaignResponse)
├── agents/
│   ├── tinyfish.py      4 scraper functions (ProductHunt, Crunchbase, HN, GitHub)
│   └── pipeline.py      Parallel scrape → score → email pipeline + SSE queue
├── ai/
│   ├── icp_extractor.py Upload doc → OpenAI → extract ICP fields
│   ├── scoring.py       OpenAI: score lead 0-100, extract metadata
│   └── emails.py        OpenAI: draft 3-step cold email sequence
└── routers/
    ├── campaigns.py     CRUD + run + export CSV
    ├── leads.py         Get lead, update status, regenerate emails
    ├── stream.py        SSE stream endpoint (GET /api/campaigns/{id}/stream)
    └── documents.py     File upload → ICP extraction (POST /api/documents/upload)

frontend/src/
├── App.jsx              React Router routes
├── api/client.js        All fetch calls in one place
└── pages/
    ├── ICPSetup.jsx     Step 1: file upload → Step 2: review/edit extracted ICP
    ├── AgentFeed.jsx    SSE live log of TinyFish activity
    ├── LeadDashboard.jsx Lead table with score badges, filters, export
    ├── LeadDetail.jsx   Company card + status + 3-tab email editor
    └── Integrations.jsx Mock Gmail/Slack/Linear/HubSpot connect + pipeline Kanban
```

## Key Flow

1. `POST /api/documents/upload` → returns extracted `icp` object
2. `POST /api/campaigns` → create campaign with ICP
3. `POST /api/campaigns/{id}/run` → kicks off background pipeline
4. `GET /api/campaigns/{id}/stream` → SSE feed of live agent activity
5. `GET /api/campaigns/{id}/leads` → leads sorted by ICP score desc
6. `GET /api/leads/{id}` → lead + emails

## Pipeline Details

`agents/pipeline.py:run_discovery_pipeline_task` is the background task entry point — it creates its own DB session (avoids FastAPI request-scoped session issue). It runs all 4 TinyFish scrapers in parallel via `asyncio.gather`, then scores/enriches each lead with OpenAI, drafts emails for leads scoring ≥60, and emits SSE events throughout.

If all TinyFish scrapers fail, the pipeline falls back to `backend/mock_leads.json` (10 pre-scraped leads for demo safety).

## Database

PostgreSQL on Supabase. Tables are auto-created on startup via `Base.metadata.create_all(bind=engine)`.

Lead statuses: `new` → `contacted` → `replied` → `qualified` → `meeting booked` → `rejected`
