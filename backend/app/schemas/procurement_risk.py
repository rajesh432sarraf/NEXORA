from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any

class ProcurementRiskInput(BaseModel):
    vendor_name: str
    compliance_score: float
    delivery_delay_days: int
    has_warranty: bool
    missing_mandatory_certs: bool
    number_of_deviations: int
    technical_score: float
    commercial_score: float
    raw_text_summary: str = ""

class RiskAnalysisRequest(BaseModel):
    project_id: str
    vendor_data: ProcurementRiskInput

class RiskCategory(BaseModel):
    score: float = Field(..., description="0-100 score where higher means higher risk")
    level: str = Field(..., description="Low, Medium, or High")

class RiskReport(BaseModel):
    report_id: str
    project_id: str
    vendor_name: str
    
    overall_risk_score: float
    overall_risk_level: str
    
    delivery_risk: RiskCategory
    technical_risk: RiskCategory
    commercial_risk: RiskCategory
    compliance_risk: RiskCategory
    
    identified_risks: List[str] = []
    mitigation_actions: List[str] = []
    
    executive_summary: str
    gemini_analysis: Dict[str, Any] = {}
    
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)
