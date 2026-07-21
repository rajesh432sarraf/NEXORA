import uuid
from datetime import datetime
import logging
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.document import Document
from app.schemas.parsed_document import ParsedDocument
from app.schemas.compliance import ComplianceReport
from app.repositories.compliance_repository import ComplianceRepository
from app.services.compliance.comparison_service import ComparisonService
from app.services.compliance.recommendation_service import RecommendationService
from app.services.compliance.scoring_service import ScoringService

logger = logging.getLogger(__name__)

class ComplianceEngine:
    """
    Orchestrates the Specification Compliance process.
    """
    
    def __init__(self, repository: ComplianceRepository):
        self.repository = repository
        self.comparison_service = ComparisonService()
        self.recommendation_service = RecommendationService()
        self.scoring_service = ScoringService()

    async def generate_compliance_report(self, spec_doc_id: str, vendor_doc_id: str, db: AsyncSession) -> ComplianceReport:
        # 1. Load documents from DB
        spec_doc = await self._load_document(spec_doc_id, db)
        vendor_doc = await self._load_document(vendor_doc_id, db)
        
        if not spec_doc.metadata_json or not vendor_doc.metadata_json:
            raise HTTPException(status_code=400, detail="Both documents must be parsed into JSON before comparison.")
            
        spec_parsed = ParsedDocument(**spec_doc.metadata_json)
        vendor_parsed = ParsedDocument(**vendor_doc.metadata_json)
        
        # 2. Phase 1: Deterministic Comparison
        matched, partial, missing, extra = self.comparison_service.compare_documents(spec_parsed, vendor_parsed)
        
        # 3. Phase 2: AI Recommendations & Risk Analysis
        recommendations, risk_flags = await self.recommendation_service.generate_recommendations(
            spec_text=spec_doc.extracted_text,
            vendor_text=vendor_doc.extracted_text
        )
        
        # 4. Scoring
        score = self.scoring_service.calculate_overall_score(matched, partial, missing)
        status = self.scoring_service.determine_status(score)
        
        # 5. Compile Report
        report = ComplianceReport(
            report_id=str(uuid.uuid4()),
            spec_document_id=spec_doc_id,
            vendor_document_id=vendor_doc_id,
            overall_score=score,
            status=status,
            matched_items=matched,
            partial_matches=partial,
            missing_requirements=missing,
            extra_vendor_features=extra,
            risk_flags=risk_flags,
            recommendations=recommendations,
            created_at=datetime.utcnow().isoformat()
        )
        
        # 6. Save Report via Repository Abstraction
        await self.repository.save_report(report)
        
        return report

    async def _load_document(self, document_id: str, db: AsyncSession) -> Document:
        stmt = select(Document).where(Document.id == document_id)
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found.")
        return doc
