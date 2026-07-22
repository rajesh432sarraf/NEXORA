-- 16_kg_relationships.sql
DROP TABLE IF EXISTS kg_relationships CASCADE;

CREATE TABLE kg_relationships (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entity_id    UUID NOT NULL REFERENCES extracted_entities(id) ON DELETE CASCADE,
    relationship_type   VARCHAR(100) NOT NULL,   -- e.g. 'governs', 'references', 'supersedes'
    target_entity_id    UUID NOT NULL REFERENCES extracted_entities(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);