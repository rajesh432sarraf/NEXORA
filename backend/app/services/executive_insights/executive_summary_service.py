from typing import Tuple
from app.schemas.executive_insights import ExecutiveKPIs

class ExecutiveSummaryService:
    """
    Evaluates the base procurement health and overall score based on KPIs.
    """
    
    def evaluate_health(self, kpis: ExecutiveKPIs) -> Tuple[float, str]:
        # Simple weighted logic to generate a high-level health score
        # Start at 100
        score = 100.0
        
        # Penalties
        score -= (100.0 - kpis.average_compliance_score) * 0.5
        score -= (kpis.missing_certifications * 5.0)
        score -= (kpis.number_of_high_risk_vendors * 3.0)
        score -= (kpis.delayed_procurement_packages * 10.0)
        
        if kpis.procurement_risk_level == "High":
            score -= 15.0
        elif kpis.procurement_risk_level == "Medium":
            score -= 5.0
            
        score = round(max(0.0, min(100.0, score)), 2)
        
        if score >= 85:
            health = "Excellent"
        elif score >= 70:
            health = "Good"
        elif score >= 50:
            health = "Fair"
        else:
            health = "Poor"
            
        return score, health
