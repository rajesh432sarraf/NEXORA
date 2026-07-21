import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from sqlalchemy import select

from app.models.document import Document
from app.services.storage_service import StorageService
from app.services.extraction_service import ExtractionService
from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)
embedding_service = EmbeddingService()

class DocumentService:
    @staticmethod
    async def process_document_pipeline(document_id: str, db: AsyncSession):
        """
        Background task pipeline to extract text, get metadata via LLM, and generate embeddings.
        """
        try:
            # 1. Fetch document record
            stmt = select(Document).where(Document.id == document_id)
            result = await db.execute(stmt)
            document = result.scalar_one_or_none()
            
            if not document:
                logger.error(f"Document {document_id} not found for processing.")
                return

            # Update status to PROCESSING
            document.status = "PROCESSING"
            await db.commit()

            # 2. Extract Text
            text = ExtractionService.extract_text_from_pdf(document.file_path)
            document.extracted_text = text
            
            # 3. Extract Metadata via Gemini
            metadata = await LLMService.extract_metadata(text)
            document.metadata_json = metadata
            
            # 4. Generate Embeddings and store in FAISS
            await embedding_service.generate_and_store_embedding(document_id, text)
            
            # Update status to COMPLETED
            document.status = "COMPLETED"
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
