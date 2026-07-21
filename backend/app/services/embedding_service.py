import google.generativeai as genai
import faiss
import numpy as np
import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.index_path = os.path.join(settings.STORAGE_DIR, "faiss_index.bin")
        # Gemini text-embedding-004 outputs 768 dimensions by default
        self.dimension = 768
        
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)

    async def generate_and_store_embedding(self, document_id: str, text: str):
        """
        Generates an embedding for the document text and stores it in the local FAISS index.
        In a real production environment, chunking should be applied here.
        """
        try:
            # Simple approach: embed the first 10k chars to avoid token limits for this MVP
            text_to_embed = text[:10000]
            if not text_to_embed.strip():
                return
                
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text_to_embed,
                task_type="retrieval_document"
            )
            
            embedding = np.array([result['embedding']], dtype='float32')
            
            # Add to FAISS
            self.index.add(embedding)
            
            # Save index to disk
            faiss.write_index(self.index, self.index_path)
            
            logger.info(f"Successfully generated and stored embedding for document {document_id}")
            
        except Exception as e:
            logger.error(f"Error generating embedding for {document_id}: {e}")
            raise e
