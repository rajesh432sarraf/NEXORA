import json
import logging
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.schemas.executive_insights import ExecutiveKPIs

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

class GeminiInsightsService:
    """
    Leverages Gemini to generate a high-level narrative and strategic executive recommendations.
    """
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if genai and self.api_key and self.api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def generate_executive_insights(self, kpis: ExecutiveKPIs, health: str, score: float) -> Tuple[str, list, list]:
        if not self.model:
            logger.warning("Gemini model not initialized. Skipping executive narrative generation.")
            return "AI unavailable. Please review KPIs manually.", ["Manual risk review required"], ["Consult procurement team"]
            
        prompt = f"""
        You are a Chief Procurement Officer (CPO) AI Assistant.
        Write a concise executive summary based on the following KPIs.
        
        Health: {health} ({score}/100)
        Total Vendors Evaluated: {kpis.total_vendors_evaluated}
        Avg Compliance: {kpis.average_compliance_score}%
        Highest Ranked Vendor: {kpis.highest_ranked_vendor}
        Overall Risk Level: {kpis.procurement_risk_level}
        High Risk Vendors: {kpis.number_of_high_risk_vendors}
        Avg Delivery: {kpis.average_delivery_timeline_weeks} weeks
        Missing Certs: {kpis.missing_certifications}
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "executive_summary": "1 paragraph high-level narrative of the situation.",
            "critical_risks": ["Risk 1", "Risk 2"],
            "recommended_actions": ["Action 1", "Action 2"]
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
            risks = result.get("critical_risks", [])
            actions = result.get("recommended_actions", [])
            
            return summary, risks, actions
            
        except Exception as e:
            logger.error(f"Error calling Gemini for executive insights: {e}")
            return "AI Analysis failed.", ["AI error"], ["Check API configuration"]
