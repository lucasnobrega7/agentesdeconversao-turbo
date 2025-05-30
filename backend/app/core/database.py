"""
=============================================================================
DATABASE.PY SIMPLIFICADO - FUNCIONA DE PRIMEIRA
Menos blablablá, mais código que roda
=============================================================================
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings

# Engine direto, sem firula
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    echo=settings.DEBUG
)

# Session factory
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency que funciona
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Health check básico
async def check_database_health() -> dict:
    try:
        async with async_session() as session:
            await session.execute("SELECT 1")
            return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
