import asyncio
import logging
from app.db.session import engine
from app.db.base import Base


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    async with engine.begin() as conn:
        logger.info("Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
