from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class POBase(BaseModel):
    po_number: str = Field(..., min_length=1)
    project_id: str
    vendor_name: str = Field(..., min_length=1)
    total_amount: float = Field(..., ge=0)
    status: Optional[str] = "ISSUED"
    issued_date: Optional[date] = None
    delivery_date: Optional[date] = None
    notes: Optional[str] = None

class POCreate(POBase):
    pass

class POUpdate(BaseModel):
    vendor_name: Optional[str] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    issued_date: Optional[date] = None
    delivery_date: Optional[date] = None
    notes: Optional[str] = None

class POResponse(POBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
