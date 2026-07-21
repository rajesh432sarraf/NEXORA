from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.procurement_risk import RiskAnalysisRequest, RiskReport
from app.repositories.risk_repository import RiskRepository, get_risk_repository
from app.services.risk_engine.risk_engine import ProcurementRiskEngine

router = APIRouter()

def get_risk_engine(repository: RiskRepository = Depends(get_risk_repository)) -> ProcurementRiskEngine:
    return ProcurementRiskEngine(repository)

@router.post("/analyze", response_model=RiskReport)
async def analyze_procurement_risk(
    request: RiskAnalysisRequest,
    engine: ProcurementRiskEngine = Depends(get_risk_engine)
):
    """
    Analyzes vendor and project parameters to generate a comprehensive Procurement Risk Report.
    """
    try:
        report = await engine.evaluate_risk(request)
        return report
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[RiskReport])
async def list_risk_reports(
    repository: RiskRepository = Depends(get_risk_repository)
):
    """
    Lists all previously generated risk prediction reports.
    """
    try:
        reports = await repository.get_all_reports()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=RiskReport)
async def get_risk_report(
    report_id: str,
    repository: RiskRepository = Depends(get_risk_repository)
):
    """
    Retrieves a specific risk report by ID.
    """
    report = await repository.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Risk report not found.")
    return report
