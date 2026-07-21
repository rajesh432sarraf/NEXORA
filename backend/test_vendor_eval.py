import asyncio
import json

from app.schemas.vendor_evaluation import EvaluationRequest, VendorProposalInput
from app.services.vendor_evaluation.evaluation_engine import VendorEvaluationEngine
from app.repositories.vendor_repository import JsonVendorEvaluationRepository

async def test_vendor_evaluation():
    repo = JsonVendorEvaluationRepository()
    engine = VendorEvaluationEngine(repo)
    
    # Create mock vendors
    vendor_a = VendorProposalInput(
        vendor_name="Global HVAC Corp",
        compliance_report_id="comp_1",
        compliance_score=95.0,
        price=105000.0,
        delivery_timeline_weeks=8,
        warranty_months=60,
        certifications=["ISO 9001", "ISO 14001", "CE"],
        technical_summary="High quality equipment, fully meets specs.",
        gemini_analysis_summary="Strong proposal, no major risks."
    )
    
    vendor_b = VendorProposalInput(
        vendor_name="Budget Cooling Inc",
        compliance_report_id="comp_2",
        compliance_score=80.0,
        price=85000.0,
        delivery_timeline_weeks=12,
        warranty_months=24,
        certifications=["ISO 9001"],
        technical_summary="Meets basic specs but lacks premium features.",
        gemini_analysis_summary="Cheaper, but long delivery and short warranty."
    )
    
    vendor_c = VendorProposalInput(
        vendor_name="Speedy Supply LLC",
        compliance_report_id="comp_3",
        compliance_score=88.0,
        price=120000.0,
        delivery_timeline_weeks=4,
        warranty_months=36,
        certifications=["ISO 9001", "CE"],
        technical_summary="Very fast delivery but expensive.",
        gemini_analysis_summary="Premium price for expedited schedule."
    )
    
    request = EvaluationRequest(
        rfq_id="RFQ-2026-07-21",
        vendors=[vendor_a, vendor_b, vendor_c]
    )
    
    print("Running Vendor Evaluation Engine...")
    report = await engine.evaluate_vendors(request)
    
    print("\nEvaluation Report Generated successfully!")
    print(f"Recommended Vendor: {report.recommended_vendor}")
    print(f"Procurement Summary: {report.procurement_summary}")
    
    print("\n--- Rankings ---")
    for v in report.vendors:
        print(f"[{v.rank}] {v.vendor_name} - Overall: {v.overall_score} (Tech: {v.technical_score}, Comm: {v.commercial_score}, Risk: {v.risk_score})")
        print(f"   Strengths: {v.strengths}")
        print(f"   Weaknesses: {v.weaknesses}")
        print()
        
    print(f"Saved to repository. Total reports in history: {len(await repo.get_all_reports())}")

if __name__ == "__main__":
    asyncio.run(test_vendor_evaluation())
