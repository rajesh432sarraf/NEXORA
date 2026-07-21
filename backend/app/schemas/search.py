from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5
    # Additional filters can be added here in the future
    # filters: Optional[Dict[str, Any]] = None

class SearchResultItem(BaseModel):
    document_id: str
    chunk_id: str
    score: float
    text: str
    metadata: Dict[str, Any]

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]

    model_config = ConfigDict(from_attributes=True)
