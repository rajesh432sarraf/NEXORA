from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.sql import text, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class Project(Base):
    __tablename__ = 'projects'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=True) # made nullable for compat
    name = Column(String(200), nullable=False)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(20), nullable=False, server_default=text("'draft'::character varying"))
    created_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    # Backward compatibility
    @property
    def project_name(self): return self.name
    @project_name.setter
    def project_name(self, val): self.name = val

    @property
    def client_name(self): return None
    @client_name.setter
    def client_name(self, val): pass

    @property
    def location(self): return None
    @location.setter
    def location(self, val): pass

    @property
    def project_type(self): return None
    @project_type.setter
    def project_type(self, val): pass

    @property
    def budget(self): return None
    @budget.setter
    def budget(self, val): pass
