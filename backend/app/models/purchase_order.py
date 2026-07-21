from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    po_number = Column(String, unique=True, index=True, nullable=False)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    vendor_name = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="ISSUED", nullable=False)
    issued_date = Column(Date, nullable=True)
    delivery_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    project = relationship("Project", backref="purchase_orders")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
