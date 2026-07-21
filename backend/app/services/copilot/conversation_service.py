import uuid
from datetime import datetime
from app.schemas.copilot import SessionContext, ChatMessage
from app.repositories.conversation_repository import ConversationRepository

class ConversationService:
    """
    Manages session state and chat history.
    """
    
    def __init__(self, repository: ConversationRepository):
        self.repository = repository
        
    async def get_or_create_session(self, session_id: str) -> SessionContext:
        session = await self.repository.get_session(session_id)
        if not session:
            session = SessionContext(session_id=session_id, history=[])
            await self.repository.save_session(session)
        return session
        
    async def create_new_session(self) -> SessionContext:
        session_id = str(uuid.uuid4())
        session = SessionContext(session_id=session_id, history=[])
        await self.repository.save_session(session)
        return session
        
    async def add_message(self, session_id: str, role: str, content: str) -> None:
        session = await self.get_or_create_session(session_id)
        msg = ChatMessage(
            role=role,
            content=content,
            timestamp=datetime.utcnow().isoformat()
        )
        session.history.append(msg)
        await self.repository.save_session(session)
