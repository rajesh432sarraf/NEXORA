-- 15_extracted_entities.sql
DROP TABLE IF EXISTS extracted_entities CASCADE;

CREATE TABLE extracted_entities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id        UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    entity_type     VARCHAR(100) NOT NULL,   -- e.g. 'equipment', 'parameter', 'standard_clause'
    entity_value    VARCHAR(500) NOT NULL,
    confidence      NUMERIC(4,3),             -- 0.000-1.000
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);