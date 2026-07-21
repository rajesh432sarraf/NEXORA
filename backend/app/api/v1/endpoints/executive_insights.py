from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.executive_insights import ExecutiveInsightsRequest, ExecutiveReport
from app.repositories.executive_repository import ExecutiveRepository, get_executive_repository
from app.services.executive_insights.insights_engine import ExecutiveInsightsEngine

router = APIRouter()

def get_insights_engine(repository: ExecutiveRepository = Depends(get_executive_repository)) -> ExecutiveInsightsEngine:
    return ExecutiveInsightsEngine(repository)

@router.post("/generate", response_model=ExecutiveReport)
async def generate_executive_insights(
    request: ExecutiveInsightsRequest,
    engine: ExecutiveInsightsEngine = Depends(get_insights_engine)
):
    """
    Generates a high-level Executive Insights report from aggregated cross-module data.
    """
    try:
        report = await engine.generate_insights(request)
        return report
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[ExecutiveReport])
async def list_executive_reports(
    repository: ExecutiveRepository = Depends(get_executive_repository)
):
    """
    Lists all previously generated executive reports.
    """
    try:
        reports = await repository.get_all_reports()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=ExecutiveReport)
async def get_executive_report(
    report_id: str,
    repository: ExecutiveRepository = Depends(get_executive_repository)
):
    """
    Retrieves a specific executive report by ID.
    """
    report = await repository.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Executive report not found.")
    return report
