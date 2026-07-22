  -- 07_rfqs.sql
  DROP TABLE IF EXISTS rfqs CASCADE;

  CREATE TABLE rfqs (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      rfq_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
      title           VARCHAR(200) NOT NULL,
      description     TEXT,
      issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
      deadline_date   DATE NOT NULL,
      status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','issued','closed','cancelled')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  );