from typing import List
from app.schemas.compliance import MatchDetail

class ScoringService:
    """
    Calculates weighted compliance scores.
    """
    
    def __init__(self):
        # Configurable weights (0.0 to 1.0)
        self.weights = {
            "equipment": 0.40,
            "technical_parameters": 0.25,
            "certifications": 0.10,
            "warranty": 0.10,
            "delivery_timeline": 0.10,
            "commercial_conditions": 0.05
        }

    def calculate_overall_score(self, 
                                matched: List[MatchDetail], 
                                partial: List[MatchDetail], 
                                missing: List[MatchDetail]) -> float:
        """
        Calculates a simple 0-100 overall score based on counts.
        (A more advanced version would use the weights and categorize each MatchDetail).
        """
        total_items = len(matched) + len(partial) + len(missing)
        if total_items == 0:
            return 0.0
            
        score = 0.0
        # Fully matched = 100% value
        score += len(matched) * 100.0
        # Partially matched = 50% value
        score += len(partial) * 50.0
        # Missing = 0% value
        
        return round(score / total_items, 2)

    def determine_status(self, score: float) -> str:
        """Determines the compliance status string based on the score."""
        if score >= 85:
            return "Highly Compliant"
        elif score >= 50:
            return "Partially Compliant"
        else:
            return "Non-Compliant"
