from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import campaigns, leads, stream, documents, products
from database import engine, Base
import logging

app = FastAPI(title="FishHook")

@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logging.warning(f"DB init skipped (connection failed): {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(stream.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
