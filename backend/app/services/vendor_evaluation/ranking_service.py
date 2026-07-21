from typing import List, Dict
from app.schemas.vendor_evaluation import VendorProposalInput, VendorRank

class VendorRankingService:
    """
    Assigns ranks to vendors based on their calculated scores.
    """
    
    def rank_vendors(self, vendors: List[VendorProposalInput], scores_map: Dict[str, dict], ai_insights: Dict[str, dict]) -> List[VendorRank]:
        """
        Merges scores and AI insights, sorts them, and assigns ranks.
        """
        ranked_list = []
        
        for v in vendors:
            scores = scores_map.get(v.vendor_name, {})
            insights = ai_insights.get(v.vendor_name, {})
            
            # Update risk score if AI adjusted it
            risk_score = scores.get("risk_score", 100.0)
            if "risk_penalty" in insights:
                risk_score -= insights["risk_penalty"]
                risk_score = max(0.0, risk_score)
                # Recalculate overall score slightly if risk is penalized
                overall = scores.get("overall_score", 0.0) - (insights["risk_penalty"] * 0.05)
                scores["overall_score"] = round(overall, 2)
                scores["risk_score"] = round(risk_score, 2)
            
            rank_obj = VendorRank(
                rank=0, # Will be set during sort
                vendor_name=v.vendor_name,
                overall_score=scores.get("overall_score", 0.0),
                technical_score=scores.get("technical_score", 0.0),
                commercial_score=scores.get("commercial_score", 0.0),
                delivery_score=scores.get("delivery_score", 0.0),
                risk_score=scores.get("risk_score", 0.0),
                strengths=insights.get("strengths", []),
                weaknesses=insights.get("weaknesses", [])
            )
            ranked_list.append(rank_obj)
            
        # Sort by overall score descending
        ranked_list.sort(key=lambda x: x.overall_score, reverse=True)
        
        # Assign ranks
        for i, rank_obj in enumerate(ranked_list):
            rank_obj.rank = i + 1
            
        return ranked_list
