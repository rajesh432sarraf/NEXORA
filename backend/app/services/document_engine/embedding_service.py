import logging
from typing import List
import numpy as np

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
        
    def __init__(self):
        if self._initialized:
            return
            
        self.model_name = "all-MiniLM-L6-v2"
        self.model = None
        self._initialized = True
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading Embedding Model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
        except Exception as e:
            logger.warning(f"SentenceTransformer not available ({e}). Using fallback vector generator.")

    def _fallback_vector(self, text: str, dim: int = 384) -> np.ndarray:
        vec = np.zeros(dim, dtype=np.float32)
        for i, char in enumerate(text):
            vec[i % dim] += ord(char)
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def embed_text(self, text: str) -> np.ndarray:
        if self.model:
            return self.model.encode(text, convert_to_numpy=True)
        return self._fallback_vector(text)

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.array([])
        if self.model:
            return self.model.encode(texts, convert_to_numpy=True)
        return np.array([self._fallback_vector(t) for t in texts], dtype=np.float32)
