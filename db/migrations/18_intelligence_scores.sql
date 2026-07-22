-- 18_intelligence_scores.sql

-- Vendor scores
DROP TABLE IF EXISTS vendor_scores CASCADE;

CREATE TABLE vendor_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    score           NUMERIC(5,2) NOT NULL,   -- e.g. 0-100
    basis_json      JSONB,                    -- breakdown of what drove the score
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk predictions
DROP TABLE IF EXISTS risk_predictions CASCADE;

CREATE TABLE risk_predictions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_type       VARCHAR(100) NOT NULL,   -- e.g. 'procurement', 'schedule', 'quality'
    likelihood      NUMERIC(4,3),             -- 0.000-1.000
    impact          VARCHAR(10) NOT NULL DEFAULT 'medium'
                    CHECK (impact IN ('low','medium','high','critical')),
    description     TEXT,
    predicted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedule predictions
DROP TABLE IF EXISTS schedule_predictions CASCADE;

CREATE TABLE schedule_predictions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_name          VARCHAR(200) NOT NULL,
    original_date           DATE,
    predicted_date          DATE,
    predicted_delay_days    INT NOT NULL DEFAULT 0,
    reason                  TEXT,
    predicted_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project health scores
DROP TABLE IF EXISTS project_health_scores CASCADE;

CREATE TABLE project_health_scores (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    overall_score           NUMERIC(5,2) NOT NULL,
    procurement_health      NUMERIC(5,2),
    schedule_health         NUMERIC(5,2),
    quality_health          NUMERIC(5,2),
    computed_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);