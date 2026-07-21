import uuid
from datetime import datetime
import logging
from fastapi import HTTPException

from app.schemas.procurement_risk import RiskAnalysisRequest, RiskReport
from app.repositories.risk_repository import RiskRepository
from app.services.risk_engine.rule_engine import RiskRuleEngine
from app.services.risk_engine.scoring_service import RiskScoringService
from app.services.risk_engine.mitigation_service import RiskMitigationService
from app.services.risk_engine.gemini_risk_service import GeminiRiskService

logger = logging.getLogger(__name__)

class ProcurementRiskEngine:
    """
    Orchestrates the Procurement Risk Evaluation pipeline.
    """
    
    def __init__(self, repository: RiskRepository):
        self.repository = repository
        self.rule_engine = RiskRuleEngine()
        self.scoring_service = RiskScoringService()
        self.mitigation_service = RiskMitigationService()
        self.gemini_service = GeminiRiskService()

    async def evaluate_risk(self, request: RiskAnalysisRequest) -> RiskReport:
        vendor_data = request.vendor_data
        
        # 1. Rule-Based Evaluation
        identified_risks = self.rule_engine.evaluate_rules(vendor_data)
        
        # 2. Risk Scoring & Classification
        overall_score, overall_level, del_risk, tech_risk, comm_risk, comp_risk = self.scoring_service.calculate_scores(
            vendor_data, identified_risks
        )
        
        # 3. Deterministic Mitigations
        mitigations = self.mitigation_service.generate_mitigations(identified_risks)
        
        # 4. Deep AI Risk Analysis
        ai_analysis, summary = await self.gemini_service.analyze_risk(vendor_data, identified_risks)
        
        # Merge AI insights into risks if available
        if ai_analysis and "hidden_risks" in ai_analysis:
            for hidden in ai_analysis["hidden_risks"]:
                identified_risks.append(f"AI IDENTIFIED: {hidden}")
                
        # 5. Compile Final Report
        report = RiskReport(
            report_id=str(uuid.uuid4()),
            project_id=request.project_id,
            vendor_name=vendor_data.vendor_name,
            overall_risk_score=overall_score,
            overall_risk_level=overall_level,
            delivery_risk=del_risk,
            technical_risk=tech_risk,
            commercial_risk=comm_risk,
            compliance_risk=comp_risk,
            identified_risks=identified_risks,
            mitigation_actions=mitigations,
            executive_summary=summary,
            gemini_analysis=ai_analysis,
            created_at=datetime.utcnow().isoformat()
        )
        
        # 6. Save via Repository
        await self.repository.save_report(report)
        
        return report
