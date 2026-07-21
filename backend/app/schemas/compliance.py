from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class ComplianceComparisonRequest(BaseModel):
    spec_document_id: str = Field(..., description="ID of the specification document")
    vendor_document_id: str = Field(..., description="ID of the vendor proposal document")

class MatchDetail(BaseModel):
    item: str
    status: str = Field(..., description="Matched, Partial, Missing, or Extra")
    notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class AIRecommendation(BaseModel):
    category: str
    finding: str
    recommendation: str

class ComplianceReport(BaseModel):
    report_id: str
    spec_document_id: str
    vendor_document_id: str
    
    overall_score: float = Field(..., ge=0, le=100)
    status: str = Field(..., description="Highly Compliant, Partially Compliant, Non-Compliant")
    
    matched_items: List[MatchDetail] = []
    partial_matches: List[MatchDetail] = []
    missing_requirements: List[MatchDetail] = []
    extra_vendor_features: List[MatchDetail] = []
    
    risk_flags: List[str] = []
    recommendations: List[AIRecommendation] = []
    
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)
