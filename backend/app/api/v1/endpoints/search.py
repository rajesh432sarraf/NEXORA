from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.search import SearchRequest, SearchResponse
from app.services.rag_service import RAGService

router = APIRouter()

@router.post("", response_model=SearchResponse, status_code=status.HTTP_200_OK, summary="RAG Vector Search across project PDFs")
async def search_documents(
    search_in: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes RAG Vector Similarity Search on ingested document passages and returns AI synthesized answers.
    Supports filtering by `project_id`.
    """
    try:
        response = await RAGService.search_and_answer(
            db=db,
            query=search_in.query,
            project_id=search_in.project_id,
            top_k=search_in.top_k or 5,
            generate_answer=search_in.generate_answer if search_in.generate_answer is not None else True
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )
