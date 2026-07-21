from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.purchase_order import POCreate, POUpdate, POResponse
from app.services.po_service import POService

router = APIRouter()

@router.post("", response_model=POResponse, status_code=status.HTTP_201_CREATED, summary="Create a new Purchase Order")
async def create_po(
    po_in: POCreate,
    db: AsyncSession = Depends(get_db)
):
    return await POService.create_po(db=db, po_in=po_in)

@router.get("", response_model=List[POResponse], summary="List all Purchase Orders")
async def get_pos(
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    return await POService.get_pos(db=db, project_id=project_id, skip=skip, limit=limit)

@router.get("/{po_id}", response_model=POResponse, summary="Get Purchase Order by ID")
async def get_po(
    po_id: str,
    db: AsyncSession = Depends(get_db)
):
    po = await POService.get_po_by_id(db=db, po_id=po_id)
    if not po:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")
    return po

@router.put("/{po_id}", response_model=POResponse, summary="Update Purchase Order")
async def update_po(
    po_id: str,
    po_in: POUpdate,
    db: AsyncSession = Depends(get_db)
):
    po = await POService.update_po(db=db, po_id=po_id, po_in=po_in)
    if not po:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")
    return po

@router.delete("/{po_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Purchase Order")
async def delete_po(
    po_id: str,
    db: AsyncSession = Depends(get_db)
):
    deleted = await POService.delete_po(db=db, po_id=po_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")
    return None
