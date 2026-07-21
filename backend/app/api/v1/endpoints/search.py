from fastapi import APIRouter, HTTPException

from app.schemas.search import SearchQuery, SearchResponse
from app.services.document_engine.search_service import SearchService

router = APIRouter()
search_service = SearchService()

@router.post("", response_model=SearchResponse)
async def semantic_search(query: SearchQuery):
    """
    Perform a semantic search across all indexed documents using FAISS and SentenceTransformers.
    """
    try:
        results = search_service.search(query)
        return SearchResponse(query=query.query, results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
