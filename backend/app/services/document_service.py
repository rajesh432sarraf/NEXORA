import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.document import Document
from app.services.extraction_service import ExtractionService
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class DocumentService:
    @staticmethod
    async def process_document_synchronously(document_id: str, db: AsyncSession):
        """
        Synchronously extracts text, generates vector embeddings, and updates status.
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
            
            if text:
                document.status = "EXTRACTED"
                # Generate embeddings & FAISS index
                try:
                    await embedding_service.generate_and_store_embedding(
                        document_id=document.id,
                        text=text,
                        project_id=document.project_id
                    )
                except Exception as emb_err:
                    logger.error(f"Embedding generation error for {document_id}: {emb_err}")
            else:
                document.status = "FAILED"
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

