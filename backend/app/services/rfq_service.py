import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.rfq import RFQ
from app.schemas.rfq import RFQCreate, RFQUpdate

logger = logging.getLogger(__name__)

class RFQService:
    @staticmethod
    async def create_rfq(db: AsyncSession, rfq_in: RFQCreate) -> RFQ:
        db_rfq = RFQ(**rfq_in.model_dump())
        db.add(db_rfq)
        await db.commit()
        await db.refresh(db_rfq)
        logger.info(f"Created RFQ: {db_rfq.rfq_number}")
        return db_rfq

    @staticmethod
    async def get_rfqs(db: AsyncSession, project_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[RFQ]:
        stmt = select(RFQ)
        if project_id:
            stmt = stmt.where(RFQ.project_id == project_id)
        stmt = stmt.offset(skip).limit(limit).order_by(RFQ.created_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_rfq_by_id(db: AsyncSession, rfq_id: str) -> Optional[RFQ]:
        stmt = select(RFQ).where(RFQ.id == rfq_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_rfq(db: AsyncSession, rfq_id: str, rfq_in: RFQUpdate) -> Optional[RFQ]:
        rfq = await RFQService.get_rfq_by_id(db, rfq_id)
        if not rfq:
            return None
        for field, val in rfq_in.model_dump(exclude_unset=True).items():
            setattr(rfq, field, val)
        await db.commit()
        await db.refresh(rfq)
        return rfq

    @staticmethod
    async def delete_rfq(db: AsyncSession, rfq_id: str) -> bool:
        rfq = await RFQService.get_rfq_by_id(db, rfq_id)
        if not rfq:
            return False
        await db.delete(rfq)
        await db.commit()
        return True
