from sqlalchemy import Column, String, Integer, Text, Boolean, TIMESTAMP, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import uuid
from datetime import datetime


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    raw_content = Column(Text)
    description = Column(Text)
    value_proposition = Column(Text)
    pain_points = Column(ARRAY(Text))
    target_industries = Column(ARRAY(Text))
    target_company_size = Column(String(255))
    target_job_titles = Column(ARRAY(Text))
    buying_signals = Column(ARRAY(Text))
    keywords = Column(ARRAY(Text))
    competitors = Column(ARRAY(Text))
    created_at = Column(TIMESTAMP, default=datetime.now)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    goal = Column(Text, nullable=True)
    company_description = Column(Text, nullable=True)
    target_industry = Column(String(255))
    target_company_size = Column(String(100))
    target_job_titles = Column(ARRAY(Text))
    target_keywords = Column(ARRAY(Text))
    funding_stage = Column(String(100), nullable=True)
    geography = Column(String(255), nullable=True)
    custom_signal = Column(Text, nullable=True)
    email_subject = Column(String(500), nullable=True)
    email_body = Column(Text, nullable=True)
    followup1_body = Column(Text, nullable=True)
    followup2_body = Column(Text, nullable=True)
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
    contact_name = Column(String(255), nullable=True)
    contact_title = Column(String(255))
    contact_email = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
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
    is_approved = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(TIMESTAMP, nullable=True)
    open_count = Column(Integer, default=0)
    opened_at = Column(TIMESTAMP, nullable=True)
    click_count = Column(Integer, default=0)
    clicked_at = Column(TIMESTAMP, nullable=True)
    reply_content = Column(Text, nullable=True)
    reply_classification = Column(String(50), nullable=True)
    reply_draft = Column(Text, nullable=True)
    replied_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.now)
