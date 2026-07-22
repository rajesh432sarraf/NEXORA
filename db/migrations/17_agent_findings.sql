-- 17_agent_findings.sql
DROP TABLE IF EXISTS agent_findings CASCADE;

CREATE TABLE agent_findings (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_type            VARCHAR(30) NOT NULL
                           CHECK (agent_type IN (
                               'spec_compliance',
                               'vendor_evaluation',
                               'procurement_risk',
                               'schedule_prediction',
                               'quality_compliance',
                               'project_risk'
                           )),
    related_document_id   UUID REFERENCES documents(id) ON DELETE SET NULL,
    related_proposal_id   UUID REFERENCES proposals(id) ON DELETE SET NULL,
    severity              VARCHAR(10) NOT NULL DEFAULT 'info'
                           CHECK (severity IN ('info','low','medium','high','critical')),
    title                 VARCHAR(255) NOT NULL,
    detail                TEXT,
    citation_ref           VARCHAR(255),   -- pointer back to source clause/chunk
    status                 VARCHAR(20) NOT NULL DEFAULT 'open'
                           CHECK (status IN ('open','acknowledged','resolved','dismissed')),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at             TIMESTAMPTZ
);