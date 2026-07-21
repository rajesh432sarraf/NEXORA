from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    rfq_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    budget = Column(Float, nullable=True)
    status = Column(String, default="DRAFT", nullable=False)
    due_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)

    project = relationship("Project", backref="rfqs")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
