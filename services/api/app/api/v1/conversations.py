"""
=============================================================================
CONVERSATIONS ROUTER - ONDE AS CONVERSAS VIRAM DINHEIRO
Engine principal que transforma interações em conversões
=============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.conversation import ConversationResponse, ConversationCreate, MessageCreate
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/api/v1/conversations", tags=["Conversations"])

@router.post("/", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Inicia uma nova conversa - onde tudo começa"""
    service = ConversationService(db)
    conversation = await service.create_conversation(conversation_data, current_user.id)
    return conversation

@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    agent_id: Optional[UUID] = Query(None, description="Filtrar por agente"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista conversas - seu pipeline de conversão"""
    service = ConversationService(db)
    conversations = await service.get_user_conversations(
        current_user.id, agent_id, status, skip, limit
    )
    return conversations

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Busca conversa específica com histórico completo"""
    service = ConversationService(db)
    conversation = await service.get_conversation(conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou você não tem acesso"
        )
    return conversation

@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: UUID,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Envia mensagem na conversa - a ação que converte"""
    service = ConversationService(db)
    result = await service.send_message(conversation_id, message_data, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou indisponível"
        )
    return result

@router.patch("/{conversation_id}/status")
async def update_conversation_status(
    conversation_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualiza status da conversa - follow up ou conversão"""
    service = ConversationService(db)
    success = await service.update_status(conversation_id, status, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou você não tem acesso"
        )
    return {"message": f"Status atualizado para: {status}"}

@router.get("/{conversation_id}/summary")
async def get_conversation_summary(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resumo IA da conversa - insights automáticos"""
    service = ConversationService(db)
    summary = await service.generate_summary(conversation_id, current_user.id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou ainda sem mensagens"
        )
    return summary

@router.get("/analytics/overview")
async def conversations_overview(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Overview de todas as conversas - dashboard principal"""
    service = ConversationService(db)
    overview = await service.get_conversations_overview(
        current_user.id, start_date, end_date
    )
    return overview

@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deleta conversa - use com cuidado"""
    service = ConversationService(db)
    success = await service.delete_conversation(conversation_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou você não tem acesso"
        )
    return {"message": "Conversa deletada com sucesso"}