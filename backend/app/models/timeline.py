from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class Milestone(Base):
    __tablename__ = 'milestones'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    milestone_name = Column(String(200), nullable=False)
    original_date = Column(Date)
    predicted_date = Column(Date)
    predicted_delay_days = Column(Integer, nullable=False, server_default=text("0"))
    reason = Column(Text)
    predicted_at = Column(DateTime(True), nullable=False, server_default=text("now()"))

    project = relationship('Project', backref='schedule_predictions')

    # Backward compatibility
    @property
    def title(self): return self.milestone_name
    @title.setter
    def title(self, val): self.milestone_name = val

    @property
    def start_date(self): return self.original_date
    @start_date.setter
    def start_date(self, val): self.original_date = val

    @property
    def end_date(self): return self.predicted_date
    @end_date.setter
    def end_date(self, val): self.predicted_date = val

    @property
    def progress_percentage(self): return 0.0
    @progress_percentage.setter
    def progress_percentage(self, val): pass

    @property
    def status(self): return "NOT_STARTED"
    @status.setter
    def status(self, val): pass

    @property
    def description(self): return self.reason
    @description.setter
    def description(self, val): self.reason = val

    @property
    def created_at(self): return self.predicted_at
    @property
    def updated_at(self): return self.predicted_at
