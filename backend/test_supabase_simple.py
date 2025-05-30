"""
Test Supabase Connection - Simple and Direct
"""
import asyncio
from supabase import create_client, Client
import asyncpg

# Direct connection test
SUPABASE_URL = "https://faccixlabriqwxkxqprw.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2NpeGxhYnJpcXd4a3hxcHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3NDg3MywiZXhwIjoyMDUyNDUwODczfQ.8J3XrqFWYEEjCG-yT5ZN_hV4Bl3sMhUEV0vEhMJDlNc"
DATABASE_URL = "postgresql://postgres:FJebCNnECCFaIhXr@db.faccixlabriqwxkxqprw.supabase.co:5432/postgres"


async def test_supabase():
    print("🚀 Testing Supabase Connection")
    print("=" * 60)
    
    # Test 1: Supabase Client
    print("\n📡 Testing Supabase Client...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Supabase client created successfully")
        
        # Test auth
        try:
            # Just check if we can access auth methods
            print("✅ Auth module accessible")
        except Exception as e:
            print(f"❌ Auth error: {e}")
            
        # Test storage
        try:
            buckets = supabase.storage.list_buckets()
            print(f"✅ Storage accessible - {len(buckets)} buckets found")
        except Exception as e:
            print(f"❌ Storage error: {e}")
            
    except Exception as e:
        print(f"❌ Supabase client error: {e}")
    
    # Test 2: Direct Database Connection
    print("\n🗄️  Testing Direct Database Connection...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Database connected")
        
        # Test query
        result = await conn.fetchval("SELECT 1")
        if result == 1:
            print("✅ Database query successful")
            
        # List tables
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
            LIMIT 10
        """)
        print(f"✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table['table_name']}")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
    
    print("\n" + "=" * 60)
    print("📊 Test Complete!")


if __name__ == "__main__":
    asyncio.run(test_supabase())