from sqlalchemy import Column, String, Float, DateTime, Text, Date
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_name = Column(String, nullable=False, index=True)
    client_name = Column(String, nullable=True)
    location = Column(String, nullable=True)
    project_type = Column(String, nullable=True)
    budget = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="PLANNING", nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
