import json
import logging
from typing import Tuple, Dict, Any
from app.core.config import settings
from app.schemas.procurement_risk import ProcurementRiskInput

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

class GeminiRiskService:
    """
    Leverages Gemini to perform a deep contextual analysis of procurement risks.
    """
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if genai and self.api_key and self.api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def analyze_risk(self, data: ProcurementRiskInput, rule_risks: list) -> Tuple[Dict[str, Any], str]:
        if not self.model:
            logger.warning("Gemini model not initialized. Skipping deep risk analysis.")
            return {"status": "skipped", "reason": "No API key"}, "Basic rule-based risk evaluation applied."
            
        prompt = f"""
        You are a Principal Procurement Risk Analyst.
        Evaluate the following vendor data for project risks.
        
        Vendor: {data.vendor_name}
        Compliance Score: {data.compliance_score}
        Delivery Delay: {data.delivery_delay_days} days
        Rule-Engine Flags: {", ".join(rule_risks) if rule_risks else "None"}
        Raw Text Context: {data.raw_text_summary}
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "executive_summary": "A 2-3 sentence overview of the risk posture.",
            "gemini_analysis": {{
                "hidden_risks": ["string"],
                "contract_loopholes": ["string"],
                "supply_chain_concerns": ["string"]
            }}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            raw_text = response.text
            
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json\n", "").replace("```", "")
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```\n", "").replace("```", "")
                
            result = json.loads(raw_text.strip())
            
            summary = result.get("executive_summary", "AI Analysis completed.")
            analysis = result.get("gemini_analysis", {})
            
            return analysis, summary
            
        except Exception as e:
            logger.error(f"Error calling Gemini for risk analysis: {e}")
            return {"error": str(e)}, "AI analysis failed."
