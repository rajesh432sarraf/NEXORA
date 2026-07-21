import asyncio
import json

from app.schemas.executive_insights import ExecutiveInsightsRequest
from app.services.executive_insights.insights_engine import ExecutiveInsightsEngine
from app.repositories.executive_repository import JsonExecutiveRepository

async def test_executive_insights():
    repo = JsonExecutiveRepository()
    engine = ExecutiveInsightsEngine(repo)
    
    request = ExecutiveInsightsRequest(
        project_id="PROJ-2026-07",
        rfq_id="RFQ-HVAC-001"
    )
    
    print("Generating Executive AI Insights...")
    report = await engine.generate_insights(request)
    
    print("\n=== EXECUTIVE PROCUREMENT REPORT ===")
    print(f"Health: {report.overall_procurement_health} ({report.overall_score}/100)")
    print(f"Overall Risk Level: {report.overall_risk_level}")
    print(f"Top Recommended Vendor: {report.top_vendor}")
    
    print("\n--- KPIs ---")
    print(f"Total Vendors Evaluated: {report.kpis.total_vendors_evaluated}")
    print(f"Average Compliance Score: {report.kpis.average_compliance_score}%")
    print(f"Average Delivery Timeline: {report.kpis.average_delivery_timeline_weeks} weeks")
    print(f"High Risk Vendors: {report.kpis.number_of_high_risk_vendors}")
    
    print("\n--- Executive Summary ---")
    print(report.executive_summary)
    
    print("\n--- Critical Risks ---")
    for r in report.critical_risks:
        print(f" - {r}")
        
    print("\n--- Recommended Actions ---")
    for a in report.recommended_actions:
        print(f" - {a}")
        
    print(f"\nSaved to repository. Total executive reports in history: {len(await repo.get_all_reports())}")

if __name__ == "__main__":
    asyncio.run(test_executive_insights())
