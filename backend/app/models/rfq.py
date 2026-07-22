from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.sql import text, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class RFQ(Base):
    __tablename__ = 'rfqs'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    rfq_document_id = Column(String, ForeignKey('documents.id', ondelete='RESTRICT'), nullable=True) # nullable for compat
    title = Column(String(200), nullable=False, default="Untitled RFQ")
    description = Column(Text)
    issue_date = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    deadline_date = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    status = Column(String(20), nullable=False, server_default=text("'draft'::character varying"))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project', backref='rfqs')
    rfq_document = relationship('Document')

    # Backward compatibility
    @property
    def rfq_number(self): return self.id
    @rfq_number.setter
    def rfq_number(self, val): pass

    @property
    def budget(self): return None
    @budget.setter
    def budget(self, val): pass

    @property
    def due_date(self): return self.deadline_date
    @due_date.setter
    def due_date(self, val): self.deadline_date = val
