from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.timeline import MilestoneCreate, MilestoneUpdate, MilestoneResponse
from app.services.timeline_service import TimelineService

router = APIRouter()

@router.post("", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED, summary="Create a new project milestone")
async def create_milestone(
    milestone_in: MilestoneCreate,
    db: AsyncSession = Depends(get_db)
):
    return await TimelineService.create_milestone(db=db, milestone_in=milestone_in)

@router.get("", response_model=List[MilestoneResponse], summary="List all project milestones")
async def get_milestones(
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    return await TimelineService.get_milestones(db=db, project_id=project_id, skip=skip, limit=limit)

@router.get("/{milestone_id}", response_model=MilestoneResponse, summary="Get milestone by ID")
async def get_milestone(
    milestone_id: str,
    db: AsyncSession = Depends(get_db)
):
    m = await TimelineService.get_milestone_by_id(db=db, milestone_id=milestone_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return m

@router.put("/{milestone_id}", response_model=MilestoneResponse, summary="Update milestone")
async def update_milestone(
    milestone_id: str,
    milestone_in: MilestoneUpdate,
    db: AsyncSession = Depends(get_db)
):
    m = await TimelineService.update_milestone(db=db, milestone_id=milestone_id, milestone_in=milestone_in)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return m

@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete milestone")
async def delete_milestone(
    milestone_id: str,
    db: AsyncSession = Depends(get_db)
):
    deleted = await TimelineService.delete_milestone(db=db, milestone_id=milestone_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return None
