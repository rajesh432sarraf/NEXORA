from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class ProjectBase(BaseModel):
    project_name: str = Field(..., min_length=1, description="Name of the EPC project")
    client_name: Optional[str] = Field(None, description="Client or owner organization name")
    location: Optional[str] = Field(None, description="Physical location or site")
    project_type: Optional[str] = Field(None, description="Type of project e.g. EPC, Construction, Infrastructure")
    budget: Optional[float] = Field(None, ge=0, description="Allocated budget for the project")
    start_date: Optional[date] = Field(None, description="Target or actual start date")
    end_date: Optional[date] = Field(None, description="Target or actual completion date")
    status: Optional[str] = Field("PLANNING", description="Project status")
    description: Optional[str] = Field(None, description="Detailed description of project scope")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = Field(None, min_length=1)
    client_name: Optional[str] = None
    location: Optional[str] = None
    project_type: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
