import httpx
import os
import json
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

TINYFISH_BASE = "https://api.tinyfish.ai"
TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY")


async def run_tinyfish_task(task: str, max_steps: int = 15) -> list[dict]:
    """Generic TinyFish agent runner. Returns parsed list of results."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{TINYFISH_BASE}/v1/agent/run",
            headers={"Authorization": f"Bearer {TINYFISH_API_KEY}"},
            json={"task": task, "max_steps": max_steps},
        )
        response.raise_for_status()
        result = response.json()
        output = result.get("output") or result.get("result") or "[]"
        if isinstance(output, str):
            try:
                return json.loads(output)
            except Exception:
                return []
        return output if isinstance(output, list) else []


async def scrape_producthunt(industry: str) -> list[dict]:
    results = await run_tinyfish_task(f"""
        Go to producthunt.com and browse the {industry} category.
        Find the top 8 products launched in the last 90 days.
        For each product extract:
        - name (string)
        - tagline (string)
        - website (string, full URL)
        - description (string, 1-2 sentences)
        - upvotes (number)
        Return ONLY a JSON array, no other text.
    """)
    for r in results:
        r["source"] = "producthunt"
    return results


async def scrape_crunchbase(industry: str, size: str) -> list[dict]:
    results = await run_tinyfish_task(f"""
        Go to crunchbase.com/discover/organizations and search for companies in {industry}.
        Look for companies with approximately {size} employees.
        Extract 8 companies with:
        - name (string)
        - website (string)
        - description (string)
        - funding_stage (string, e.g. seed/series-a/unknown)
        - employee_count (string)
        - location (string)
        Return ONLY a JSON array, no other text.
    """, max_steps=20)
    for r in results:
        r["source"] = "crunchbase"
    return results


async def scrape_hn_hiring(keywords: list[str]) -> list[dict]:
    kw = ", ".join(keywords)
    results = await run_tinyfish_task(f"""
        Go to news.ycombinator.com and find the most recent thread titled
        "Ask HN: Who is hiring?".
        Find companies in that thread that are hiring for roles related to: {kw}.
        For each matching company extract:
        - name (string)
        - website (string, if mentioned)
        - description (string, what they do based on the post)
        - role (string, the job title they're hiring for)
        - location (string)
        Limit to 8 results. Return ONLY a JSON array, no other text.
    """)
    for r in results:
        r["source"] = "hn_hiring"
    return results


async def scrape_github_trending(topic: str) -> list[dict]:
    results = await run_tinyfish_task(f"""
        Go to github.com/trending and filter by topic or language related to {topic}.
        Find the top 6 trending repositories.
        For each extract:
        - name (string, repo name)
        - owner (string, github username or org)
        - website (string, full github URL)
        - description (string)
        - stars (number)
        - language (string)
        Return ONLY a JSON array, no other text.
    """)
    for r in results:
        r["source"] = "github"
    return results
