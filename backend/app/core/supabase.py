"""
Supabase Integration Module
Handles all Supabase connections including database, auth, and storage
"""
from typing import Optional, Dict, Any
from functools import lru_cache
import logging

from supabase import create_client, Client
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger(__name__)

# SQLAlchemy Base for models
Base = declarative_base()


class SupabaseConnection:
    """
    Manages Supabase connections for different services
    """
    
    def __init__(self):
        self._client: Optional[Client] = None
        self._async_engine = None
        self._async_session = None
        
    @property
    def client(self) -> Client:
        """Get Supabase client for auth, storage, and realtime"""
        if not self._client:
            self._client = create_client(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_SERVICE_KEY
            )
            logger.info("Supabase client initialized")
        return self._client
    
    @property
    def async_engine(self):
        """Get async SQLAlchemy engine for database operations"""
        if not self._async_engine:
            # Build database URL from Supabase URL
            # Extract project reference from URL
            project_ref = settings.SUPABASE_URL.split("//")[1].split(".")[0]
            
            # Construct async database URL
            db_url = (
                f"postgresql+asyncpg://postgres.{project_ref}:"
                f"{settings.SUPABASE_SERVICE_KEY}@"
                f"db.{project_ref}.supabase.co:5432/postgres"
            )
            
            # Create async engine with proper configuration
            self._async_engine = create_async_engine(
                db_url,
                # Use NullPool for serverless/connection pooling
                poolclass=NullPool,
                echo=settings.DEBUG,
                future=True,
                connect_args={
                    "server_settings": {
                        "application_name": f"{settings.PROJECT_NAME}_{settings.VERSION}",
                    },
                    "command_timeout": 60,
                    "ssl": "require" if settings.is_production else "prefer"
                }
            )
            logger.info("Async database engine initialized")
            
        return self._async_engine
    
    @property
    def async_session_maker(self) -> async_sessionmaker:
        """Get async session maker for database operations"""
        if not self._async_session:
            self._async_session = async_sessionmaker(
                bind=self.async_engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=False,
                autocommit=False
            )
        return self._async_session
    
    async def get_session(self) -> AsyncSession:
        """Get database session for dependency injection"""
        async with self.async_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def init_database(self):
        """Initialize database tables"""
        async with self.async_engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables initialized")
    
    async def check_connection(self) -> Dict[str, Any]:
        """Check all Supabase connections"""
        status = {
            "database": False,
            "auth": False,
            "storage": False,
            "errors": []
        }
        
        # Check database connection
        try:
            async with self.async_session_maker() as session:
                result = await session.execute("SELECT 1")
                status["database"] = result.scalar() == 1
        except Exception as e:
            status["errors"].append(f"Database: {str(e)}")
        
        # Check Supabase client (auth/storage)
        try:
            # Try to get auth settings
            auth_response = self.client.auth.get_session()
            status["auth"] = True
        except Exception as e:
            status["errors"].append(f"Auth: {str(e)}")
        
        # Check storage buckets
        try:
            buckets = self.client.storage.list_buckets()
            status["storage"] = True
        except Exception as e:
            status["errors"].append(f"Storage: {str(e)}")
        
        return status
    
    async def close(self):
        """Close all connections"""
        if self._async_engine:
            await self._async_engine.dispose()
            logger.info("Database connections closed")


# Singleton instance
supabase_connection = SupabaseConnection()


# Dependency for FastAPI
async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async for session in supabase_connection.get_session():
        yield session


# Direct access to Supabase client
def get_supabase_client() -> Client:
    """Get Supabase client for auth, storage, etc."""
    return supabase_connection.client


# Export commonly used items
__all__ = [
    "Base",
    "supabase_connection",
    "get_db",
    "get_supabase_client",
]