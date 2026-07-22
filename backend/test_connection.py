"""
test_connection.py
Run this from the backend root (same folder as .env) to confirm the app
is actually connecting to Postgres (procurement), not the SQLite fallback.

Usage:
    python test_connection.py
"""
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Import the real settings the same way the app does, so this test
# reflects exactly what the app will use.
from app.core.config import settings


async def test_connection():
    print(f"Connecting using: {settings.DATABASE_URL.split('@')[-1]}")  # hides credentials, shows host/db only

    if "sqlite" in settings.DATABASE_URL:
        print("WARNING: DATABASE_URL is still pointing at SQLite, not Postgres.")
        print("Check that .env is in the same folder this script is run from,")
        print("and that the variable name is exactly DATABASE_URL.")
        return

    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT current_database(), current_user;"))
        db_name, db_user = result.fetchone()
        print(f"Connected successfully to database '{db_name}' as user '{db_user}'.")

        # Confirm it can actually see your real tables
        result = await conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
        ))
        table_count = result.scalar()
        print(f"Found {table_count} tables in the public schema (expect 20).")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_connection())
