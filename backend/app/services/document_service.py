import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from sqlalchemy import select

from app.models.document import Document
from app.services.storage_service import StorageService
from app.services.extraction_service import ExtractionService

logger = logging.getLogger(__name__)

class DocumentService:
    @staticmethod
    async def process_document_synchronously(document_id: str, db: AsyncSession):
        """
        Synchronously extracts text and updates the database status.
        """
        try:
            # Fetch document record
            stmt = select(Document).where(Document.id == document_id)
            result = await db.execute(stmt)
            document = result.scalar_one_or_none()
            
            if not document:
                logger.error(f"Document {document_id} not found for processing.")
                return

            # Extract Text
            text = ExtractionService.extract_text_from_pdf(document.file_path)
            document.extracted_text = text
            
            # Update status
            document.status = "EXTRACTED" if text else "FAILED"
            if not text:
                document.error_message = "No text could be extracted from the PDF."
                
            await db.commit()
            logger.info(f"Successfully processed document {document_id}")
            
        except Exception as e:
            logger.error(f"Failed to process document {document_id}: {e}")
            
            # Update status to FAILED
            stmt = select(Document).where(Document.id == document_id)
            result = await db.execute(stmt)
            document = result.scalar_one_or_none()
            if document:
                document.status = "FAILED"
                document.error_message = str(e)
                await db.commit()
