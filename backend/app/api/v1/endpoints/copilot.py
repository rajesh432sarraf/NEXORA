from fastapi import APIRouter, Depends, HTTPException
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse, SessionContext
from app.repositories.conversation_repository import ConversationRepository, get_conversation_repository
from app.services.copilot.copilot_service import CopilotService
from app.services.copilot.conversation_service import ConversationService

router = APIRouter()

def get_copilot_service(repository: ConversationRepository = Depends(get_conversation_repository)) -> CopilotService:
    return CopilotService(repository)
    
def get_conversation_service(repository: ConversationRepository = Depends(get_conversation_repository)) -> ConversationService:
    return ConversationService(repository)

@router.post("/chat", response_model=CopilotChatResponse)
async def chat(
    request: CopilotChatRequest,
    copilot: CopilotService = Depends(get_copilot_service)
):
    """
    Submits a natural language query to the AI Copilot.
    """
    try:
        response = await copilot.chat(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/new-session", response_model=SessionContext)
async def create_new_session(
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Initializes a new blank conversation session.
    """
    try:
        session = await conversation_service.create_new_session()
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{session_id}", response_model=SessionContext)
async def get_chat_history(
    session_id: str,
    repository: ConversationRepository = Depends(get_conversation_repository)
):
    """
    Retrieves the chat history for a specific session.
    """
    session = await repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session

@router.delete("/history/{session_id}")
async def delete_chat_history(
    session_id: str,
    repository: ConversationRepository = Depends(get_conversation_repository)
):
    """
    Deletes the chat history for a specific session.
    """
    success = await repository.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"status": "success", "message": "Session deleted."}
