import uuid
from datetime import datetime
import logging
from fastapi import HTTPException

from app.schemas.vendor_evaluation import EvaluationRequest, EvaluationReport
from app.repositories.vendor_repository import VendorEvaluationRepository
from app.services.vendor_evaluation.scoring_service import VendorScoringService
from app.services.vendor_evaluation.ranking_service import VendorRankingService
from app.services.vendor_evaluation.recommendation_service import VendorRecommendationService

logger = logging.getLogger(__name__)

class VendorEvaluationEngine:
    """
    Orchestrates the Vendor Evaluation and Ranking process.
    """
    
    def __init__(self, repository: VendorEvaluationRepository):
        self.repository = repository
        self.scoring_service = VendorScoringService()
        self.ranking_service = VendorRankingService()
        self.recommendation_service = VendorRecommendationService()

    async def evaluate_vendors(self, request: EvaluationRequest) -> EvaluationReport:
        if not request.vendors:
            raise HTTPException(status_code=400, detail="No vendors provided for evaluation.")
            
        # 1. Base Scoring
        scores_map = self.scoring_service.score_vendors(request.vendors)
        
        # 2. AI Insights & Risk Assessment
        ai_insights, summary, recommendations = await self.recommendation_service.generate_insights(request.vendors)
        
        # 3. Ranking
        ranked_vendors = self.ranking_service.rank_vendors(request.vendors, scores_map, ai_insights)
        
        recommended_vendor = ranked_vendors[0].vendor_name if ranked_vendors else "None"
        
        # 4. Compile Report
        report = EvaluationReport(
            report_id=str(uuid.uuid4()),
            rfq_id=request.rfq_id,
            recommended_vendor=recommended_vendor,
            vendors=ranked_vendors,
            procurement_summary=summary,
            recommendations=recommendations,
            created_at=datetime.utcnow().isoformat()
        )
        
        # 5. Save Report
        await self.repository.save_report(report)
        
        return report
