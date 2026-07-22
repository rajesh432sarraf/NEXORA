-- 13_boq_items.sql
DROP TABLE IF EXISTS boq_items CASCADE;

CREATE TABLE boq_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    item_code       VARCHAR(100),
    description     TEXT NOT NULL,
    unit            VARCHAR(30),
    quantity        NUMERIC(14,3) NOT NULL DEFAULT 0,
    unit_rate       NUMERIC(14,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);