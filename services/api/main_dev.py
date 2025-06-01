"""
Agentes de Conversão - Backend Development Server
Simplified FastAPI server for development and testing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from typing import Dict, Any

# Initialize FastAPI app
app = FastAPI(
    title="Agentes de Conversão API",
    description="AI Agent Orchestration Platform",
    version="1.0.0"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "operational",
        "service": "Agentes de Conversão API",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "checks": {
            "api": "operational",
            "database": "simulated_ok",
            "redis": "simulated_ok",
            "ai_models": "simulated_ok"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/agents")
async def list_agents():
    """List available agents (mock data for development)"""
    return {
        "agents": [
            {
                "id": "agent-001",
                "name": "Customer Support Agent",
                "status": "active",
                "model": "claude-3-sonnet",
                "channels": ["whatsapp", "web"]
            },
            {
                "id": "agent-002", 
                "name": "Sales Assistant",
                "status": "active",
                "model": "gpt-4",
                "channels": ["whatsapp", "telegram"]
            }
        ]
    }

@app.get("/api/v1/agents")
async def list_agents_v1():
    """List available agents from Supabase - API v1"""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        import json
        
        # Direct PostgreSQL connection to bypass RLS for development
        conn = psycopg2.connect(
            host="db.faccixlabriqwxkxqprw.supabase.co",
            port=5432,
            database="postgres",
            user="postgres",
            password="Alegria2025$%"
        )
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM agents")
            agents = [dict(row) for row in cursor.fetchall()]
            
        conn.close()
        
        return {
            "agents": agents,
            "count": len(agents),
            "source": "direct_postgres_connection"
        }
        
    except Exception as e:
        print(f"Error fetching from PostgreSQL: {e}")
        return await list_agents()

@app.post("/api/v1/agents")
async def create_agent(agent_data: Dict[str, Any]):
    """Create new agent (mock implementation)"""
    return {
        "success": True,
        "agent_id": f"agent-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": "Agent created successfully (development mode)"
    }

@app.get("/conversations")
async def list_conversations():
    """List conversations (mock data)"""
    return {
        "conversations": [
            {
                "id": "conv-001",
                "agent_id": "agent-001",
                "channel": "whatsapp",
                "status": "active",
                "messages_count": 15,
                "last_activity": datetime.now().isoformat()
            }
        ]
    }

@app.get("/api/v1/conversations")
async def list_conversations_v1():
    """List conversations from Supabase - API v1"""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        # Direct PostgreSQL connection to bypass RLS for development
        conn = psycopg2.connect(
            host="db.faccixlabriqwxkxqprw.supabase.co",
            port=5432,
            database="postgres",
            user="postgres",
            password="Alegria2025$%"
        )
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM conversations")
            conversations = [dict(row) for row in cursor.fetchall()]
            
        conn.close()
        
        return {
            "conversations": conversations,
            "count": len(conversations),
            "source": "direct_postgres_connection"
        }
        
    except Exception as e:
        print(f"Error fetching conversations from PostgreSQL: {e}")
        return await list_conversations()

@app.get("/api/v1/organizations")
async def list_organizations_v1():
    """List organizations from Supabase - API v1"""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        # Direct PostgreSQL connection to bypass RLS for development
        conn = psycopg2.connect(
            host="db.faccixlabriqwxkxqprw.supabase.co",
            port=5432,
            database="postgres",
            user="postgres",
            password="Alegria2025$%"
        )
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM organizations")
            organizations = [dict(row) for row in cursor.fetchall()]
            
        conn.close()
        
        return {
            "organizations": organizations,
            "count": len(organizations),
            "source": "direct_postgres_connection"
        }
        
    except Exception as e:
        print(f"Error fetching organizations from PostgreSQL: {e}")
        return {
            "organizations": [],
            "count": 0,
            "error": str(e)
        }

if __name__ == "__main__":
    print("🚀 Starting Agentes de Conversão Development Server...")
    print("📊 Environment: Development")
    print("🔗 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "main_dev:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
