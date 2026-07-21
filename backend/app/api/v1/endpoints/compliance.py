from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.compliance import ComplianceComparisonRequest, ComplianceReport
from app.repositories.compliance_repository import ComplianceRepository, get_compliance_repository
from app.services.compliance.compliance_engine import ComplianceEngine

router = APIRouter()

def get_compliance_engine(repository: ComplianceRepository = Depends(get_compliance_repository)) -> ComplianceEngine:
    return ComplianceEngine(repository)

@router.post("/compare", response_model=ComplianceReport)
async def compare_documents(
    request: ComplianceComparisonRequest,
    db: AsyncSession = Depends(get_db),
    engine: ComplianceEngine = Depends(get_compliance_engine)
):
    """
    Compares a Specification Document against a Vendor Proposal.
    Generates a structured Compliance Report with AI recommendations.
    """
    try:
        report = await engine.generate_compliance_report(
            spec_doc_id=request.spec_document_id,
            vendor_doc_id=request.vendor_document_id,
            db=db
        )
        return report
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[ComplianceReport])
async def list_compliance_reports(
    repository: ComplianceRepository = Depends(get_compliance_repository)
):
    """
    Lists all previously generated compliance reports.
    """
    try:
        reports = await repository.get_all_reports()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=ComplianceReport)
async def get_compliance_report(
    report_id: str,
    repository: ComplianceRepository = Depends(get_compliance_repository)
):
    """
    Retrieves a specific compliance report by ID.
    """
    report = await repository.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found.")
    return report
