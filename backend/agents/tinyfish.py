import httpx
import os
import json
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

TINYFISH_BASE = "https://agent.tinyfish.ai/v1"
TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY")


async def run_tinyfish_task(url: str, goal: str) -> list[dict]:
    """
    Run a TinyFish browser automation task via SSE endpoint.
    Returns the list of items from the COMPLETE event's result.
    """
    headers = {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
    }

    final_items = []
    async with httpx.AsyncClient(timeout=180.0) as client:
        async with client.stream(
            "POST",
            f"{TINYFISH_BASE}/automation/run-sse",
            headers=headers,
            json={"url": url, "goal": goal},
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if not data:
                    continue
                try:
                    event = json.loads(data)
                    if isinstance(event, dict) and event.get("type") == "COMPLETE":
                        result = event.get("result", {})
                        if isinstance(result, list):
                            final_items = result
                        elif isinstance(result, dict):
                            # TinyFish uses dynamic key names (e.g. "trending_repositories", "companies")
                            # Grab the first list value we find
                            for v in result.values():
                                if isinstance(v, list) and v:
                                    final_items = v
                                    break
                                elif isinstance(v, str):
                                    parsed = _try_parse_list(v)
                                    if parsed:
                                        final_items = parsed
                                        break
                except json.JSONDecodeError:
                    pass

    return final_items


def _try_parse_list(text: str) -> list[dict]:
    """Try to extract a JSON array from a string."""
    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
    except Exception:
        pass
    start = text.find("[")
    end = text.rfind("]") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except Exception:
            pass
    return []


