-- 19_copilot.sql

DROP TABLE IF EXISTS copilot_messages CASCADE;
DROP TABLE IF EXISTS copilot_conversations CASCADE;

CREATE TABLE copilot_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE copilot_messages (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id       UUID NOT NULL REFERENCES copilot_conversations(id) ON DELETE CASCADE,
    role                  VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content               TEXT NOT NULL,
    citation_refs_json    JSONB,   -- list of chunk/document ids cited in the answer
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);