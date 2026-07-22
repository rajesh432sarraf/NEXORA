-- 20_ai_layer_indexes.sql

CREATE INDEX IF NOT EXISTS idx_quotations_proposal
    ON quotations (proposal_id);

CREATE INDEX IF NOT EXISTS idx_shipment_updates_proposal
    ON shipment_updates (proposal_id);

CREATE INDEX IF NOT EXISTS idx_boq_items_document
    ON boq_items (document_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document
    ON document_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_extracted_entities_document
    ON extracted_entities (document_id);

CREATE INDEX IF NOT EXISTS idx_kg_relationships_source
    ON kg_relationships (source_entity_id);

CREATE INDEX IF NOT EXISTS idx_kg_relationships_target
    ON kg_relationships (target_entity_id);

CREATE INDEX IF NOT EXISTS idx_agent_findings_project_type
    ON agent_findings (project_id, agent_type);

CREATE INDEX IF NOT EXISTS idx_vendor_scores_vendor_project
    ON vendor_scores (vendor_id, project_id);

CREATE INDEX IF NOT EXISTS idx_risk_predictions_project
    ON risk_predictions (project_id);

CREATE INDEX IF NOT EXISTS idx_schedule_predictions_project
    ON schedule_predictions (project_id);

CREATE INDEX IF NOT EXISTS idx_project_health_scores_project
    ON project_health_scores (project_id);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_project_user
    ON copilot_conversations (project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_conversation
    ON copilot_messages (conversation_id);