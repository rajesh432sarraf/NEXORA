import uuid
from sqlalchemy import Column, String, JSON, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.session import Base

class AIReport(Base):
    __tablename__ = 'ai_reports'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(String(255), nullable=False, unique=True, index=True)
    report_type = Column(String(50), nullable=False, index=True)
    report_data = Column(JSONB, nullable=False)
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
