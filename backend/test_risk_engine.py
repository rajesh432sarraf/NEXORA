import asyncio
import json

from app.schemas.procurement_risk import RiskAnalysisRequest, ProcurementRiskInput
from app.services.risk_engine.risk_engine import ProcurementRiskEngine
from app.repositories.risk_repository import JsonRiskRepository

async def test_risk_evaluation():
    repo = JsonRiskRepository()
    engine = ProcurementRiskEngine(repo)
    
    # Create mock risky vendor
    vendor_data = ProcurementRiskInput(
        vendor_name="Risky Vendor LLC",
        compliance_score=68.5,       # Should trigger high compliance risk
        delivery_delay_days=35,      # Should trigger extreme delivery risk
        has_warranty=False,          # Missing warranty
        missing_mandatory_certs=True, # Missing certs
        number_of_deviations=15,     # Too many deviations
        technical_score=65.0,        # Poor technical score
        commercial_score=45.0,       # Poor commercial score
        raw_text_summary="Vendor is located in a high-risk conflict zone and requested a 30% upfront payment without bank guarantee."
    )
    
    request = RiskAnalysisRequest(
        project_id="PROJ-2026-07",
        vendor_data=vendor_data
    )
    
    print("Running Procurement Risk Engine...")
    report = await engine.evaluate_risk(request)
    
    print("\nRisk Report Generated successfully!")
    print(f"Overall Risk Score: {report.overall_risk_score}")
    print(f"Overall Risk Level: {report.overall_risk_level}")
    
    print("\n--- Sub-Risks ---")
    print(f"Delivery Risk: {report.delivery_risk.score} ({report.delivery_risk.level})")
    print(f"Technical Risk: {report.technical_risk.score} ({report.technical_risk.level})")
    print(f"Commercial Risk: {report.commercial_risk.score} ({report.commercial_risk.level})")
    print(f"Compliance Risk: {report.compliance_risk.score} ({report.compliance_risk.level})")
    
    print("\n--- Identified Risks ---")
    for r in report.identified_risks:
        print(f" - {r}")
        
    print("\n--- Mitigations ---")
    for m in report.mitigation_actions:
        print(f" - {m}")
        
    print("\n--- Gemini Executive Summary ---")
    print(report.executive_summary)
        
    print(f"\nSaved to repository. Total risk reports in history: {len(await repo.get_all_reports())}")

if __name__ == "__main__":
    asyncio.run(test_risk_evaluation())
