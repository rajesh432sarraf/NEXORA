import asyncio
from app.schemas.copilot import CopilotChatRequest
from app.repositories.conversation_repository import JsonConversationRepository
from app.services.copilot.copilot_service import CopilotService
from app.services.copilot.conversation_service import ConversationService

async def test_copilot():
    repo = JsonConversationRepository()
    conversation_service = ConversationService(repo)
    copilot_service = CopilotService(repo)
    
    # Initialize a new session
    session = await conversation_service.create_new_session()
    print(f"Created new Copilot Session: {session.session_id}")
    
    # Mock Question
    request = CopilotChatRequest(
        session_id=session.session_id,
        question="Which vendor has the highest compliance score?"
    )
    
    print(f"\nUser: {request.question}")
    print("Generating Response...")
    
    # NOTE: Since the FAISS db might be empty during this test, retrieved_chunks might be empty,
    # which will gracefully fall back via the copilot service and prompt builder.
    response = await copilot_service.chat(request)
    
    print("\n=== COPILOT RESPONSE ===")
    print(response.answer)
    print(f"\nConfidence: {response.confidence}")
    print(f"Sources: {response.sources}")
    print(f"Retrieved Chunks: {len(response.retrieved_chunks)}")

if __name__ == "__main__":
    asyncio.run(test_copilot())
