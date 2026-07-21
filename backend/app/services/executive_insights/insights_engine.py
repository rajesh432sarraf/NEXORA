import uuid
from datetime import datetime
import logging
from fastapi import HTTPException

from app.schemas.executive_insights import ExecutiveInsightsRequest, ExecutiveReport
from app.repositories.executive_repository import ExecutiveRepository
from app.services.executive_insights.aggregation_service import InsightAggregationService
from app.services.executive_insights.kpi_service import KPIService
from app.services.executive_insights.executive_summary_service import ExecutiveSummaryService
from app.services.executive_insights.gemini_insights_service import GeminiInsightsService

logger = logging.getLogger(__name__)

class ExecutiveInsightsEngine:
    """
    Orchestrates the Executive AI Insights Pipeline.
    """
    
    def __init__(self, repository: ExecutiveRepository):
        self.repository = repository
        self.aggregation_service = InsightAggregationService()
        self.kpi_service = KPIService()
        self.summary_service = ExecutiveSummaryService()
        self.gemini_service = GeminiInsightsService()

    async def generate_insights(self, request: ExecutiveInsightsRequest) -> ExecutiveReport:
        
        # 1. Aggregate cross-module data
        raw_data = await self.aggregation_service.fetch_project_data(request.project_id, request.rfq_id)
        
        # 2. Calculate KPIs
        kpis = self.kpi_service.calculate_kpis(raw_data)
        
        # 3. Determine Overall Health & Score
        score, health = self.summary_service.evaluate_health(kpis)
        
        # 4. Generate AI Narrative
        summary, risks, actions = await self.gemini_service.generate_executive_insights(kpis, health, score)
        
        # 5. Compile Executive Report
        report = ExecutiveReport(
            report_id=str(uuid.uuid4()),
            project_id=request.project_id,
            rfq_id=request.rfq_id,
            overall_procurement_health=health,
            overall_score=score,
            executive_summary=summary,
            top_vendor=kpis.highest_ranked_vendor,
            overall_risk_level=kpis.procurement_risk_level,
            critical_risks=risks,
            recommended_actions=actions,
            kpis=kpis,
            created_at=datetime.utcnow().isoformat()
        )
        
        # 6. Save Report
        await self.repository.save_report(report)
        
        return report
