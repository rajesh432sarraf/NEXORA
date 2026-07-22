from sqlalchemy import Column, String, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class PurchaseOrder(Base):
    __tablename__ = 'purchase_orders'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey('rfqs.id', ondelete='CASCADE'), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id', ondelete='RESTRICT'), nullable=True) # nullable for compat if not loaded
    proposal_document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='RESTRICT'), nullable=True)
    submitted_at = Column(DateTime(True))
    status = Column(String(20), nullable=False, server_default=text("'draft'::character varying"))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    rfq = relationship('RFQ', backref='proposals')

    # Backward compatibility
    @property
    def po_number(self): return self.id
    @po_number.setter
    def po_number(self, val): pass

    @property
    def project_id(self): return None
    @project_id.setter
    def project_id(self, val): pass

    @property
    def vendor_name(self): return "Unknown Vendor"
    @vendor_name.setter
    def vendor_name(self, val): pass

    @property
    def total_amount(self): return 0.0
    @total_amount.setter
    def total_amount(self, val): pass

    @property
    def issued_date(self): return self.submitted_at
    @issued_date.setter
    def issued_date(self, val): self.submitted_at = val

    @property
    def delivery_date(self): return None
    @delivery_date.setter
    def delivery_date(self, val): pass

    @property
    def notes(self): return None
    @notes.setter
    def notes(self, val): pass
