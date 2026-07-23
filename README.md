# NEXORA

> AI-powered EPC procurement and document-intelligence workspace for data-centre and construction projects.

NEXORA brings project documents, RFQs, procurement records, vendor submissions, compliance checks, risk analysis, and executive insights into one application. It is built as a React frontend backed by a FastAPI API, PostgreSQL schema, Gemini-powered document intelligence, and FAISS-based semantic search.

## What NEXORA does

- Manage EPC projects, RFQs, purchase orders, procurement items, and milestones.
- Upload and extract text from PDF project documents.
- Search project documents semantically with Retrieval-Augmented Generation (RAG).
- Compare vendor proposals against technical specifications.
- Evaluate and rank vendors using technical, commercial, delivery, and risk signals.
- Generate procurement-risk reports and mitigation recommendations.
- Create executive procurement insights and KPIs.
- Use a conversational procurement copilot with cited project-document context.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Query, Axios, Recharts |
| Backend | Python, FastAPI, SQLAlchemy (async), Pydantic |
| Database | PostgreSQL in production; SQLite is configured as the local fallback |
| AI | Google Gemini, `sentence-transformers` |
| Search | FAISS vector index |
| PDF extraction | PyMuPDF and pdfplumber |
| Deployment config | Render |

## Architecture

```text
React / Vite frontend
        |
        | HTTP + JWT
        v
FastAPI API (/api/v1)
        |
        +-- Project, RFQ, PO, Procurement, Timeline APIs
        +-- Document extraction + parsing
        +-- RAG / FAISS semantic search
        +-- Compliance, Vendor Evaluation, Risk, Insights, Copilot engines
        |
        +-- PostgreSQL                 +-- Gemini API
        +-- Local storage / FAISS index
```

## Repository structure

```text
NEXORA/
├── frontend/                 # React + TypeScript application
│   ├── src/pages/            # Dashboard and feature pages
│   ├── src/services/         # API client and domain services
│   ├── src/components/       # Shared UI, layouts, and guards
│   └── package.json
├── backend/                  # FastAPI application
│   ├── app/api/v1/           # API routers and endpoints
│   ├── app/services/         # Business logic and AI engines
│   ├── app/models/           # SQLAlchemy models
│   ├── app/schemas/          # Request and response schemas
│   ├── app/repositories/     # Persistence abstractions
│   └── requirements.txt
├── db/migrations/            # PostgreSQL schema scripts
└── render.yaml               # Render deployment configuration
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.10+
- PostgreSQL 14+ (recommended for a full local setup)
- A Google Gemini API key for Gemini-assisted features

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/rajesh432sarraf/NEXORA.git
cd NEXORA
```

### 2. Configure the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
source .venv/bin/activate
```

Install dependencies and create `backend/.env`:

```bash
pip install -r requirements.txt
```

```env
# PostgreSQL: recommended
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/procurement
SYNC_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/procurement

# Required for Gemini-enabled features
GEMINI_API_KEY=your_gemini_api_key

# Required in non-development environments
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

For a limited local fallback, the backend defaults to SQLite when database variables are omitted. PostgreSQL is recommended because the project schema uses PostgreSQL-specific UUID and JSONB features.

### 3. Set up PostgreSQL

Create a `procurement` database and run the SQL scripts in numeric order:

```bash
psql -U <username> -d procurement -f db/migrations/01_create_extension.sql
psql -U <username> -d procurement -f db/migrations/02_organizations.sql
# Continue in numeric order through db/migrations/21_ai_reports.sql
```

`10_seed_data.sql` is optional and provides demo data.

> Important: review every migration before running it on a shared or production database. Several current scripts contain `DROP TABLE ... CASCADE` statements and are not safe as repeatable production migrations.

### 4. Start the backend

From `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Available endpoints:

- API health: <http://localhost:8000/health>
- Swagger UI: <http://localhost:8000/docs>
- OpenAPI JSON: <http://localhost:8000/api/v1/openapi.json>

### 5. Configure and start the frontend

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Then run:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Backend | Yes for PostgreSQL | Async SQLAlchemy connection URL. |
| `SYNC_DATABASE_URL` | Migration tooling | Yes for PostgreSQL migrations | Standard synchronous PostgreSQL URL. |
| `GEMINI_API_KEY` | Backend | Yes for Gemini features | Google Gemini API credential. |
| `JWT_SECRET_KEY` | Backend | Yes outside development | Secret used to sign access tokens. |
| `VITE_API_URL` | Frontend | Yes outside local development | Full API base URL ending in `/api/v1`. |

Never commit `.env` files, database passwords, or API keys.

## Main API modules

All API routes are prefixed with `/api/v1`.

| Module | Base route | Purpose |
| --- | --- | --- |
| Authentication | `/auth` | Register, log in, and retrieve the current user. |
| Dashboard | `/dashboard` | Platform summary statistics. |
| Projects | `/projects` | Project CRUD. |
| Documents | `/documents` | PDF upload, extraction, parsing, and ingestion. |
| Search | `/search` | Semantic project-document search. |
| Procurement | `/rfqs`, `/purchase-orders`, `/procurement` | Procurement workflow records. |
| Timeline | `/timeline` | Project milestones. |
| AI engines | `/compliance`, `/vendor-evaluation`, `/risk`, `/executive-insights`, `/copilot` | Intelligence and decision-support services. |

Refer to Swagger UI for the current request and response contracts.

## Useful commands

```bash
# Frontend (run inside frontend/)
npm run dev
npm run lint
npm run build
npm run preview

# Backend (run inside backend/)
uvicorn app.main:app --reload --port 8000
python -m compileall -q app
```

The repository also contains focused backend test scripts such as `test_risk_engine.py`, `test_compliance.py`, and `test_copilot.py`. Ensure the API, database schema, and required environment variables are ready before using them.

## Deployment

`render.yaml` currently provisions a Render web service for the FastAPI backend and a PostgreSQL database. To deploy the complete product, also create a static-site service for `frontend/`, run `npm run build`, and set its `VITE_API_URL` to the public backend URL plus `/api/v1`.

Before production deployment, ensure that:

- frontend production build passes;
- all frontend API contracts match the FastAPI schemas;
- database migrations are non-destructive and run automatically in a controlled release step;
- `JWT_SECRET_KEY`, Gemini credentials, and database URLs are configured as secrets;
- CORS is restricted to trusted frontend domains;
- authentication and authorization protect every data-bearing route.

## Current development status

NEXORA has the core product structure and AI modules in place, but it should be treated as an active development project. Validate the complete authentication, database migration, frontend build, and AI-feature flows before presenting it as production-ready.


## Team

| Name | GitHub |
| --- | --- |
| Divyanshu Raj | [@084divyanshuraj](https://github.com/084divyanshuraj) |
| Rajesh Kumar | [@rajesh432sarraf](https://github.com/rajesh432sarraf) |
| Ankit Sinha | [@aspect077](https://github.com/aspect077) |
| Md Asad Raza | [@Raza786-asad](https://github.com/Raza786-asad) |
