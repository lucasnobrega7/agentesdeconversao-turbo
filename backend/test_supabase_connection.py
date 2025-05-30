"""
Test Supabase Connection
Quick test to verify Supabase is properly configured
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import after loading env vars
from app.core.supabase import supabase_connection
from app.core.config import settings


async def test_connection():
    """Test Supabase connection"""
    print("🚀 Testing Supabase Connection for Agentes de Conversão")
    print("=" * 60)
    
    # Test connection
    status = await supabase_connection.check_connection()
    
    print(f"📊 Connection Status:")
    print(f"  Database: {'✅' if status['database'] else '❌'}")
    print(f"  Auth: {'✅' if status['auth'] else '❌'}")
    print(f"  Storage: {'✅' if status['storage'] else '❌'}")
    
    if status['errors']:
        print(f"\n❌ Errors found:")
        for error in status['errors']:
            print(f"  - {error}")
    else:
        print(f"\n✅ All connections working!")
    
    # Close connections
    await supabase_connection.close()
    
    return all([status['database'], status['auth'], status['storage']])


if __name__ == "__main__":
    # Check environment
    if not os.getenv('SUPABASE_URL'):
        print("❌ Missing SUPABASE_URL in .env file")
        print("📄 Copy .env.example to .env and add your Supabase credentials")
        exit(1)
    
    # Run test
    success = asyncio.run(test_connection())