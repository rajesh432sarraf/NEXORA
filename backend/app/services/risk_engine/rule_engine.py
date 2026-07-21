from typing import List
from app.schemas.procurement_risk import ProcurementRiskInput

class RiskRuleEngine:
    """
    Evaluates basic deterministic procurement rules.
    Returns a list of identified risk flags.
    """
    
    def evaluate_rules(self, data: ProcurementRiskInput) -> List[str]:
        identified_risks = []
        
        # Delivery Rules
        if data.delivery_delay_days > 30:
            identified_risks.append("DELIVERY: Extreme delivery delay (>30 days)")
        elif data.delivery_delay_days > 14:
            identified_risks.append("DELIVERY: Moderate delivery delay (>14 days)")
            
        # Compliance Rules
        if data.compliance_score < 70:
            identified_risks.append("COMPLIANCE: High compliance risk (Score < 70)")
        elif data.compliance_score < 85:
            identified_risks.append("COMPLIANCE: Moderate compliance risk (Score < 85)")
            
        # Commercial Rules
        if data.commercial_score < 50:
            identified_risks.append("COMMERCIAL: High commercial risk (Poor pricing competitiveness)")
            
        # Technical Rules
        if data.technical_score < 70:
            identified_risks.append("TECHNICAL: High technical risk (Score < 70)")
        if data.number_of_deviations > 10:
            identified_risks.append("TECHNICAL: Excessive technical deviations (>10)")
            
        # Documentation & Warranty Rules
        if not data.has_warranty:
            identified_risks.append("WARRANTY: Missing warranty terms")
        if data.missing_mandatory_certs:
            identified_risks.append("DOCUMENTATION: Missing mandatory certifications")
            
        return identified_risks
