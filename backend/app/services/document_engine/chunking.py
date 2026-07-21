import uuid
from typing import List, Dict, Any

class SemanticChunker:
    def __init__(self, chunk_size: int = 2000, chunk_overlap: int = 400):
        # Default ~2000 chars is roughly 400-500 words
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(self, text: str, document_id: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Splits text into chunks while preserving basic paragraph boundaries where possible.
        """
        if not text:
            return []
            
        metadata = metadata or {}
        
        # Simple character-based splitting with overlap (similar to RecursiveCharacterTextSplitter)
        # First, try to split by paragraphs
        paragraphs = text.split('\n\n')
        
        chunks = []
        current_chunk = ""
        chunk_number = 1
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
                
            # If adding this paragraph exceeds chunk size and we already have content
            if len(current_chunk) + len(para) > self.chunk_size and current_chunk:
                chunks.append(self._create_chunk_dict(current_chunk, document_id, chunk_number, metadata))
                chunk_number += 1
                
                # Start new chunk with overlap
                # Find the overlap portion from the end of the current chunk
                overlap_text = current_chunk[-self.chunk_overlap:] if len(current_chunk) > self.chunk_overlap else current_chunk
                # Try to break overlap at a clean space or newline
                last_space = overlap_text.find(' ')
                if last_space != -1:
                    overlap_text = overlap_text[last_space:].strip()
                
                current_chunk = overlap_text + "\n\n" + para
            else:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
                    
            # Handle extremely long paragraphs that alone exceed chunk size
            while len(current_chunk) > self.chunk_size:
                # Force split
                chunks.append(self._create_chunk_dict(current_chunk[:self.chunk_size], document_id, chunk_number, metadata))
                chunk_number += 1
                current_chunk = current_chunk[self.chunk_size - self.chunk_overlap:]

        if current_chunk.strip():
            chunks.append(self._create_chunk_dict(current_chunk, document_id, chunk_number, metadata))
            
        return chunks

    def _create_chunk_dict(self, text: str, document_id: str, chunk_number: int, metadata: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "chunk_id": str(uuid.uuid4()),
            "document_id": document_id,
            "chunk_number": chunk_number,
            "text": text.strip(),
            "metadata": metadata
        }
