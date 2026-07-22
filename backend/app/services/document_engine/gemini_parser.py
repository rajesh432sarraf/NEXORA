import google.generativeai as genai
import logging
from app.core.config import settings
from app.services.document_engine.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. Document parsing will fail.")

class GeminiParser:
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name
        
    async def parse_text(self, text: str) -> str:
        """
        Sends the text to Gemini and returns the raw JSON string response.
        """
        try:
            model = genai.GenerativeModel(self.model_name)
            prompt = PromptBuilder.build_parse_prompt(text)
            
            response = model.generate_content(prompt)
            raw_response = response.text.strip()
            
            # Additional safety cleanup just in case Gemini ignored the "no markdown" rule
            if raw_response.startswith("```json"):
                raw_response = raw_response[7:]
            if raw_response.startswith("```"):
                raw_response = raw_response[3:]
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3]
                
            return raw_response.strip()
            
        except Exception as e:
            logger.error(f"Gemini API error during parsing: {e}")
            raise Exception(f"Gemini API error: {e}")
