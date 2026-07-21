import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

logger = logging.getLogger(__name__)

class ProjectService:
    @staticmethod
    async def create_project(db: AsyncSession, project_in: ProjectCreate) -> Project:
        """
        Creates a new Project record in the database.
        """
        db_project = Project(**project_in.model_dump())
        db.add(db_project)
        await db.commit()
        await db.refresh(db_project)
        logger.info(f"Created project: {db_project.id} - {db_project.project_name}")
        return db_project

    @staticmethod
    async def get_projects(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        Retrieves a paginated list of projects.
        """
        stmt = select(Project).offset(skip).limit(limit).order_by(Project.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_project_by_id(db: AsyncSession, project_id: str) -> Optional[Project]:
        """
        Retrieves a single project by its unique ID.
        """
        stmt = select(Project).where(Project.id == project_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_project(
        db: AsyncSession, project_id: str, project_in: ProjectUpdate
    ) -> Optional[Project]:
        """
        Updates an existing project record with provided non-null fields.
        """
        db_project = await ProjectService.get_project_by_id(db, project_id)
        if not db_project:
            return None

        update_data = project_in.model_dump(exclude_unset=True)
        if not update_data:
            return db_project

        for field, value in update_data.items():
            setattr(db_project, field, value)

        await db.commit()
        await db.refresh(db_project)
        logger.info(f"Updated project: {project_id}")
        return db_project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: str) -> bool:
        """
        Deletes a project record by ID. Returns True if deleted, False if not found.
        """
        db_project = await ProjectService.get_project_by_id(db, project_id)
        if not db_project:
            return False

        await db.delete(db_project)
        await db.commit()
        logger.info(f"Deleted project: {project_id}")
        return True
