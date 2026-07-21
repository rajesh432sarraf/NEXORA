from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional

class ChunkMetadata(BaseModel):
    document_id: str
    chunk_id: str
    chunk_number: int
    text: str
    metadata: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)
