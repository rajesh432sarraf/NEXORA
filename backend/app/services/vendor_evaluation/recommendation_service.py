import json
import logging
from typing import List, Dict, Tuple
from app.core.config import settings
from app.schemas.vendor_evaluation import VendorProposalInput, AIRecommendationSummary

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

class VendorRecommendationService:
    """
    Uses Gemini to generate procurement insights for vendors.
    """
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if genai and self.api_key and self.api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def generate_insights(self, vendors: List[VendorProposalInput]) -> Tuple[Dict[str, dict], str, List[AIRecommendationSummary]]:
        if not self.model:
            logger.warning("Gemini model not initialized. Skipping AI evaluation.")
            return self._generate_fallback(vendors)
            
        vendors_data = []
        for v in vendors:
            vendors_data.append(f"""
            Vendor: {v.vendor_name}
            Compliance Score: {v.compliance_score}
            Price: {v.price}
            Delivery (weeks): {v.delivery_timeline_weeks}
            Warranty (months): {v.warranty_months}
            Certifications: {", ".join(v.certifications)}
            Technical Summary: {v.technical_summary}
            """)
            
        prompt = f"""
        You are a Principal EPC Procurement Officer evaluating vendor proposals.
        Review the following vendor data and provide an evaluation.
        
        {chr(10).join(vendors_data)}
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "vendor_insights": {{
                "VendorName1": {{
                    "strengths": ["string"],
                    "weaknesses": ["string"],
                    "risk_penalty": 0-20
                }},
                "VendorName2": {{
                    ...
                }}
            }},
            "procurement_summary": "Overall summary of the procurement situation.",
            "recommendations": [
                {{
                    "category": "Negotiation | Risk | Technical",
                    "insight": "Recommendation details"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            raw_text = response.text
            
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json\n", "").replace("```", "")
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```\n", "").replace("```", "")
                
            data = json.loads(raw_text.strip())
            
            insights = data.get("vendor_insights", {})
            summary = data.get("procurement_summary", "AI Analysis completed.")
            
            recommendations = []
            for rec in data.get("recommendations", []):
                recommendations.append(AIRecommendationSummary(**rec))
                
            return insights, summary, recommendations
            
        except Exception as e:
            logger.error(f"Error calling Gemini for vendor evaluation: {e}")
            return self._generate_fallback(vendors)

    def _generate_fallback(self, vendors: List[VendorProposalInput]) -> Tuple[Dict[str, dict], str, List[AIRecommendationSummary]]:
        insights = {}
        for v in vendors:
            insights[v.vendor_name] = {
                "strengths": ["AI unavailable - Manual review required"],
                "weaknesses": ["AI unavailable"],
                "risk_penalty": 0
            }
        return insights, "Fallback summary generated.", []
