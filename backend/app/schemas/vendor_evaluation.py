from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class VendorProposalInput(BaseModel):
    vendor_name: str
    compliance_report_id: str
    compliance_score: float
    price: float
    delivery_timeline_weeks: int
    warranty_months: int
    certifications: List[str] = []
    technical_summary: str = ""
    gemini_analysis_summary: str = ""

class EvaluationRequest(BaseModel):
    rfq_id: str
    vendors: List[VendorProposalInput]

class VendorRank(BaseModel):
    rank: int
    vendor_name: str
    overall_score: float
    technical_score: float
    commercial_score: float
    delivery_score: float
    risk_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    
    model_config = ConfigDict(from_attributes=True)

class AIRecommendationSummary(BaseModel):
    category: str
    insight: str

class EvaluationReport(BaseModel):
    report_id: str
    rfq_id: str
    recommended_vendor: str
    vendors: List[VendorRank]
    procurement_summary: str
    recommendations: List[AIRecommendationSummary] = []
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)
