#!/usr/bin/env python3
"""
🚀 AGENTES DE CONVERSÃO - FULL INTEGRATION TEST
Enterprise System Validation with Direct PostgreSQL Connection
"""

import requests
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000"

# Database connection parameters
DB_CONFIG = {
    "host": "db.faccixlabriqwxkxqprw.supabase.co",
    "port": 5432,
    "database": "postgres",
    "user": "postgres",
    "password": "Alegria2025$%"
}

def test_api_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint and return the response"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        return {
            "endpoint": endpoint,
            "status_code": response.status_code,
            "data": response.json() if response.headers.get('content-type') == 'application/json' else response.text,
            "success": response.status_code == 200
        }
    except Exception as e:
        return {
            "endpoint": endpoint,
            "status_code": 0,
            "error": str(e),
            "success": False
        }

def test_database_direct():
    """Test direct database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Test basic queries
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
            tables = [row['tablename'] for row in cursor.fetchall()]
            
            # Count records in each table
            table_counts = {}
            for table in tables:
                if not table.startswith('_'):
                    cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                    table_counts[table] = cursor.fetchone()['count']
        
        conn.close()
        
        return {
            "success": True,
            "tables": tables,
            "record_counts": table_counts
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def run_full_integration_test():
    """Run comprehensive integration test"""
    print("🚀 AGENTES DE CONVERSÃO - FULL INTEGRATION TEST")
    print("=" * 60)
    
    # Test 1: Database Direct Connection
    print("\n1. 🗄️ DATABASE DIRECT CONNECTION TEST")
    print("-" * 40)
    db_result = test_database_direct()
    if db_result["success"]:
        print("✅ Database connection: SUCCESS")
        print(f"📊 Tables found: {len(db_result['tables'])}")
        for table, count in db_result["record_counts"].items():
            print(f"   📋 {table}: {count} records")
    else:
        print(f"❌ Database connection: FAILED - {db_result['error']}")
    
    # Test 2: API Health Check
    print("\n2. 🏥 API HEALTH CHECK")
    print("-" * 40)
    health_test = test_api_endpoint("/health")
    if health_test["success"]:
        print("✅ API Health: SUCCESS")
        print(f"   📡 Status: {health_test['data']['status']}")
    else:
        print(f"❌ API Health: FAILED")
    
    # Test 3: Enterprise Endpoints
    print("\n3. 🏢 ENTERPRISE ENDPOINTS TEST")
    print("-" * 40)
    
    endpoints_to_test = [
        "/api/v1/organizations",
        "/api/v1/agents", 
        "/api/v1/conversations",
        "/agents",
        "/conversations"
    ]
    
    results = {}
    for endpoint in endpoints_to_test:
        result = test_api_endpoint(endpoint)
        results[endpoint] = result
        
        if result["success"]:
            data = result["data"]
            count = data.get("count", len(data)) if isinstance(data, dict) else "unknown"
            source = data.get("source", "mock") if isinstance(data, dict) else "unknown"
            print(f"✅ {endpoint}: SUCCESS - {count} items ({source})")
        else:
            print(f"❌ {endpoint}: FAILED - {result.get('error', 'Unknown error')}")
    
    # Test 4: System Integration Summary
    print("\n4. 📊 SYSTEM INTEGRATION SUMMARY")
    print("-" * 40)
    
    total_tests = len(endpoints_to_test) + 2  # endpoints + db + health
    successful_tests = sum(1 for r in results.values() if r["success"]) + \
                      (1 if db_result["success"] else 0) + \
                      (1 if health_test["success"] else 0)
    
    success_rate = (successful_tests / total_tests) * 100
    
    print(f"🎯 Success Rate: {success_rate:.1f}% ({successful_tests}/{total_tests})")
    print(f"⚡ Database Integration: {'✅ ACTIVE' if db_result['success'] else '❌ FAILED'}")
    print(f"🔗 API Integration: {'✅ ACTIVE' if health_test['success'] else '❌ FAILED'}")
    
    if success_rate >= 80:
        print("\n🏆 ENTERPRISE SYSTEM STATUS: OPERATIONAL ✅")
        print("🚀 Ready for advanced feature implementation!")
    else:
        print("\n⚠️ ENTERPRISE SYSTEM STATUS: NEEDS ATTENTION")
        print("🔧 Some components require fixes before proceeding.")
    
    # Return comprehensive results
    return {
        "success_rate": success_rate,
        "database": db_result,
        "api_health": health_test,
        "endpoints": results,
        "timestamp": datetime.now().isoformat(),
        "operational": success_rate >= 80
    }

if __name__ == "__main__":
    results = run_full_integration_test()
    
    # Save results to file
    with open("integration_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📁 Full results saved to: integration_test_results.json")