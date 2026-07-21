import faiss
import numpy as np
import json
import os
import logging
from typing import List, Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

class FAISSVectorStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FAISSVectorStore, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        self.index_path = settings.FAISS_INDEX_PATH
        self.mapping_path = settings.FAISS_MAPPING_PATH
        
        self.index = None
        self.mapping = {}  # Map integer ID to Chunk dict
        
        self.load_index()
        self._initialized = True

    def load_index(self):
        """Loads the FAISS index and JSON mapping from disk if they exist, otherwise creates new."""
        try:
            if os.path.exists(self.index_path) and os.path.exists(self.mapping_path):
                logger.info(f"Loading FAISS index from {self.index_path}")
                self.index = faiss.read_index(self.index_path)
                with open(self.mapping_path, 'r', encoding='utf-8') as f:
                    # JSON keys are always strings, so we convert back to int keys
                    str_mapping = json.load(f)
                    self.mapping = {int(k): v for k, v in str_mapping.items()}
            else:
                logger.info("Initializing new FAISS index (IndexFlatL2)")
                self.index = faiss.IndexFlatL2(self.dimension)
                self.mapping = {}
        except Exception as e:
            logger.error(f"Error loading FAISS index: {e}")
            self.index = faiss.IndexFlatL2(self.dimension)
            self.mapping = {}

    def save_index(self):
        """Saves the FAISS index and JSON mapping to disk."""
        try:
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            faiss.write_index(self.index, self.index_path)
            
            with open(self.mapping_path, 'w', encoding='utf-8') as f:
                json.dump(self.mapping, f, ensure_ascii=False)
                
            logger.info("Saved FAISS index and mapping successfully.")
        except Exception as e:
            logger.error(f"Error saving FAISS index: {e}")

    def add_vectors(self, embeddings: np.ndarray, chunks: List[Dict[str, Any]]):
        """
        Adds vectors to the FAISS index and saves the chunk metadata.
        """
        if len(embeddings) != len(chunks):
            raise ValueError("Number of embeddings must match number of chunks.")
            
        if self.index is None:
            raise RuntimeError("FAISS index not initialized.")

        # FAISS assigns sequential IDs starting from the current total count
        start_id = self.index.ntotal
        
        # Add to index
        self.index.add(embeddings)
        
        # Add to mapping
        for i, chunk in enumerate(chunks):
            vector_id = start_id + i
            self.mapping[vector_id] = chunk
            
        # Save to disk immediately for persistence
        self.save_index()

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
        """
        Searches the FAISS index and returns matching chunks with scores.
        L2 distance: lower is better (more similar).
        """
        if self.index is None or self.index.ntotal == 0:
            return []
            
        # Ensure query is 2D
        if len(query_embedding.shape) == 1:
            query_embedding = np.expand_dims(query_embedding, axis=0)

        # Search
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx in self.mapping:
                # Convert L2 distance to a pseudo-similarity score (0 to 1 range approx)
                # This is a naive conversion for UX purposes. True cosine similarity is better for MiniLM.
                score = 1.0 / (1.0 + float(dist))
                chunk = self.mapping[idx]
                results.append((score, chunk))
                
        return results
