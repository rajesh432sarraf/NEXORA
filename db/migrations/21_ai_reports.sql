-- 21_ai_reports.sql
DROP TABLE IF EXISTS ai_reports CASCADE;

CREATE TABLE ai_reports (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id             VARCHAR(255) NOT NULL UNIQUE,
    report_type           VARCHAR(50) NOT NULL
                           CHECK (report_type IN (
                               'compliance',
                               'conversation',
                               'executive',
                               'risk',
                               'vendor'
                           )),
    report_data           JSONB NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying by report_id
CREATE INDEX idx_ai_reports_report_id ON ai_reports(report_id);
-- Index for querying by report_type
CREATE INDEX idx_ai_reports_report_type ON ai_reports(report_type);
