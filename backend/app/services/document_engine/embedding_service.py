import logging
from typing import List
import numpy as np

# We'll import sentence_transformers lazily or globally depending on performance needs.
# For API, global load is better for latency, but it takes memory.
from sentence_transformers import SentenceTransformer

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
        logger.info(f"Loading Embedding Model: {self.model_name}")
        try:
            self.model = SentenceTransformer(self.model_name)
            self._initialized = True
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise e

    def embed_text(self, text: str) -> np.ndarray:
        """
        Embeds a single string and returns a numpy array.
        """
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Error embedding text: {e}")
            raise e

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """
        Embeds a list of strings and returns a 2D numpy array.
        """
        if not texts:
            return np.array([])
            
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            logger.error(f"Error embedding batch: {e}")
            raise e
