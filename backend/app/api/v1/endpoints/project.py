from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import ProjectService

router = APIRouter()

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create a new project")
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new EPC project entry.
    """
    try:
        project = await ProjectService.create_project(db=db, project_in=project_in)
        return project
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )

@router.get("", response_model=List[ProjectResponse], summary="Get all projects")
async def get_projects(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max number of items to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a paginated list of all projects.
    """
    return await ProjectService.get_projects(db=db, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=ProjectResponse, summary="Get project by ID")
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve details of a specific project by ID.
    """
    project = await ProjectService.get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.put("/{project_id}", response_model=ProjectResponse, summary="Update project")
async def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing project's fields.
    """
    project = await ProjectService.update_project(db=db, project_id=project_id, project_in=project_in)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete project")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a project by ID.
    """
    deleted = await ProjectService.delete_project(db=db, project_id=project_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return None
