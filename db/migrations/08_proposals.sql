 -- 08_proposals.sql
  DROP TABLE IF EXISTS proposals CASCADE;

  CREATE TABLE proposals (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      rfq_id          UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
      vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
      proposal_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
      submitted_at    TIMESTAMPTZ NULL,
      status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','submitted','under_review','accepted','rejected')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  );