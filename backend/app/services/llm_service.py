import google.generativeai as genai
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. LLM features will fail.")

class LLMService:
    @staticmethod
    async def extract_metadata(text: str) -> dict:
        """
        Uses Gemini to extract structured metadata from the document text.
        """
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
            prompt = f"""
            Analyze the following document text and extract structured metadata.
            Return ONLY a valid JSON object with the following keys:
            - document_type (e.g., "Technical Specification", "BOQ", "RFQ", "Datasheet", "Unknown")
            - title (string)
            - summary (brief 1-2 sentence summary)
            - key_entities (list of strings, e.g., company names, major equipment, standards mentioned)

            Document Text (First 10000 characters):
            {text[:10000]}
            """
            
            response = model.generate_content(prompt)
            
            # Simple cleaning in case the model adds markdown code blocks
            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            return json.loads(result_text.strip())
            
        except Exception as e:
            logger.error(f"Error extracting metadata with LLM: {e}")
            return {"error": str(e), "document_type": "Unknown"}
