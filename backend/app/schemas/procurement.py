from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class ProcurementBase(BaseModel):
    item_name: str = Field(..., min_length=1)
    project_id: str
    quantity: float = Field(1.0, ge=0)
    unit: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    status: Optional[str] = "PLANNED"
    notes: Optional[str] = None

class ProcurementCreate(ProcurementBase):
    pass

class ProcurementUpdate(BaseModel):
    item_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ProcurementResponse(ProcurementBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
