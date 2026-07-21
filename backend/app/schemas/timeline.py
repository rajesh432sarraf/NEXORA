from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class MilestoneBase(BaseModel):
    title: str = Field(..., min_length=1)
    project_id: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress_percentage: Optional[float] = Field(0.0, ge=0.0, le=100.0)
    status: Optional[str] = "NOT_STARTED"
    description: Optional[str] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    status: Optional[str] = None
    description: Optional[str] = None

class MilestoneResponse(MilestoneBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
