from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text, func
from app.db.session import Base
import uuid

class Document(Base):
    __tablename__ = 'documents'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id = Column(String, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    uploaded_by_user_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    doc_type = Column(String(30), nullable=False, default="spec")
    file_name = Column(String(255), nullable=False)
    file_mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False, default=0)
    file_storage_url = Column(Text, nullable=False)
    uploaded_at = Column(DateTime(True), nullable=False, server_default=text("now()"))
    is_active = Column(Boolean, nullable=False, server_default=text("true"))

    project = relationship('Project', backref='documents')

    # Backward compatibility
    @property
    def filename(self): return self.file_name
    @filename.setter
    def filename(self, val): self.file_name = val

    @property
    def content_type(self): return self.file_mime_type
    @content_type.setter
    def content_type(self, val): self.file_mime_type = val

    @property
    def file_size(self): return self.file_size_bytes
    @file_size.setter
    def file_size(self, val): self.file_size_bytes = val

    @property
    def file_path(self): return self.file_storage_url
    @file_path.setter
    def file_path(self, val): self.file_storage_url = val

    @property
    def status(self): return "EXTRACTED"
    
    @property
    def created_at(self): return self.uploaded_at
    
    @property
    def updated_at(self): return self.uploaded_at


