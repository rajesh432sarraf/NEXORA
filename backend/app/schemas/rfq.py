from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class RFQBase(BaseModel):
    rfq_number: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    project_id: str
    budget: Optional[float] = Field(None, ge=0)
    status: Optional[str] = "DRAFT"
    due_date: Optional[date] = None
    description: Optional[str] = None

class RFQCreate(RFQBase):
    pass

class RFQUpdate(BaseModel):
    title: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None

class RFQResponse(RFQBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
