import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.document import Document
from app.schemas.parsed_document import ParsedDocument
from app.services.document_engine.gemini_parser import GeminiParser

logger = logging.getLogger(__name__)

class ParserService:
    def __init__(self):
        self.parser = GeminiParser()

    async def parse_document(self, document_id: str, db: AsyncSession) -> ParsedDocument:
        """
        Orchestrates the parsing flow for a document.
        Implements a 1-retry fallback mechanism if JSON validation fails.
        """
        # 1. Fetch document and text
        stmt = select(Document).where(Document.id == document_id)
        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found.")
            
        if not document.extracted_text:
            raise HTTPException(status_code=400, detail="Document has no extracted text to parse.")

        # Limit text length to prevent context window overflow (optional safeguard)
        text_to_parse = document.extracted_text[:30000] 

        # 2. Attempt Parsing (with 1 retry)
        parsed_data = await self._attempt_parse_with_retry(text_to_parse)
        
        if not parsed_data:
            document.status = "FAILED"
            document.error_message = "Failed to parse document into valid JSON after retries."
            await db.commit()
            raise HTTPException(status_code=422, detail="Failed to parse document into valid JSON.")

        # 3. Store Parsed Data
        document.metadata_json = parsed_data.model_dump()
        document.status = "PARSED"
        document.error_message = None
        await db.commit()
        
        return parsed_data

    async def _attempt_parse_with_retry(self, text: str, max_retries: int = 1) -> ParsedDocument | None:
        attempts = 0
        while attempts <= max_retries:
            try:
                raw_json_str = await self.parser.parse_text(text)
                
                # Try to parse string into a python dict
                try:
                    data_dict = json.loads(raw_json_str)
                except json.JSONDecodeError as e:
                    logger.warning(f"Attempt {attempts + 1}: Invalid JSON returned by Gemini: {e}")
                    attempts += 1
                    continue
                
                # Validate against Pydantic schema
                parsed_doc = ParsedDocument.model_validate(data_dict)
                return parsed_doc
                
            except Exception as e:
                logger.warning(f"Attempt {attempts + 1}: Parsing validation failed: {e}")
                attempts += 1
                
        logger.error(f"Failed to parse document after {max_retries + 1} attempts.")
        return None
