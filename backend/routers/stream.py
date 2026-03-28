from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from agents.pipeline import get_queue
import asyncio

router = APIRouter()


@router.get("/campaigns/{campaign_id}/stream")
async def stream_events(campaign_id: str):
    async def event_generator():
        q = get_queue(campaign_id)
        while True:
            try:
                message = await asyncio.wait_for(q.get(), timeout=60.0)
                yield f"data: {message}\n\n"
                if message == "__DONE__":
                    break
            except asyncio.TimeoutError:
                # Keepalive ping so browser doesn't drop the connection
                yield "data: ping\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked",
        },
    )
