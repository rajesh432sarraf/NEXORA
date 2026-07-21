import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.timeline import Milestone
from app.schemas.timeline import MilestoneCreate, MilestoneUpdate

logger = logging.getLogger(__name__)

class TimelineService:
    @staticmethod
    async def create_milestone(db: AsyncSession, milestone_in: MilestoneCreate) -> Milestone:
        db_m = Milestone(**milestone_in.model_dump())
        db.add(db_m)
        await db.commit()
        await db.refresh(db_m)
        logger.info(f"Created Milestone: {db_m.title}")
        return db_m

    @staticmethod
    async def get_milestones(db: AsyncSession, project_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Milestone]:
        stmt = select(Milestone)
        if project_id:
            stmt = stmt.where(Milestone.project_id == project_id)
        stmt = stmt.offset(skip).limit(limit).order_by(Milestone.start_date.asc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_milestone_by_id(db: AsyncSession, milestone_id: str) -> Optional[Milestone]:
        stmt = select(Milestone).where(Milestone.id == milestone_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_milestone(db: AsyncSession, milestone_id: str, milestone_in: MilestoneUpdate) -> Optional[Milestone]:
        m = await TimelineService.get_milestone_by_id(db, milestone_id)
        if not m:
            return None
        for field, val in milestone_in.model_dump(exclude_unset=True).items():
            setattr(m, field, val)
        await db.commit()
        await db.refresh(m)
        return m

    @staticmethod
    async def delete_milestone(db: AsyncSession, milestone_id: str) -> bool:
        m = await TimelineService.get_milestone_by_id(db, milestone_id)
        if not m:
            return False
        await db.delete(m)
        await db.commit()
        return True
