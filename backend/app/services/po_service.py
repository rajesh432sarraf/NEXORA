import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.purchase_order import PurchaseOrder
from app.schemas.purchase_order import POCreate, POUpdate

logger = logging.getLogger(__name__)

class POService:
    @staticmethod
    async def create_po(db: AsyncSession, po_in: POCreate) -> PurchaseOrder:
        db_po = PurchaseOrder(**po_in.model_dump())
        db.add(db_po)
        await db.commit()
        await db.refresh(db_po)
        logger.info(f"Created Purchase Order: {db_po.po_number}")
        return db_po

    @staticmethod
    async def get_pos(db: AsyncSession, project_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[PurchaseOrder]:
        stmt = select(PurchaseOrder)
        if project_id:
            stmt = stmt.where(PurchaseOrder.project_id == project_id)
        stmt = stmt.offset(skip).limit(limit).order_by(PurchaseOrder.created_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_po_by_id(db: AsyncSession, po_id: str) -> Optional[PurchaseOrder]:
        stmt = select(PurchaseOrder).where(PurchaseOrder.id == po_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_po(db: AsyncSession, po_id: str, po_in: POUpdate) -> Optional[PurchaseOrder]:
        po = await POService.get_po_by_id(db, po_id)
        if not po:
            return None
        for field, val in po_in.model_dump(exclude_unset=True).items():
            setattr(po, field, val)
        await db.commit()
        await db.refresh(po)
        return po

    @staticmethod
    async def delete_po(db: AsyncSession, po_id: str) -> bool:
        po = await POService.get_po_by_id(db, po_id)
        if not po:
            return False
        await db.delete(po)
        await db.commit()
        return True
