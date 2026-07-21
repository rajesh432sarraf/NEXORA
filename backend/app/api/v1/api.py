from fastapi import APIRouter
from app.api.v1.endpoints import document, project, search, compliance

api_router = APIRouter()
api_router.include_router(document.router, prefix="/documents", tags=["documents"])
api_router.include_router(project.router, prefix="/projects", tags=["projects"])
api_router.include_router(search.router, prefix="/documents/search", tags=["search"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
