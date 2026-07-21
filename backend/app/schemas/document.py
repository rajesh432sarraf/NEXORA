from pydantic import BaseModel, ConfigDict, computed_field
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    content_type: str
    file_size: int

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentResponse(DocumentBase):
    id: str
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Internal text field
    extracted_text: Optional[str] = None

    @computed_field
    @property
    def text_preview(self) -> Optional[str]:
        if self.extracted_text:
            return self.extracted_text[:200] + "..." if len(self.extracted_text) > 200 else self.extracted_text
        return None

    model_config = ConfigDict(from_attributes=True)
