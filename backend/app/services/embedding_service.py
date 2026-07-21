import os
import json
import logging
import hashlib
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.core.config import settings

logger = logging.getLogger(__name__)

if genai and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


class EmbeddingService:
    def __init__(self):
        self.index_path = os.path.join(settings.STORAGE_DIR, "faiss_index.bin")
        self.metadata_path = os.path.join(settings.STORAGE_DIR, "faiss_metadata.json")
        self.dimension = 768

        self._init_index_and_metadata()

    def _init_index_and_metadata(self):
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load existing FAISS index/metadata: {e}")
                self.index = faiss.IndexFlatL2(self.dimension)
                self.metadata = []
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []

    def _chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
        if not text or not text.strip():
            return []
        
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            if chunk.strip():
                chunks.append(chunk.strip())
            start += chunk_size - overlap
            
        return chunks

    def _is_valid_key(self) -> bool:
        key = settings.GEMINI_API_KEY.strip()
        return bool(key and not key.startswith("your_"))

    def _get_embedding(self, text: str) -> np.ndarray:
        if genai and self._is_valid_key():
            try:
                result = genai.embed_content(
                    model="models/text-embedding-004",
                    content=text,
                    task_type="retrieval_document"
                )
                vec = np.array(result['embedding'], dtype='float32')
                if vec.shape[0] == self.dimension:
                    return vec
            except Exception as e:
                logger.warning(f"Gemini embedding call failed, using fallback vectorizer: {e}")
        
        # Fallback deterministic pseudo-embedding (768 dimensions) for offline/testing
        vec = np.zeros(self.dimension, dtype='float32')
        words = text.lower().split()
        for word in words:
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dimension
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec


    async def generate_and_store_embedding(self, document_id: str, text: str, project_id: Optional[str] = None):
        """
        Chunks text, generates vector embeddings, and stores them in FAISS index & metadata JSON.
        """
        try:
            chunks = self._chunk_text(text)
            if not chunks:
                return

            embeddings = []
            new_metadata = []

            for idx, chunk in enumerate(chunks):
                vec = self._get_embedding(chunk)
                embeddings.append(vec)
                new_metadata.append({
                    "document_id": document_id,
                    "project_id": project_id,
                    "chunk_index": idx,
                    "text": chunk
                })

            embeddings_np = np.array(embeddings, dtype='float32')
            self.index.add(embeddings_np)
            self.metadata.extend(new_metadata)

            # Persist to disk
            faiss.write_index(self.index, self.index_path)
            with open(self.metadata_path, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, indent=2, ensure_ascii=False)

            logger.info(f"Stored {len(chunks)} chunk embeddings for document {document_id} (project_id={project_id})")

        except Exception as e:
            logger.error(f"Error generating embeddings for doc {document_id}: {e}")
            raise e

    def reload_if_needed(self):
        """
        Reloads FAISS index and metadata from disk if new items were saved by another instance/thread.
        """
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                disk_index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    disk_metadata = json.load(f)
                
                if disk_index.ntotal != self.index.ntotal or len(disk_metadata) != len(self.metadata):
                    self.index = disk_index
                    self.metadata = disk_metadata
            except Exception as e:
                logger.error(f"Error reloading FAISS index: {e}")

    def search(self, query: str, project_id: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches FAISS vector index for chunks matching query, with optional project filtering.
        """
        self.reload_if_needed()

        if self.index.ntotal == 0 or not self.metadata:
            return []

        query_vec = np.array([self._get_embedding(query)], dtype='float32')
        
        search_k = min(self.index.ntotal, max(top_k * 3, 20))
        distances, indices = self.index.search(query_vec, search_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue

            meta = self.metadata[idx]
            if project_id and meta.get("project_id") != project_id:
                continue

            score = float(1.0 / (1.0 + float(dist)))
            results.append({
                "document_id": meta["document_id"],
                "project_id": meta.get("project_id"),
                "chunk_index": meta["chunk_index"],
                "text": meta["text"],
                "score": round(score, 4)
            })

            if len(results) >= top_k:
                break

        return results

embedding_service = EmbeddingService()

