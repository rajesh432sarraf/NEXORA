import json
import logging
from typing import Tuple, List
from app.core.config import settings
from app.schemas.compliance import AIRecommendation
from app.schemas.parsed_document import ParsedDocument

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Phase 2: Uses Gemini to perform a deep semantic comparison of the texts to find technical deviations.
    """
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if genai and self.api_key and self.api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def generate_recommendations(self, spec_text: str, vendor_text: str) -> Tuple[List[AIRecommendation], List[str]]:
        if not self.model:
            logger.warning("Gemini model not initialized. Skipping deep semantic comparison.")
            return [], ["AI recommendations unavailable (No API Key)."]
            
        # Truncate text to avoid token limits for very large documents
        spec_text = spec_text[:15000] if spec_text else ""
        vendor_text = vendor_text[:15000] if vendor_text else ""
            
        prompt = f"""
        You are a Principal EPC Procurement Engineer evaluating a vendor proposal against a technical specification.
        
        SPECIFICATION DOCUMENT:
        {spec_text}
        
        VENDOR PROPOSAL:
        {vendor_text}
        
        Identify:
        1. Any deep technical parameter differences (e.g. voltage, capacity, dimensions).
        2. Hidden risks or deviations.
        3. Negotiation points or clarifications to ask the vendor.
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "risk_flags": ["List of string warnings"],
            "recommendations": [
                {{
                    "category": "Technical | Commercial | Risk",
                    "finding": "What you found",
                    "recommendation": "What the buyer should do"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            raw_text = response.text
            
            # Clean markdown formatting if present
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json\n", "").replace("```", "")
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```\n", "").replace("```", "")
                
            data = json.loads(raw_text.strip())
            
            recommendations = []
            for rec in data.get("recommendations", []):
                recommendations.append(AIRecommendation(**rec))
                
            return recommendations, data.get("risk_flags", [])
            
        except Exception as e:
            logger.error(f"Error calling Gemini for recommendations: {e}")
            return [], [f"AI Analysis Failed: {str(e)}"]
