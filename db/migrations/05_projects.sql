  -- 05_projects.sql
  DROP TABLE IF EXISTS projects CASCADE;

  CREATE TABLE projects (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name            VARCHAR(200) NOT NULL,
      description     TEXT,
      start_date      DATE,
      end_date        DATE,
      status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','active','completed','on_hold')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  );
