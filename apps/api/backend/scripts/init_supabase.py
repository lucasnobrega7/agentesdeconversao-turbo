"""
Initialize Supabase Database
Creates all necessary tables and initial data
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.supabase import supabase_connection
from app.core.config import settings
from app.models.base import Base
from app.models import user, organization, agent, conversation, knowledge

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init_database():
    """Initialize database with all tables"""
    try:
        logger.info("Starting database initialization...")
        
        # Test connection
        logger.info("Testing Supabase connection...")
        status = await supabase_connection.check_connection()
        
        if not status["database"]:
            logger.error(f"Database connection failed: {status['errors']}")
            return False
        
        logger.info("✅ Database connection successful")
        
        # Initialize database tables
        logger.info("Creating database tables...")
        await supabase_connection.init_database()
        logger.info("✅ Database tables created")
        
        # Create initial data
        await create_initial_data()
        
        logger.info("✅ Database initialization complete!")
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        return False
    finally:
        await supabase_connection.close()


async def create_initial_data():
    """Create initial data for the application"""
    from app.core.security import get_password_hash
    from app.models.organization import Organization
    from app.models.user import User
    
    async with supabase_connection.async_session_maker() as session:
        try:
            # Check if we already have data
            result = await session.execute("SELECT COUNT(*) FROM organizations")
            count = result.scalar()
            
            if count > 0:
                logger.info("Initial data already exists, skipping...")
                return
            
            logger.info("Creating initial organization...")
            
            # Create default organization
            default_org = Organization(
                name="Agentes de Conversão",
                slug="agentes-conversao",
                description="Organização principal do sistema",
                email="admin@agentesdeconversao.ai",
                settings={
                    "max_agents": 100,
                    "max_users": 50,
                    "features": ["all"]
                },
                metadata_json={
                    "created_by": "system",
                    "is_default": True
                }
            )
            session.add(default_org)
            await session.flush()
            
            logger.info("Creating default admin user...")
            
            # Create admin user
            admin_user = User(
                email="admin@agentesdeconversao.ai",
                username="admin",
                full_name="System Administrator",
                display_name="Admin",
                password_hash=get_password_hash("Admin@123!"),
                role="super_admin",
                status="active",
                is_email_verified=True,
                organization_id=default_org.id,
                metadata_json={
                    "created_by": "system",
                    "is_default": True
                }
            )
            session.add(admin_user)
            
            await session.commit()
            logger.info("✅ Initial data created successfully")
            logger.info("Default login: admin@agentesdeconversao.ai / Admin@123!")
            logger.info("⚠️  CHANGE THE PASSWORD IMMEDIATELY!")
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to create initial data: {str(e)}")
            raise


async def check_tables():
    """Check which tables exist in the database"""
    async with supabase_connection.async_session_maker() as session:
        result = await session.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in result.fetchall()]
        
        logger.info(f"Existing tables: {tables}")
        
        expected_tables = [
            'organizations',
            'users',
            'agents',
            'conversations',
            'messages',
            'knowledge_bases',
            'documents',
            'api_keys'
        ]
        
        missing_tables = [t for t in expected_tables if t not in tables]
        if missing_tables:
            logger.warning(f"Missing tables: {missing_tables}")
        else:
            logger.info("✅ All expected tables exist")


if __name__ == "__main__":
    # Run the initialization
    success = asyncio.run(init_database())
    
    if success:
        # Check tables
        asyncio.run(check_tables())
    else:
        sys.exit(1)