from typing import List, Tuple
from app.schemas.procurement_risk import ProcurementRiskInput, RiskCategory

class RiskScoringService:
    """
    Calculates numerical risk scores and translates them to risk levels.
    """
    
    def calculate_scores(self, data: ProcurementRiskInput, rules_fired: List[str]) -> Tuple[float, str, RiskCategory, RiskCategory, RiskCategory, RiskCategory]:
        # Base conversion: lower compliance/tech/comm scores = higher risk
        delivery_score = min(100.0, max(0.0, data.delivery_delay_days * 3.33)) # 30 days = 100 risk
        tech_score = max(0.0, 100.0 - data.technical_score)
        comm_score = max(0.0, 100.0 - data.commercial_score)
        comp_score = max(0.0, 100.0 - data.compliance_score)
        
        # Penalties based on rules
        for rule in rules_fired:
            if "DELIVERY" in rule:
                delivery_score = min(100.0, delivery_score + 20)
            if "TECHNICAL" in rule:
                tech_score = min(100.0, tech_score + 15)
            if "COMMERCIAL" in rule:
                comm_score = min(100.0, comm_score + 15)
            if "COMPLIANCE" in rule or "DOCUMENTATION" in rule or "WARRANTY" in rule:
                comp_score = min(100.0, comp_score + 25)
                
        # Overall risk calculation (Weighted average of risks)
        overall_score = (delivery_score * 0.3) + (tech_score * 0.3) + (comm_score * 0.2) + (comp_score * 0.2)
        overall_score = round(min(100.0, overall_score), 2)
        
        return (
            overall_score,
            self._get_level(overall_score),
            RiskCategory(score=round(delivery_score, 2), level=self._get_level(delivery_score)),
            RiskCategory(score=round(tech_score, 2), level=self._get_level(tech_score)),
            RiskCategory(score=round(comm_score, 2), level=self._get_level(comm_score)),
            RiskCategory(score=round(comp_score, 2), level=self._get_level(comp_score))
        )
        
    def _get_level(self, score: float) -> str:
        if score >= 70:
            return "High"
        elif score >= 40:
            return "Medium"
        return "Low"
