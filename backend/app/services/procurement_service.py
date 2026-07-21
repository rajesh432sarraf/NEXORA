import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.procurement import ProcurementItem
from app.schemas.procurement import ProcurementCreate, ProcurementUpdate

logger = logging.getLogger(__name__)

class ProcurementService:
    @staticmethod
    async def create_item(db: AsyncSession, item_in: ProcurementCreate) -> ProcurementItem:
        db_item = ProcurementItem(**item_in.model_dump())
        db.add(db_item)
        await db.commit()
        await db.refresh(db_item)
        logger.info(f"Created Procurement Item: {db_item.item_name}")
        return db_item

    @staticmethod
    async def get_items(db: AsyncSession, project_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[ProcurementItem]:
        stmt = select(ProcurementItem)
        if project_id:
            stmt = stmt.where(ProcurementItem.project_id == project_id)
        stmt = stmt.offset(skip).limit(limit).order_by(ProcurementItem.created_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_item_by_id(db: AsyncSession, item_id: str) -> Optional[ProcurementItem]:
        stmt = select(ProcurementItem).where(ProcurementItem.id == item_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_item(db: AsyncSession, item_id: str, item_in: ProcurementUpdate) -> Optional[ProcurementItem]:
        item = await ProcurementService.get_item_by_id(db, item_id)
        if not item:
            return None
        for field, val in item_in.model_dump(exclude_unset=True).items():
            setattr(item, field, val)
        await db.commit()
        await db.refresh(item)
        return item

    @staticmethod
    async def delete_item(db: AsyncSession, item_id: str) -> bool:
        item = await ProcurementService.get_item_by_id(db, item_id)
        if not item:
            return False
        await db.delete(item)
        await db.commit()
        return True
