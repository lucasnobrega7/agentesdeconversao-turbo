"""
=============================================================================
AGENTS ROUTER - CORE DO SISTEMA DE CONVERSÃO
Onde a mágica acontece e as conversas viram dinheiro
=============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from app.services.agent_service import AgentService

router = APIRouter(prefix="/api/v1/agents", tags=["Agents"])

@router.post("/", response_model=AgentResponse)
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria um novo agente de conversão - o que vai fazer seu dinheiro"""
    service = AgentService(db)
    agent = await service.create_agent(agent_data, current_user.id)
    return agent

@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todos os agentes - seu exército de conversão"""
    service = AgentService(db)
    agents = await service.get_user_agents(current_user.id, skip, limit)
    return agents

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Busca um agente específico"""
    service = AgentService(db)
    agent = await service.get_agent(agent_id, current_user.id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente não encontrado ou você não tem acesso"
        )
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent_data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualiza um agente - melhore suas conversões"""
    service = AgentService(db)
    agent = await service.update_agent(agent_id, agent_data, current_user.id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente não encontrado ou você não tem acesso"
        )
    return agent

@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deleta um agente - use com cuidado"""
    service = AgentService(db)
    success = await service.delete_agent(agent_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente não encontrado ou você não tem acesso"
        )
    return {"message": "Agente deletado com sucesso"}

@router.post("/{agent_id}/chat")
async def chat_with_agent(
    agent_id: UUID,
    message: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Conversa com o agente - onde a conversão acontece"""
    service = AgentService(db)
    response = await service.chat_with_agent(agent_id, message, current_user.id)
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente não encontrado ou indisponível"
        )
    return response

@router.get("/{agent_id}/analytics")
async def get_agent_analytics(
    agent_id: UUID,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analytics do agente - números que importam"""
    service = AgentService(db)
    analytics = await service.get_agent_analytics(agent_id, current_user.id, days)
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente não encontrado ou você não tem acesso"
        )
    return analytics