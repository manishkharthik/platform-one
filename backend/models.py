from sqlalchemy import Column, String, Integer, Text, Boolean, TIMESTAMP, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import uuid
from datetime import datetime


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    company_description = Column(Text, nullable=False)
    target_industry = Column(String(255))
    target_company_size = Column(String(100))
    target_job_titles = Column(ARRAY(Text))
    target_keywords = Column(ARRAY(Text))
    status = Column(String(50), default="pending")
    created_at = Column(TIMESTAMP, default=datetime.now)


class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"))
    company_name = Column(String(255))
    company_url = Column(String(500))
    company_description = Column(Text)
    company_size = Column(String(100))
    industry = Column(String(255))
    funding_stage = Column(String(100))
    location = Column(String(255))
    contact_title = Column(String(255))
    icp_score = Column(Integer)
    icp_reasoning = Column(Text)
    source = Column(String(100))
    raw_data = Column(JSONB)
    status = Column(String(50), default="new")
    created_at = Column(TIMESTAMP, default=datetime.now)


class Email(Base):
    __tablename__ = "emails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"))
    subject = Column(String(500))
    body = Column(Text)
    sequence_step = Column(Integer, default=1)
    is_edited = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.now)
