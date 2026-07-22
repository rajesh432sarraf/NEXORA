# Procurement Database (NEXORA project)

PostgreSQL schema for the EPC Project Intelligence platform — unifies project
documents, specifications, schedules, procurement data, and quality records
into a queryable backend for the AI intelligence and multi-agent layer.

## Setup

1. Create a database named `procurement` in PostgreSQL.
2. Run the migration files in `db/migrations/` **in strict numeric order**,
   01 through 20. Some later files depend on tables created earlier
   (e.g. `15_extracted_entities.sql` requires `14_document_chunks.sql` to
   have run first), so do not skip or reorder them.
3. `10_seed_data.sql` is optional — it loads a sample scenario (one client
   org, two competing vendor orgs, one project, an RFQ, and two proposals)
   useful for testing the portals and dashboard before real data exists.

```bash
psql -U <username> -d procurement -f db/migrations/01_create_extension.sql
psql -U <username> -d procurement -f db/migrations/02_organizations.sql
# ...continue through 20_ai_layer_indexes.sql in order
```

(Or run each file's contents through your Postgres GUI client of choice, in
the same order.)

## Schema overview

**01–09 — Core schema**
Organizations, users, vendors, projects, documents, RFQs, proposals, and
their indexes. Covers authentication, the Organization Portal, and the
Vendor Portal actions (create project, issue RFQ, submit proposal, etc.)

**10 — Seed data**
Sample rows for local development and demos.

**11–13 — Portal extensions**
Quotations, shipment updates, and structured BOQ line items.

**14–16 — RAG and knowledge graph**
`document_chunks` stores parsed document text and metadata for retrieval;
the actual embedding vectors live in an external vector store (not
Postgres), referenced via `document_chunks.vector_ref`. `extracted_entities`
holds structured facts pulled from documents (equipment, parameters,
standard clauses). `kg_relationships` links entities to each other
(e.g. "this spec clause governs this equipment type").

**17 — Multi-agent findings**
One shared table, `agent_findings`, used by all six agents (spec
compliance, vendor evaluation, procurement risk, schedule prediction,
quality compliance, project risk), distinguished by `agent_type`. This lets
the Executive Dashboard query everything flagged on a project in a single
pass instead of six separate ones.

**18 — Intelligence scoring**
Vendor scores, risk predictions, schedule/delay predictions, and rolled-up
project health scores — the outputs of the Project Intelligence Engine.

**19 — AI Project Copilot**
Persisted chat history (`copilot_conversations`, `copilot_messages`) per
user per project, including citation references for RAG-backed answers.

**20 — Indexes**
Supporting indexes for all tables introduced in 11–19. Must run last.

## Notes for backend integration

- Connect via a standard Postgres connection string:
  `postgresql://<user>:<password>@<host>:<port>/procurement`
- The schema uses `UUID` primary keys (via the `uuid-ossp` extension),
  `JSONB` for flexible fields, and `CHECK` constraints in place of enums —
  most ORMs (Prisma, SQLAlchemy, etc.) can introspect this directly.
- Embeddings are intentionally *not* stored in Postgres. Pair this schema
  with a vector store (Chroma, pgvector, or Pinecone) for the RAG layer,
  and write only the `vector_ref` back into `document_chunks`.