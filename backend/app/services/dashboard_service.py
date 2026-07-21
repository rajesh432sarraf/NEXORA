import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.project import Project
from app.models.document import Document
from app.models.user import User

logger = logging.getLogger(__name__)

class DashboardService:
    @staticmethod
    async def get_platform_stats(db: AsyncSession) -> dict:
        res = await db.execute(select(func.count(Project.id)))
        total_projects = res.scalar() or 0

        res = await db.execute(select(func.count(Project.id)).where(Project.status == "IN_PROGRESS"))
        active_projects = res.scalar() or 0

        res = await db.execute(select(func.count(Project.id)).where(Project.status == "COMPLETED"))
        completed_projects = res.scalar() or 0

        res = await db.execute(select(func.sum(Project.budget)))
        total_budget = float(res.scalar() or 0.0)

        res = await db.execute(select(func.count(Document.id)))
        total_documents = res.scalar() or 0

        res = await db.execute(select(func.count(User.id)))
        total_users = res.scalar() or 0

        return {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "total_budget": total_budget,
            "total_documents": total_documents,
            "total_users": total_users
        }
