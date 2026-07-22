import logging
from app.core.config import settings
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse
from app.repositories.conversation_repository import ConversationRepository
from app.services.copilot.retrieval_service import RetrievalService
from app.services.copilot.prompt_builder import PromptBuilder
from app.services.copilot.citation_service import CitationService
from app.services.copilot.conversation_service import ConversationService

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

class CopilotService:
    """
    Main orchestrator for the AI Procurement Copilot.
    """
    
    def __init__(self, repository: ConversationRepository):
        self.conversation_service = ConversationService(repository)
        self.retrieval_service = RetrievalService()
        self.prompt_builder = PromptBuilder()
        self.citation_service = CitationService()
        
        self.api_key = settings.GEMINI_API_KEY
        if genai and self.api_key and self.api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def chat(self, request: CopilotChatRequest) -> CopilotChatResponse:
        session_id = request.session_id
        question = request.question
        
        # 1. Fetch History
        session = await self.conversation_service.get_or_create_session(session_id)
        
        # 2. Retrieve Context from FAISS
        try:
            retrieved_chunks = await self.retrieval_service.retrieve_context(question, top_k=5)
        except Exception as e:
            logger.error(f"Error retrieving from FAISS: {e}")
            retrieved_chunks = []
            
        # 3. Build Citations
        sources = self.citation_service.extract_sources(retrieved_chunks)
        
        # 4. Build Prompt
        prompt = self.prompt_builder.build_prompt(question, retrieved_chunks, session.history)
        
        # 5. Ask Gemini
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                answer = response.text
                confidence = 0.95 if retrieved_chunks else 0.50
            except Exception as e:
                logger.error(f"Error calling Gemini: {e}")
                answer = "I'm currently unable to process your request due to an AI service error."
                confidence = 0.0
        else:
            answer = "I'm sorry, but my AI capabilities are currently offline (API Key missing)."
            confidence = 0.0
            
        # 6. Save messages to history
        await self.conversation_service.add_message(session_id, "user", question)
        await self.conversation_service.add_message(session_id, "assistant", answer)
        
        # 7. Return Response
        return CopilotChatResponse(
            answer=answer,
            sources=sources,
            confidence=confidence,
            retrieved_chunks=[c['text'] for c in retrieved_chunks]
        )
