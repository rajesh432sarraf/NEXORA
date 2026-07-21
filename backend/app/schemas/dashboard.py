from pydantic import BaseModel
from typing import Optional

class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_budget: float
    total_documents: int
    total_users: int

class ProjectSummaryStats(BaseModel):
    project_id: str
    project_name: str
    budget: Optional[float] = 0.0
    status: str
    document_count: int
    rfq_count: int
    po_count: int
    milestone_count: int
