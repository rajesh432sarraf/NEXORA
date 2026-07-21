from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language search query")
    project_id: Optional[str] = Field(None, description="Optional project ID to filter search results")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Max number of matching passages to retrieve")
    generate_answer: Optional[bool] = Field(True, description="Whether to generate AI RAG synthesized answer")

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5

class SearchResultItem(BaseModel):
    document_id: str
    filename: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    chunk_id: Optional[str] = None
    score: float
    snippet: Optional[str] = None
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SearchResponse(BaseModel):
    query: str
    project_id: Optional[str] = None
    answer: Optional[str] = None
    total_matches: Optional[int] = 0
    results: List[SearchResultItem]

    model_config = ConfigDict(from_attributes=True)
