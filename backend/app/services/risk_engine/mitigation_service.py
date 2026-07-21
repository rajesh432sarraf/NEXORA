from typing import List

class RiskMitigationService:
    """
    Suggests mitigation strategies based on identified risk rules.
    """
    
    def generate_mitigations(self, identified_risks: List[str]) -> List[str]:
        mitigations = []
        
        for risk in identified_risks:
            if "Extreme delivery delay" in risk:
                mitigations.append("Negotiate expedited shipping or find secondary supplier for critical path items.")
            elif "Moderate delivery delay" in risk:
                mitigations.append("Add penalty clauses for further schedule slips in the contract.")
            
            if "compliance risk" in risk:
                mitigations.append("Request a revised technical proposal addressing all deviations.")
                
            if "commercial risk" in risk:
                mitigations.append("Initiate commercial negotiations to align pricing with market expectations.")
                
            if "Excessive technical deviations" in risk:
                mitigations.append("Schedule a deep-dive technical alignment meeting with vendor engineers.")
                
            if "WARRANTY" in risk:
                mitigations.append("Mandate a standard 2-year minimum warranty in the purchase order terms.")
                
            if "DOCUMENTATION" in risk:
                mitigations.append("Hold 10% of payment until all mandatory certifications are provided.")
                
        # Deduplicate
        return list(dict.fromkeys(mitigations))
