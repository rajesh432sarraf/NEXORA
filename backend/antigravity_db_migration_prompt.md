# PostgreSQL Integration Prompt for Antigravity

**Instructions for your teammate:** 
Copy the entire text below (everything inside the block) and paste it directly into the chat with their Antigravity AI assistant.

---

**PASTE THIS TO ANTIGRAVITY:**

> You are a Principal Backend Engineer. We are working on the NEXORA platform. The other half of the team just finished building the core AI Engines (Compliance, Vendor Evaluation, Risk, Copilot, Executive Insights). They built these using a decoupled Repository Pattern with local JSON storage (`Json*Repository` in `app/repositories/`).
> 
> My environment has Docker and the local PostgreSQL database running, and I have already pushed the raw SQL schemas to `db/migrations/`.
> 
> **Your Objective:** Connect the AI Engines to our PostgreSQL database.
> 
> Please execute the following steps sequentially:
> 1. Run the database migrations in `db/migrations/` against my local PostgreSQL instance to ensure all tables are created.
> 2. Look at the `app/repositories/` folder. For every `Json*Repository` (e.g., `JsonComplianceRepository`, `JsonVendorRepository`, etc.), I need you to implement a `Postgres*Repository` class that inherits from the same abstract base class.
> 3. These new Postgres repositories should use SQLAlchemy `AsyncSession` to write the complex AI JSON outputs directly into the `JSONB` columns in our database (e.g., the `vendor_scores` table, `risk_predictions` table, or `agent_findings` table). If our current tables don't fit the AI schemas well, you have permission to write a new SQL migration to create an `ai_reports` table with a generic `JSONB` column to store them safely.
> 4. Update the dependency injection in `app/api/v1/endpoints/*.py` to inject the `db: AsyncSession` into the `get_*_repository` functions, so the FastAPI endpoints use the new Postgres repositories.
> 5. Run `test_copilot.py` and `test_compliance.py` to verify that data is successfully being saved to PostgreSQL!
> 
> Please create an Implementation Plan for this and wait for my approval before coding.

---
