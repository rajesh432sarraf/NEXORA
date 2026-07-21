from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.rfq import RFQCreate, RFQUpdate, RFQResponse
from app.services.rfq_service import RFQService

router = APIRouter()

@router.post("", response_model=RFQResponse, status_code=status.HTTP_201_CREATED, summary="Create a new RFQ")
async def create_rfq(
    rfq_in: RFQCreate,
    db: AsyncSession = Depends(get_db)
):
    return await RFQService.create_rfq(db=db, rfq_in=rfq_in)

@router.get("", response_model=List[RFQResponse], summary="List all RFQs")
async def get_rfqs(
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    return await RFQService.get_rfqs(db=db, project_id=project_id, skip=skip, limit=limit)

@router.get("/{rfq_id}", response_model=RFQResponse, summary="Get RFQ by ID")
async def get_rfq(
    rfq_id: str,
    db: AsyncSession = Depends(get_db)
):
    rfq = await RFQService.get_rfq_by_id(db=db, rfq_id=rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    return rfq

@router.put("/{rfq_id}", response_model=RFQResponse, summary="Update RFQ")
async def update_rfq(
    rfq_id: str,
    rfq_in: RFQUpdate,
    db: AsyncSession = Depends(get_db)
):
    rfq = await RFQService.update_rfq(db=db, rfq_id=rfq_id, rfq_in=rfq_in)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    return rfq

@router.delete("/{rfq_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete RFQ")
async def delete_rfq(
    rfq_id: str,
    db: AsyncSession = Depends(get_db)
):
    deleted = await RFQService.delete_rfq(db=db, rfq_id=rfq_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    return None
