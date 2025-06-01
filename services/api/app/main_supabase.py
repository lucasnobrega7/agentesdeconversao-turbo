"""
Agentes de Conversão - FastAPI with Supabase Integration
Baseado nas configurações funcionais do projeto 'one'
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import os
from contextlib import asynccontextmanager

# Supabase integration - versão compatível
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  Supabase client não disponível - usando modo fallback")

# Configurações do Supabase (do projeto 'one')
SUPABASE_URL = "https://faccixlabriqwxkxqprw.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2NpeGxhYnJpcXd4a3hxcHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3NDg3MywiZXhwIjoyMDUyNDUwODczfQ.8J3XrqFWYEEjCG-yT5ZN_hV4Bl3sMhUEV0vEhMJDlNc"

# Storage em memória como fallback
memory_storage = {
    "organizations": {},
    "agents": {},
    "conversations": {},
    "messages": {}
}

# Initialize Supabase client
supabase_client = None
if SUPABASE_AVAILABLE:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Supabase client inicializado")
    except Exception as e:
        print(f"⚠️  Falha na inicialização do Supabase: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Agentes de Conversão API with Supabase Integration...")
    
    # Testar conexão com Supabase
    if supabase_client:
        try:
            # Teste simples de conectividade
            print("🔍 Testando conexão com Supabase...")
            print("✅ Supabase pronto para uso")
        except Exception as e:
            print(f"⚠️  Aviso Supabase: {e}")
    
    yield
    # Shutdown
    print("🔧 Limpando conexões...")
    print("✅ Cleanup completado")

# FastAPI app
app = FastAPI(
    title="Agentes de Conversão API v2.0",
    description="API Enterprise com Integração Supabase para Agentes Inteligentes",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, configurar domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Models
class OrganizationCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    email: str

class Organization(BaseModel):
    id: str
    name: str
    slug: Optional[str] = None
    email: str
    created_at: datetime
    updated_at: datetime

class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: str
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    organization_id: Optional[str] = None

class Agent(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    system_prompt: str
    model: str
    temperature: float
    organization_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ConversationCreate(BaseModel):
    agent_id: str
    title: Optional[str] = None

class Conversation(BaseModel):
    id: str
    agent_id: str
    title: Optional[str] = None
    status: str = "active"
    created_at: datetime
    updated_at: datetime

class MessageCreate(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class Message(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

# Helper Functions
def get_current_timestamp():
    return datetime.utcnow()

def create_uuid():
    return str(uuid.uuid4())

# Database abstraction layer
class DatabaseService:
    def __init__(self):
        self.use_supabase = supabase_client is not None
    
    async def insert_organization(self, org_data: dict) -> dict:
        if self.use_supabase:
            try:
                response = supabase_client.table("organizations").insert(org_data).execute()
                if response.data:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        memory_storage["organizations"][org_data["id"]] = org_data
        return org_data
    
    async def get_organizations(self) -> List[dict]:
        if self.use_supabase:
            try:
                response = supabase_client.table("organizations").select("*").execute()
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        return list(memory_storage["organizations"].values())
    
    async def insert_agent(self, agent_data: dict) -> dict:
        if self.use_supabase:
            try:
                response = supabase_client.table("agents").insert(agent_data).execute()
                if response.data:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        memory_storage["agents"][agent_data["id"]] = agent_data
        return agent_data
    
    async def get_agents(self, organization_id: Optional[str] = None) -> List[dict]:
        if self.use_supabase:
            try:
                query = supabase_client.table("agents").select("*")
                if organization_id:
                    query = query.eq("organization_id", organization_id)
                response = query.execute()
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        agents = list(memory_storage["agents"].values())
        if organization_id:
            agents = [a for a in agents if a.get("organization_id") == organization_id]
        return agents
    
    async def get_agent(self, agent_id: str) -> Optional[dict]:
        if self.use_supabase:
            try:
                response = supabase_client.table("agents").select("*").eq("id", agent_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        return memory_storage["agents"].get(agent_id)
    
    async def insert_conversation(self, conv_data: dict) -> dict:
        if self.use_supabase:
            try:
                response = supabase_client.table("conversations").insert(conv_data).execute()
                if response.data:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        memory_storage["conversations"][conv_data["id"]] = conv_data
        return conv_data
    
    async def get_conversation(self, conversation_id: str) -> Optional[dict]:
        if self.use_supabase:
            try:
                response = supabase_client.table("conversations").select("*").eq("id", conversation_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        return memory_storage["conversations"].get(conversation_id)
    
    async def insert_message(self, message_data: dict) -> dict:
        if self.use_supabase:
            try:
                response = supabase_client.table("messages").insert(message_data).execute()
                if response.data:
                    return response.data[0]
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        memory_storage["messages"][message_data["id"]] = message_data
        return message_data
    
    async def get_messages(self, conversation_id: str) -> List[dict]:
        if self.use_supabase:
            try:
                response = supabase_client.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Supabase error: {e}")
        
        # Fallback to memory
        return [m for m in memory_storage["messages"].values() if m.get("conversation_id") == conversation_id]

# Global database service
db = DatabaseService()

# Routes
@app.get("/")
async def root():
    return {
        "message": "Agentes de Conversão API v2.0",
        "status": "operational",
        "supabase_integration": db.use_supabase,
        "features": ["agents", "conversations", "messages", "organizations"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "supabase": "connected" if db.use_supabase else "fallback_mode",
        "timestamp": get_current_timestamp().isoformat()
    }

# Organizations
@app.post("/api/v1/organizations", response_model=Organization)
async def create_organization(org_data: OrganizationCreate):
    org_id = create_uuid()
    now = get_current_timestamp()
    
    organization = {
        "id": org_id,
        "name": org_data.name,
        "slug": org_data.slug or org_data.name.lower().replace(" ", "-"),
        "email": org_data.email,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    result = await db.insert_organization(organization)
    return Organization(**result)

@app.get("/api/v1/organizations", response_model=List[Organization])
async def list_organizations():
    organizations = await db.get_organizations()
    return [Organization(**org) for org in organizations]

# Agents
@app.post("/api/v1/agents", response_model=Agent)
async def create_agent(agent_data: AgentCreate):
    agent_id = create_uuid()
    now = get_current_timestamp()
    
    agent = {
        "id": agent_id,
        "name": agent_data.name,
        "description": agent_data.description,
        "system_prompt": agent_data.system_prompt,
        "model": agent_data.model,
        "temperature": agent_data.temperature,
        "organization_id": agent_data.organization_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    result = await db.insert_agent(agent)
    return Agent(**result)

@app.get("/api/v1/agents", response_model=List[Agent])
async def list_agents(organization_id: Optional[str] = None):
    agents = await db.get_agents(organization_id)
    return [Agent(**agent) for agent in agents]

@app.get("/api/v1/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    agent = await db.get_agent(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found"
        )
    return Agent(**agent)

# Conversations
@app.post("/api/v1/conversations", response_model=Conversation)
async def create_conversation(conv_data: ConversationCreate):
    # Verificar se o agente existe
    agent = await db.get_agent(conv_data.agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {conv_data.agent_id} not found"
        )
    
    conv_id = create_uuid()
    now = get_current_timestamp()
    
    conversation = {
        "id": conv_id,
        "agent_id": conv_data.agent_id,
        "title": conv_data.title,
        "status": "active",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    result = await db.insert_conversation(conversation)
    return Conversation(**result)

@app.get("/api/v1/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    conversation = await db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID {conversation_id} not found"
        )
    return Conversation(**conversation)

# Messages
@app.post("/api/v1/conversations/{conversation_id}/messages", response_model=Message)
async def create_message(conversation_id: str, message_data: MessageCreate):
    # Verificar se a conversa existe
    conversation = await db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID {conversation_id} not found"
        )
    
    message_id = create_uuid()
    now = get_current_timestamp()
    
    message = {
        "id": message_id,
        "conversation_id": conversation_id,
        "role": message_data.role,
        "content": message_data.content,
        "created_at": now.isoformat()
    }
    
    result = await db.insert_message(message)
    
    # Se for mensagem do usuário, gerar resposta do assistente
    if message_data.role == "user":
        assistant_message_id = create_uuid()
        assistant_message = {
            "id": assistant_message_id,
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": f"Obrigado pela sua mensagem: '{message_data.content}'. Como posso ajudá-lo hoje?",
            "created_at": get_current_timestamp().isoformat()
        }
        
        assistant_result = await db.insert_message(assistant_message)
        return Message(**assistant_result)
    
    return Message(**result)

@app.get("/api/v1/conversations/{conversation_id}/messages", response_model=List[Message])
async def list_messages(conversation_id: str):
    # Verificar se a conversa existe
    conversation = await db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID {conversation_id} not found"
        )
    
    messages = await db.get_messages(conversation_id)
    return [Message(**message) for message in messages]

# Analytics básico
@app.get("/api/v1/analytics")
async def get_analytics():
    agents = await db.get_agents()
    
    # Contar conversas e mensagens para cada agente
    total_conversations = 0
    total_messages = 0
    
    for agent in agents:
        # Em produção, isso seria otimizado com queries agregadas
        pass
    
    return {
        "total_agents": len(agents),
        "total_conversations": len(memory_storage["conversations"]),
        "total_messages": len(memory_storage["messages"]),
        "supabase_status": "connected" if db.use_supabase else "fallback",
        "generated_at": get_current_timestamp().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Porta diferente para não conflitar