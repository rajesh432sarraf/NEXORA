import asyncio
import logging
from app.db.session import engine
from app.db.base import Base
from app.models.purchase_order import PurchaseOrder
from app.models.procurement import ProcurementItem
from app.models.timeline import Milestone


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    # Only create the three NEW tables — don't touch existing ones
    tables_to_create = [
        PurchaseOrder.__table__,
        ProcurementItem.__table__,
        Milestone.__table__,
    ]
    async with engine.begin() as conn:
        logger.info(f"Creating {len(tables_to_create)} new tables: {[t.name for t in tables_to_create]}")
        await conn.run_sync(
            lambda sync_conn: Base.metadata.create_all(
                bind=sync_conn,
                tables=tables_to_create,
                checkfirst=True,
            )
        )
        logger.info("Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
