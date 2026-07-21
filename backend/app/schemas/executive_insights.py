from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class ExecutiveInsightsRequest(BaseModel):
    project_id: str
    rfq_id: str

class ExecutiveKPIs(BaseModel):
    total_vendors_evaluated: int = 0
    average_compliance_score: float = 0.0
    highest_ranked_vendor: str = "N/A"
    procurement_risk_level: str = "Unknown"
    number_of_high_risk_vendors: int = 0
    average_delivery_timeline_weeks: float = 0.0
    average_warranty_months: float = 0.0
    missing_certifications: int = 0
    delayed_procurement_packages: int = 0
    compliance_distribution: Dict[str, int] = {}
    vendor_ranking_distribution: Dict[str, int] = {}

class ExecutiveReport(BaseModel):
    report_id: str
    project_id: str
    rfq_id: str
    
    overall_procurement_health: str
    overall_score: float
    
    executive_summary: str
    top_vendor: str
    overall_risk_level: str
    
    critical_risks: List[str] = []
    recommended_actions: List[str] = []
    
    kpis: ExecutiveKPIs
    
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)
