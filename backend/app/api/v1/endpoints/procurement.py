from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.procurement import ProcurementCreate, ProcurementUpdate, ProcurementResponse
from app.services.procurement_service import ProcurementService

router = APIRouter()

@router.post("", response_model=ProcurementResponse, status_code=status.HTTP_201_CREATED, summary="Create a new procurement item")
async def create_item(
    item_in: ProcurementCreate,
    db: AsyncSession = Depends(get_db)
):
    return await ProcurementService.create_item(db=db, item_in=item_in)

@router.get("", response_model=List[ProcurementResponse], summary="List all procurement items")
async def get_items(
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    return await ProcurementService.get_items(db=db, project_id=project_id, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=ProcurementResponse, summary="Get procurement item by ID")
async def get_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    item = await ProcurementService.get_item_by_id(db=db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement item not found")
    return item

@router.put("/{item_id}", response_model=ProcurementResponse, summary="Update procurement item")
async def update_item(
    item_id: str,
    item_in: ProcurementUpdate,
    db: AsyncSession = Depends(get_db)
):
    item = await ProcurementService.update_item(db=db, item_id=item_id, item_in=item_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement item not found")
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete procurement item")
async def delete_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    deleted = await ProcurementService.delete_item(db=db, item_id=item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement item not found")
    return None
