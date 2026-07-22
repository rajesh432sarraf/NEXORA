-- 10_seed_data.sql
-- Seed data for the 7 core NEXORA tables.
-- Scenario: one client/EPC organization running a data centre project,
-- two competing vendor organizations bidding on the same RFQ.
--
-- Fixed UUIDs are used (instead of relying on uuid_generate_v4() defaults)
-- so that rows can reference each other predictably across INSERT
-- statements and so you can re-run lookups against known ids while testing.

BEGIN;

-- -------------------------------------------------
-- Organizations
-- -------------------------------------------------
INSERT INTO organizations (id, name, legal_name, tax_id, address_json, contact_email, contact_phone)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Apex Data Centers', 'Apex Data Centers Pvt Ltd', 'GSTIN29APEX1234A1Z5',
     '{"city": "Hyderabad", "state": "Telangana", "country": "India"}', 'contact@apexdc.in', '+91-40-1234-5678'),
    ('00000000-0000-0000-0000-000000000002', 'PowerGuard Systems', 'PowerGuard Systems Pvt Ltd', 'GSTIN27PGS5678B2Z9',
     '{"city": "Pune", "state": "Maharashtra", "country": "India"}', 'sales@powerguard.in', '+91-20-9876-5432'),
    ('00000000-0000-0000-0000-000000000003', 'CoolTech Industries', 'CoolTech Industries Ltd', 'GSTIN33COOL9012C3Z1',
     '{"city": "Chennai", "state": "Tamil Nadu", "country": "India"}', 'info@cooltech.in', '+91-44-2345-6789');

-- -------------------------------------------------
-- Users
-- Note: password_hash values below are placeholders for seed/demo purposes
-- only ('placeholder_hash_...') — replace with real bcrypt hashes before
-- any real authentication testing.
-- -------------------------------------------------
INSERT INTO users (id, email, password_hash, role, org_id, is_active)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@apexdc.in', 'placeholder_hash_apex_admin', 'org_admin',
     '00000000-0000-0000-0000-000000000001', TRUE),
    ('10000000-0000-0000-0000-000000000002', 'engineer@apexdc.in', 'placeholder_hash_apex_user', 'org_user',
     '00000000-0000-0000-0000-000000000001', TRUE),
    ('10000000-0000-0000-0000-000000000003', 'admin@powerguard.in', 'placeholder_hash_pg_admin', 'vendor_admin',
     '00000000-0000-0000-0000-000000000002', TRUE),
    ('10000000-0000-0000-0000-000000000004', 'sales@powerguard.in', 'placeholder_hash_pg_user', 'vendor_user',
     '00000000-0000-0000-0000-000000000002', TRUE),
    ('10000000-0000-0000-0000-000000000005', 'admin@cooltech.in', 'placeholder_hash_ct_admin', 'vendor_admin',
     '00000000-0000-0000-0000-000000000003', TRUE);

-- -------------------------------------------------
-- Vendors (one vendor profile per vendor org)
-- -------------------------------------------------
INSERT INTO vendors (id, org_id, name, legal_name, tax_id, address_json, contact_email, contact_phone, status)
VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
     'PowerGuard Systems', 'PowerGuard Systems Pvt Ltd', 'GSTIN27PGS5678B2Z9',
     '{"city": "Pune", "state": "Maharashtra", "country": "India"}', 'sales@powerguard.in', '+91-20-9876-5432', 'approved'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
     'CoolTech Industries', 'CoolTech Industries Ltd', 'GSTIN33COOL9012C3Z1',
     '{"city": "Chennai", "state": "Tamil Nadu", "country": "India"}', 'info@cooltech.in', '+91-44-2345-6789', 'approved');

-- -------------------------------------------------
-- Projects
-- -------------------------------------------------
INSERT INTO projects (id, org_id, name, description, start_date, end_date, status)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'Hyderabad Tier III Data Centre - Phase 1',
     'Construction and commissioning of a 12MW Tier III facility, Phase 1 (power and cooling infrastructure).',
     '2026-08-01', '2027-11-30', 'active');

-- -------------------------------------------------
-- Documents
-- -------------------------------------------------
INSERT INTO documents (id, project_id, uploaded_by_user_id, doc_type, file_name, file_mime_type, file_size_bytes, file_storage_url, is_active)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000002', 'spec', 'UPS_System_Specification_Rev2.pdf',
     'application/pdf', 2458112, 'https://storage.nexora.local/docs/ups-spec-rev2.pdf', TRUE),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000002', 'boq', 'BOQ_Phase1.xlsx',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 184320,
     'https://storage.nexora.local/docs/boq-phase1.xlsx', TRUE),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000002', 'drawing', 'Electrical_SLD_Rev1.pdf',
     'application/pdf', 5242880, 'https://storage.nexora.local/docs/electrical-sld-rev1.pdf', TRUE),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001', 'rfq', 'RFQ_UPS_Systems.pdf',
     'application/pdf', 512000, 'https://storage.nexora.local/docs/rfq-ups-systems.pdf', TRUE),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000004', 'proposal', 'PowerGuard_Proposal_UPS.pdf',
     'application/pdf', 1048576, 'https://storage.nexora.local/docs/powerguard-proposal.pdf', TRUE),
    ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000004', 'datasheet', 'PowerGuard_UPS_Datasheet.pdf',
     'application/pdf', 358400, 'https://storage.nexora.local/docs/powerguard-datasheet.pdf', TRUE),
    ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000005', 'proposal', 'CoolTech_Proposal_UPS.pdf',
     'application/pdf', 972800, 'https://storage.nexora.local/docs/cooltech-proposal.pdf', TRUE),
    ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000005', 'datasheet', 'CoolTech_UPS_Datasheet.pdf',
     'application/pdf', 296960, 'https://storage.nexora.local/docs/cooltech-datasheet.pdf', TRUE);

-- -------------------------------------------------
-- RFQs
-- -------------------------------------------------
INSERT INTO rfqs (id, project_id, rfq_document_id, title, description, issue_date, deadline_date, status)
VALUES
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000004', 'UPS System Procurement RFQ',
     'Request for quotation: 3x 500kVA modular UPS systems meeting TIA-942 Tier III redundancy requirements.',
     '2026-07-01', '2026-08-15', 'issued');

-- -------------------------------------------------
-- Proposals (two vendors bidding on the same RFQ)
-- -------------------------------------------------
INSERT INTO proposals (id, rfq_id, vendor_id, proposal_document_id, submitted_at, status)
VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000005',
     '2026-08-10 11:30:00+05:30', 'submitted'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000007',
     '2026-08-12 16:45:00+05:30', 'under_review');

COMMIT;