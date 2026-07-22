-- 11_quotations.sql
DROP TABLE IF EXISTS quotations CASCADE;

CREATE TABLE quotations (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id            UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    quotation_document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    amount                 NUMERIC(14,2),
    currency               VARCHAR(10) NOT NULL DEFAULT 'INR',
    valid_until             DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);