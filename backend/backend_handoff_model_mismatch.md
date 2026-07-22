# Backend Handoff: SQLAlchemy Models Mismatch

## What's confirmed working

- Postgres database `procurement` exists, correctly structured — all 20 tables match the designed schema and migrations
- Seed data is intact and queryable, including joins across tables
- The FastAPI backend successfully connects to `procurement` end-to-end — proven by a real SQL query reaching Postgres and getting a real, specific response back
- `.env` is configured correctly and gitignored
- The Docker `docker-compose.yml` conflict has been identified and avoided (see below) — no db was created or lost because of it

**Bottom line: the database and the connection are not the problem.**

## The actual problem: SQLAlchemy models don't match the real schema

Registering a test user through the backend threw:

```
sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError)
<class 'asyncpg.exceptions.UndefinedColumnError'>: column users.hashed_password does not exist
```

This is Postgres correctly rejecting a malformed query — the DB is doing its job. The issue is in `app/models/user.py`: the SQLAlchemy `User` model was written with column names that don't match the real `users` table.

**Confirmed mismatches on `users` alone:**

| Model expects | Actual DB column | Status |
|---|---|---|
| `hashed_password` | `password_hash` | wrong name |
| `full_name` | *(doesn't exist)* | missing from DB |
| `updated_at` | *(doesn't exist)* | missing from DB |

This is one table out of 20. Based on the incomplete import list in `app/db/base.py`, the same divergence likely exists across **7 of the 20 models** (some with wrong column names, others possibly missing entirely — 13 models weren't imported there at all).

## Recommended fix

Generate the correct models directly from the live database rather than hand-fixing each one:

```powershell
pip install sqlacodegen
sqlacodegen postgresql+psycopg2://postgres:yourpassword@127.0.0.1:5432/procurement --outfile models_generated_reference.py
```

Note: `sqlacodegen` needs the **sync** driver (`psycopg2`) in the URL for this one command, even though the app runs async elsewhere.

This produces one file with SQLAlchemy classes matching all 20 real tables exactly — correct column names, types, and foreign keys, since it's generated straight from the schema.

**Don't overwrite `app/models/` directly.** Save as `models_generated_reference.py` first, so nothing breaks for anyone currently working off the existing models, and it can be compared side-by-side before swapping in.

## Decision needed from the team

Two options once the reference file exists:
1. **Wholesale swap** — replace the old models with the generated ones, update `app/db/base.py` imports, rerun tests. Fastest, but breaks any code that currently references old attribute names like `full_name`.
2. **Add the missing columns instead** — if other code actually depends on `full_name`/`updated_at` existing, that's a schema change (new migration) rather than a model fix, and needs more careful planning.

## Two smaller items worth fixing in the same pass

1. **`docker-compose.yml` conflict** — the `db:` service in this file spins up a brand-new, empty Postgres container mapped to port 5432, which collides with (or silently duplicates) the local Postgres instance actually holding the real data. Comment out or delete the `db:` service block so nobody on the team accidentally runs it and either hits a port collision or starts working against an empty database.
2. **`requirements.txt` gaps** — worth a pass to confirm it lists everything actually in use (`asyncpg`, `sqlalchemy`, `alembic`, `pydantic-settings`, etc.) so a fresh environment install doesn't silently break.

## What to bring to the team

> Backend is correctly connected to Postgres (`procurement`) — verified the whole chain start to finish. But hit a real error: the `User` model expects columns like `hashed_password`, `full_name`, `updated_at` that don't exist in our actual `users` table (it has `password_hash`, no `full_name`, no `updated_at`). Same story is likely true for the other 6 models. I can generate correct models straight from the live database with `sqlacodegen` — should we do that, or does someone want to manually align the existing models to the schema instead?
