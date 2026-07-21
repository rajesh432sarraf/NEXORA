from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class ProcurementItem(Base):
    __tablename__ = "procurement_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    item_name = Column(String, nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    actual_cost = Column(Float, nullable=True)
    status = Column(String, default="PLANNED", nullable=False)
    notes = Column(Text, nullable=True)

    project = relationship("Project", backref="procurement_items")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
