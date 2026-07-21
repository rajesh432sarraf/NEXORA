import logging
from typing import Dict, Any, List

from app.schemas.search import SearchQuery, SearchResultItem
from app.services.document_engine.chunking import SemanticChunker
from app.services.document_engine.embedding_service import EmbeddingService
from app.services.document_engine.vector_store import FAISSVectorStore

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self):
        self.chunker = SemanticChunker()
        self.embedder = EmbeddingService()
        self.vector_store = FAISSVectorStore()

    def ingest_document(self, text: str, document_id: str, metadata: Dict[str, Any] = None):
        """
        Chunks the document text, generates embeddings, and stores them in FAISS.
        Called typically in a background task after Gemini parsing is complete, or synchronously.
        """
        logger.info(f"Ingesting document {document_id} into RAG system.")
        
        # 1. Chunk Text
        chunks = self.chunker.chunk_document(text, document_id, metadata)
        if not chunks:
            logger.warning(f"No valid text found to chunk for document {document_id}")
            return
            
        logger.info(f"Generated {len(chunks)} chunks for document {document_id}")
        
        # 2. Extract texts for embedding
        chunk_texts = [c["text"] for c in chunks]
        
        # 3. Embed Batch
        embeddings = self.embedder.embed_batch(chunk_texts)
        
        # 4. Store in FAISS
        self.vector_store.add_vectors(embeddings, chunks)
        
        logger.info(f"Successfully ingested document {document_id} into FAISS.")

    def search(self, query: SearchQuery) -> List[SearchResultItem]:
        """
        Performs semantic search for the given query.
        """
        logger.info(f"Performing semantic search for query: '{query.query}'")
        
        # 1. Embed Query
        query_embedding = self.embedder.embed_text(query.query)
        
        # 2. Search FAISS
        raw_results = self.vector_store.search(query_embedding, top_k=query.top_k)
        
        # 3. Format Results
        results = []
        for score, chunk in raw_results:
            results.append(SearchResultItem(
                document_id=chunk["document_id"],
                chunk_id=chunk["chunk_id"],
                score=score,
                text=chunk["text"],
                metadata=chunk["metadata"]
            ))
            
        return results
