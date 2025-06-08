from fastapi import APIRouter, HTTPException, Depends
from typing import List

router = APIRouter()

@router.get("/")
async def list_agents():
    """List all agents"""
    return {"agents": []}

@router.post("/")
async def create_agent():
    """Create a new agent"""
    return {"message": "Agent created"}

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get agent by ID"""
    return {"agent_id": agent_id}

@router.put("/{agent_id}")
async def update_agent(agent_id: str):
    """Update agent"""
    return {"message": f"Agent {agent_id} updated"}

@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete agent"""
    return {"message": f"Agent {agent_id} deleted"}
