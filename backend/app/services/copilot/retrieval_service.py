from typing import List
from app.services.document_engine.search_service import SearchService
from app.schemas.search import SearchQuery

class RetrievalService:
    """
    Connects the Copilot to the underlying FAISS search engine.
    """
    
    def __init__(self):
        # We instantiate the existing RAG modules to perform the search
        self.search_service = SearchService()

    async def retrieve_context(self, question: str, top_k: int = 5) -> List[dict]:
        """
        Queries the FAISS vector database for the most semantically relevant chunks.
        """
        query_obj = SearchQuery(query=question, top_k=top_k)
        
        # Search is synchronous in SearchService
        results = self.search_service.search(query_obj)
        
        # Results is a list of schemas.search.SearchResultItem
        return [{"text": r.text, "source": r.document_id, "score": r.score} for r in results]
