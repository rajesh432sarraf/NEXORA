-- 12_shipment_updates.sql
DROP TABLE IF EXISTS shipment_updates CASCADE;

CREATE TABLE shipment_updates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id         UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL
                         CHECK (status IN ('preparing','shipped','in_transit','customs','delivered','delayed')),
    location_text       VARCHAR(255),
    eta_date            DATE,
    note                TEXT,
    updated_by_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);