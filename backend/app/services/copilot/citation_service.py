from typing import List

class CitationService:
    """
    Extracts unique source citations from the retrieved FAISS chunks.
    """
    
    def extract_sources(self, retrieved_chunks: List[dict]) -> List[str]:
        sources = []
        for chunk in retrieved_chunks:
            source = chunk.get("source")
            if source and source not in sources:
                sources.append(source)
                
        return sources
