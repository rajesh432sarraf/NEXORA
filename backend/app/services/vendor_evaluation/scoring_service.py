from typing import List, Dict
from app.schemas.vendor_evaluation import VendorProposalInput

class VendorScoringService:
    """
    Calculates weighted evaluation scores for vendors.
    """
    
    def __init__(self):
        # Configurable weights (0.0 to 1.0)
        self.weights = {
            "technical_compliance": 0.40,
            "commercial_price": 0.20,
            "delivery_timeline": 0.15,
            "warranty": 0.10,
            "certifications": 0.10,
            "risk_assessment": 0.05
        }

    def score_vendors(self, vendors: List[VendorProposalInput]) -> Dict[str, dict]:
        """
        Scores all vendors relative to each other (e.g. lowest price gets max score).
        Returns a dictionary mapping vendor_name -> scores.
        """
        if not vendors:
            return {}
            
        # Extract base metrics for relative scoring
        prices = [v.price for v in vendors if v.price > 0]
        min_price = min(prices) if prices else 1.0
        
        deliveries = [v.delivery_timeline_weeks for v in vendors if v.delivery_timeline_weeks > 0]
        min_delivery = min(deliveries) if deliveries else 1.0
        
        warranties = [v.warranty_months for v in vendors if v.warranty_months > 0]
        max_warranty = max(warranties) if warranties else 1.0
        
        max_certs = max([len(v.certifications) for v in vendors]) if vendors else 1
        max_certs = max_certs if max_certs > 0 else 1
        
        scores_map = {}
        
        for v in vendors:
            # Technical Score (From Compliance Engine)
            tech_score = v.compliance_score
            
            # Commercial Score (Lower price = higher score)
            comm_score = (min_price / v.price * 100.0) if v.price > 0 else 0.0
            
            # Delivery Score (Lower delivery = higher score)
            del_score = (min_delivery / v.delivery_timeline_weeks * 100.0) if v.delivery_timeline_weeks > 0 else 0.0
            
            # Warranty Score (Higher warranty = higher score)
            warr_score = (v.warranty_months / max_warranty * 100.0) if max_warranty > 0 else 0.0
            
            # Certs Score
            cert_score = (len(v.certifications) / max_certs * 100.0)
            
            # Base risk score (Can be updated later by AI)
            risk_score = 100.0
            
            # Overall Weighted Score
            overall = (
                (tech_score * self.weights["technical_compliance"]) +
                (comm_score * self.weights["commercial_price"]) +
                (del_score * self.weights["delivery_timeline"]) +
                (warr_score * self.weights["warranty"]) +
                (cert_score * self.weights["certifications"]) +
                (risk_score * self.weights["risk_assessment"])
            )
            
            scores_map[v.vendor_name] = {
                "overall_score": round(overall, 2),
                "technical_score": round(tech_score, 2),
                "commercial_score": round(comm_score, 2),
                "delivery_score": round(del_score, 2),
                "risk_score": round(risk_score, 2),
            }
            
        return scores_map
