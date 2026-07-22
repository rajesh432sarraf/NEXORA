  -- 03_users.sql
  DROP TABLE IF EXISTS users CASCADE;

  CREATE TABLE users (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email           VARCHAR(255) UNIQUE NOT NULL,
      password_hash   TEXT NOT NULL,
      role            VARCHAR(30) NOT NULL
                       CHECK (role IN ('org_admin','org_user','vendor_admin','vendor_user')),
      org_id          UUID REFERENCES organizations(id) ON DELETE SET NULL,
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  );
