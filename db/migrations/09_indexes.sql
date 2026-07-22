 -- 09_indexes.sql
  -- Documents: look up by project & type
  CREATE INDEX IF NOT EXISTS idx_documents_project_type
      ON documents (project_id, doc_type);

  -- RFQs: find by project
  CREATE INDEX IF NOT EXISTS idx_rfqs_project
      ON rfqs (project_id);

  -- Proposals: find by RFQ and by vendor
  CREATE INDEX IF NOT EXISTS idx_proposals_rfq
      ON proposals (rfq_id);

  CREATE INDEX IF NOT EXISTS idx_proposals_vendor
      ON proposals (vendor_id);

  -- Users: find by organization
  CREATE INDEX IF NOT EXISTS idx_users_org
      ON users (org_id);