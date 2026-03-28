from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import campaigns, leads, stream, documents, products
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FishHook")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(stream.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
