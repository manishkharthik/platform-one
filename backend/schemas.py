from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CampaignCreate(BaseModel):
    name: str
    company_description: str
    target_industry: Optional[str] = None
    target_company_size: Optional[str] = None
    target_job_titles: Optional[List[str]] = []
    target_keywords: Optional[List[str]] = []


class CampaignResponse(BaseModel):
    id: UUID
    name: str
    company_description: str
    target_industry: Optional[str] = None
    target_company_size: Optional[str] = None
    target_job_titles: Optional[List[str]] = None
    target_keywords: Optional[List[str]] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
