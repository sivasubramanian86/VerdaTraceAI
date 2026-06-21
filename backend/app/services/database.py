import logging
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Global variables for engine and session factory
engine = None
AsyncSessionLocal = None

if settings.USE_ALLOYDB:
    logger.info("Initializing AlloyDB connection pool...")
    engine = create_async_engine(settings.ALLOYDB_URI, echo=False, pool_size=10, max_overflow=20)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
else:
    logger.warning("AlloyDB disabled (USE_ALLOYDB=False). Using mock data fallback.")


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """Dependency to get an async DB session."""
    if not settings.USE_ALLOYDB:
        # Yield a mock or raise an exception when DB is disabled
        yield None
        return

    async with AsyncSessionLocal() as session:
        yield session
