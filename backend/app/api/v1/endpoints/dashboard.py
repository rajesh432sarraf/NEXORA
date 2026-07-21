from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.dashboard import DashboardStats
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/stats", response_model=DashboardStats, status_code=status.HTTP_200_OK, summary="Get global platform dashboard analytics")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db)
):
    return await DashboardService.get_platform_stats(db=db)
