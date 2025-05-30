from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

app = FastAPI(
    title="Agentes de Conversão API",
    description="API Enterprise para Agentes Inteligentes",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
agents_db = {}
conversations_db = {}

# Models
class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model: str = "gpt-3.5-turbo"
    system_prompt: str

class Agent(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    model: str
    system_prompt: str
    created_at: datetime
    updated_at: datetime

class ConversationCreate(BaseModel):
    agent_id: str
    title: Optional[str] = None

class Conversation(BaseModel):
    id: str
    agent_id: str
    title: Optional[str]
    status: str = "active"
    created_at: datetime
    updated_at: datetime

# Routes
@app.get("/")
async def root():
    return {
        "message": "Agentes de Conversão API",
        "version": "2.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/status")
async def get_status():
    return {
        "status": "operational",
        "version": "2.0.0",
        "services": {
            "api": "operational",
            "database": "mock",
            "cache": "mock"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# Agents CRUD
@app.post("/api/agents", response_model=Agent)
async def create_agent(agent: AgentCreate):
    agent_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    agent_data = Agent(
        id=agent_id,
        name=agent.name,
        description=agent.description,
        model=agent.model,
        system_prompt=agent.system_prompt,
        created_at=now,
        updated_at=now
    )
    
    agents_db[agent_id] = agent_data
    return agent_data

@app.get("/api/agents", response_model=List[Agent])
async def list_agents():
    return list(agents_db.values())

@app.get("/api/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agents_db[agent_id]

# Conversations CRUD
@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(conversation: ConversationCreate):
    if conversation.agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    conv_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    conversation_data = Conversation(
        id=conv_id,
        agent_id=conversation.agent_id,
        title=conversation.title,
        status="active",
        created_at=now,
        updated_at=now
    )
    
    conversations_db[conv_id] = conversation_data
    return conversation_data

@app.get("/api/conversations", response_model=List[Conversation])
async def list_conversations():
    return list(conversations_db.values())

@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversations_db[conversation_id]

# Analytics
@app.get("/api/analytics")
async def get_analytics():
    return {
        "total_agents": len(agents_db),
        "total_conversations": len(conversations_db),
        "timestamp": datetime.utcnow().isoformat()
    }

# User endpoints
@app.post("/api/user/complete-onboarding")
async def complete_onboarding(user_data: dict):
    return {"message": "Onboarding completed", "user_id": user_data.get("user_id")}

@app.get("/api/user/profile")
async def get_user_profile():
    return {
        "user_id": "demo-user",
        "name": "Demo User",
        "email": "demo@agentesdeconversao.ai"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)