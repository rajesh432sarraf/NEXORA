-- 14_document_chunks.sql
DROP TABLE IF EXISTS document_chunks CASCADE;

-- MySQL stores the chunk text + metadata here; the actual embedding vector
-- lives in an external vector store (Chroma/pgvector/Pinecone), referenced
-- by vector_ref only. Do NOT store the raw vector in this table.
CREATE TABLE document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index     INT NOT NULL,
    chunk_text      TEXT NOT NULL,
    vector_ref      VARCHAR(255),   -- id/key of the embedding in the external vector store
    page_number     INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);