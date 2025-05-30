"""
Migrate Database - Create all tables for Agentes de Conversão
"""
import asyncio
import asyncpg
from pathlib import Path

# Use the correct database URL from Supabase  
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DATABASE_URL = "postgresql://postgres.faccixlabriqwxkxqprw:FJebCNnECCFaIhXr@aws-0-us-east-1.pooler.supabase.com:5432/postgres"


async def run_migrations():
    print("🚀 Starting Database Migration for Agentes de Conversão")
    print("=" * 60)
    
    try:
        # Connect to database
        print("📡 Connecting to database...")
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected successfully")
        
        # Read migration file
        migration_path = Path(__file__).parent / "supabase" / "migrations" / "001_initial_schema.sql"
        
        if migration_path.exists():
            print(f"\n📄 Reading migration file: {migration_path}")
            with open(migration_path, 'r') as f:
                migration_sql = f.read()
            
            print("🔨 Executing migration...")
            await conn.execute(migration_sql)
            print("✅ Migration executed successfully")
            
            # Verify tables were created
            tables = await conn.fetch("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('organizations', 'users', 'agents', 'conversations', 'messages')
                ORDER BY table_name
            """)
            
            print(f"\n📊 Verified {len(tables)} core tables created:")
            for table in tables:
                print(f"   ✅ {table['table_name']}")
                
        else:
            print(f"❌ Migration file not found at: {migration_path}")
            print("Creating tables directly...")
            
            # Create tables directly
            await conn.execute("""
                -- Enable extensions
                CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
                CREATE EXTENSION IF NOT EXISTS "pg_trgm";
                
                -- Organizations table
                CREATE TABLE IF NOT EXISTS organizations (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    email VARCHAR(255) NOT NULL,
                    settings JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Users table  
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'user',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Agents table
                CREATE TABLE IF NOT EXISTS agents (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    slug VARCHAR(100) NOT NULL,
                    description TEXT,
                    model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
                    system_prompt TEXT,
                    status VARCHAR(50) DEFAULT 'draft',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(organization_id, slug)
                );
                
                -- Conversations table
                CREATE TABLE IF NOT EXISTS conversations (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
                    title VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Messages table
                CREATE TABLE IF NOT EXISTS messages (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                    role VARCHAR(50) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            print("✅ Basic tables created successfully")
        
        await conn.close()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print(f"Error type: {type(e).__name__}")
        return False
    
    return True


if __name__ == "__main__":
    success = asyncio.run(run_migrations())
    if not success:
        exit(1)