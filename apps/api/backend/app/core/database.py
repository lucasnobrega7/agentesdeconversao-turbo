from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  Supabase client não disponível - usando modo fallback")

from .config import settings

class DatabaseService:
    def __init__(self):
        self.supabase_client = None
        self.use_supabase = False
        
        # Fallback storage
        self.agents_db = {}
        self.conversations_db = {}
        self.users_db = {}
        
        # Initialize Supabase if available
        if SUPABASE_AVAILABLE:
            try:
                self.supabase_client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_KEY
                )
                self.use_supabase = True
                print("✅ Supabase client inicializado")
            except Exception as e:
                print(f"⚠️  Falha na inicialização do Supabase: {e}")
    
    # Agent methods
    async def get_agents(self, organization_id: Optional[str] = None) -> List[dict]:
        """Retrieve all agents, optionally filtered by organization"""
        if self.use_supabase:
            try:
                query = self.supabase_client.table("agents").select("*")
                if organization_id:
                    query = query.eq("organization_id", organization_id)
                response = query.execute()
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Supabase error: {e}")
        return list(self.agents_db.values())
    
    async def create_agent(self, agent_data: dict) -> dict:
        """Create a new agent"""
        if "id" not in agent_data:
            agent_data["id"] = str(uuid.uuid4())
        
        now = datetime.utcnow().isoformat()
        agent_data.update({
            "created_at": now,
            "updated_at": now
        })
        
        if self.use_supabase:
            try:
                response = self.supabase_client.table("agents").insert(agent_data).execute()
                if response.data:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        self.agents_db[agent_data["id"]] = agent_data
        return agent_data
    
    async def get_agent(self, agent_id: str) -> Optional[dict]:
        """Get a specific agent by ID"""
        if self.use_supabase:
            try:
                response = self.supabase_client.table("agents").select("*").eq("id", agent_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        return self.agents_db.get(agent_id)

# Global database service instance
database = DatabaseService()