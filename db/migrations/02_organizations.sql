-- 02_organizations.sql
DROP TABLE IF EXISTS organizations CASCADE;

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    legal_name      VARCHAR(200),
    tax_id          VARCHAR(50),
    address_json    JSONB,
    contact_email   VARCHAR(200),
    contact_phone   VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);