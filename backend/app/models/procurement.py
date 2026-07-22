from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.sql import text, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class ProcurementItem(Base):
    __tablename__ = 'boq_items'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    item_code = Column(String(100))
    description = Column(Text, nullable=False)
    unit = Column(String(30))
    quantity = Column(Numeric(14, 3), nullable=False, server_default=text("0"))
    unit_rate = Column(Numeric(14, 2))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    document = relationship('Document', backref='boq_items')

    # Backward compatibility
    @property
    def item_name(self): return self.description
    @item_name.setter
    def item_name(self, val): self.description = val

    @property
    def project_id(self): return None
    @project_id.setter
    def project_id(self, val): pass

    @property
    def estimated_cost(self): return float(self.quantity * self.unit_rate) if self.unit_rate else 0.0
    @estimated_cost.setter
    def estimated_cost(self, val): pass

    @property
    def actual_cost(self): return None
    @actual_cost.setter
    def actual_cost(self, val): pass

    @property
    def status(self): return "PLANNED"
    @status.setter
    def status(self, val): pass

    @property
    def notes(self): return None
    @notes.setter
    def notes(self, val): pass

    @property
    def updated_at(self): return self.created_at
    @updated_at.setter
    def updated_at(self, val): pass
