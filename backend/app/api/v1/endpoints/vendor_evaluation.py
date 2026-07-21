from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.vendor_evaluation import EvaluationRequest, EvaluationReport
from app.repositories.vendor_repository import VendorEvaluationRepository, get_vendor_repository
from app.services.vendor_evaluation.evaluation_engine import VendorEvaluationEngine

router = APIRouter()

def get_evaluation_engine(repository: VendorEvaluationRepository = Depends(get_vendor_repository)) -> VendorEvaluationEngine:
    return VendorEvaluationEngine(repository)

@router.post("/evaluate", response_model=EvaluationReport)
async def evaluate_vendors(
    request: EvaluationRequest,
    engine: VendorEvaluationEngine = Depends(get_evaluation_engine)
):
    """
    Evaluates multiple vendors against an RFQ and generates a ranked procurement report.
    """
    try:
        report = await engine.evaluate_vendors(request)
        return report
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[EvaluationReport])
async def list_evaluation_reports(
    repository: VendorEvaluationRepository = Depends(get_vendor_repository)
):
    """
    Lists all previously generated vendor evaluation reports.
    """
    try:
        reports = await repository.get_all_reports()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=EvaluationReport)
async def get_evaluation_report(
    report_id: str,
    repository: VendorEvaluationRepository = Depends(get_vendor_repository)
):
    """
    Retrieves a specific evaluation report by ID.
    """
    report = await repository.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Vendor evaluation report not found.")
    return report
