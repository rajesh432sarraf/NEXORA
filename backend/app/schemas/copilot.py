from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class CopilotChatRequest(BaseModel):
    session_id: str
    question: str

class CopilotChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    confidence: float = 1.0
    retrieved_chunks: List[str] = []

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str

class SessionContext(BaseModel):
    session_id: str
    history: List[ChatMessage] = []
    
    model_config = ConfigDict(from_attributes=True)
