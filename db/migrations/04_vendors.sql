  -- 04_vendors.sql
  DROP TABLE IF EXISTS vendors CASCADE;

  CREATE TABLE vendors (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name            VARCHAR(200) NOT NULL,
      legal_name      VARCHAR(200),
      tax_id          VARCHAR(50),
      address_json    JSONB,
      contact_email   VARCHAR(200),
      contact_phone   VARCHAR(50),
      status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','approved','blocked')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  );
