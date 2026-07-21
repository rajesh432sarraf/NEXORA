from pydantic import BaseModel, Field
from typing import Optional, List

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language search query")
    project_id: Optional[str] = Field(None, description="Optional project ID to filter search results")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Max number of matching passages to retrieve")
    generate_answer: Optional[bool] = Field(True, description="Whether to generate AI RAG synthesized answer")

class SearchResultItem(BaseModel):
    document_id: str
    filename: str
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    score: float
    snippet: str

class SearchResponse(BaseModel):
    query: str
    project_id: Optional[str] = None
    answer: Optional[str] = None
    total_matches: int
    results: List[SearchResultItem]
