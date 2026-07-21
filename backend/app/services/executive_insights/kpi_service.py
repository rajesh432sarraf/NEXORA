from typing import Dict, Any
from app.schemas.executive_insights import ExecutiveKPIs

class KPIService:
    """
    Calculates the required Executive KPIs from aggregated raw data.
    """
    
    def calculate_kpis(self, data: Dict[str, Any]) -> ExecutiveKPIs:
        comp_scores = data.get("compliance_scores", [])
        avg_comp = sum(comp_scores) / len(comp_scores) if comp_scores else 0.0
        
        deliveries = data.get("delivery_timelines", [])
        avg_del = sum(deliveries) / len(deliveries) if deliveries else 0.0
        
        warranties = data.get("warranty_months", [])
        avg_war = sum(warranties) / len(warranties) if warranties else 0.0
        
        return ExecutiveKPIs(
            total_vendors_evaluated=data.get("total_vendors", 0),
            average_compliance_score=round(avg_comp, 2),
            highest_ranked_vendor=data.get("highest_ranked_vendor", "N/A"),
            procurement_risk_level=data.get("procurement_risk_level", "Unknown"),
            number_of_high_risk_vendors=data.get("high_risk_vendors_count", 0),
            average_delivery_timeline_weeks=round(avg_del, 2),
            average_warranty_months=round(avg_war, 2),
            missing_certifications=data.get("vendors_missing_certs", 0),
            delayed_procurement_packages=data.get("delayed_packages", 0),
            compliance_distribution=data.get("compliance_distribution", {}),
            vendor_ranking_distribution=data.get("vendor_rankings", {})
        )
