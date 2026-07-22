  -- 06_documents.sql
  DROP TABLE IF EXISTS documents CASCADE;

  CREATE TABLE documents (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      doc_type        VARCHAR(30) NOT NULL
                       CHECK (doc_type IN (
                           'spec','boq','drawing','rfq','proposal',
                           'quotation','datasheet','certificate'
                       )),
      file_name       VARCHAR(255) NOT NULL,
      file_mime_type  VARCHAR(100) NOT NULL,
      file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
      file_storage_url TEXT NOT NULL,   -- e.g., S3 URL or local file path
      uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      is_active       BOOLEAN NOT NULL DEFAULT TRUE
  );