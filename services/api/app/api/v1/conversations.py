"""
Rotas de conversação com IA usando LiteLLM
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import json
import logging

from app.schemas.conversation import (
    MessageCreate,
    ConversationResponse,
    MessageResponse
)
from app.services.ai_service import AIService
from app.services.ai_router import AIRouter, ModelTier
from app.services.knowledge_service import KnowledgeService
from app.core.dependencies import get_current_user
from app.models.conversation import Conversation, Message
from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: str,
    message: MessageCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Envia mensagem e processa resposta com IA via LiteLLM"""
    
    # Verificar se conversa pertence ao usuário/organização
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == current_user.organization_id
    ).first()
    
    if not conversation:
        raise HTTPException(404, "Conversation not found")
    
    # Salvar mensagem do usuário
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=message.content,
        metadata=message.metadata or {}
    )
    db.add(user_message)
    db.commit()
    
    # Buscar contexto
    ai_service = AIService()
    ai_router = AIRouter()
    knowledge_service = KnowledgeService()
    
    # Histórico de conversa
    history = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).limit(20).all()
    
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history
    ]
    
    # Contexto do usuário
    user_context = {
        "user_id": current_user.id,
        "organization_id": current_user.organization_id,
        "conversation_id": conversation_id,
        "tier": current_user.tier,
        "lifetime_value": current_user.lifetime_value or 0,
        "plan": current_user.organization.plan
    }
    
    # Configuração do agente
    agent_config = {
        "id": conversation.agent_id,
        "prompt": conversation.agent.prompt,
        "temperature": conversation.agent.temperature,
        "max_tokens": conversation.agent.max_tokens,
        "enable_streaming": conversation.agent.enable_streaming,
        "vip_threshold": 10000,
        "history_limit": 10
    }
    
    # Buscar conhecimento relevante se configurado
    knowledge_context = None
    if conversation.agent.knowledge_base_id:
        search_results = await knowledge_service.search_knowledge(
            query=message.content,
            knowledge_base_id=conversation.agent.knowledge_base_id,
            organization_id=current_user.organization_id,
            limit=5
        )
        knowledge_context = [result["content"] for result in search_results]
    
    # Determinar modelo via router
    selected_tier, routing_metadata = await ai_router.route_request(
        message=message.content,
        conversation_history=conversation_history,
        user_context=user_context,
        agent_config=agent_config
    )
    
    # Processar com IA
    try:
        response = await ai_service.process_message(
            message=message.content,
            conversation_history=conversation_history,
            agent_config=agent_config,
            user_context=user_context,
            knowledge_context=knowledge_context
        )
        
        # Salvar resposta da IA
        ai_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=response.get("content", ""),
            metadata={
                **response.get("metadata", {}),
                "routing": routing_metadata,
                "model": response.get("model"),
                "usage": response.get("usage", {})
            }
        )
        db.add(ai_message)
        db.commit()
        
        # Agendar análise em background
        background_tasks.add_task(
            analyze_conversation_metrics,
            conversation_id=conversation_id,
            organization_id=current_user.organization_id
        )
        
        return MessageResponse(
            id=ai_message.id,
            conversation_id=conversation_id,
            role="assistant",
            content=ai_message.content,
            metadata=ai_message.metadata,
            created_at=ai_message.created_at
        )
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        
        # Fallback message
        fallback_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content="Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
            metadata={
                "error": str(e),
                "fallback": True
            }
        )
        db.add(fallback_message)
        db.commit()
        
        raise HTTPException(500, "Error processing message")


@router.post("/{conversation_id}/messages/stream")
async def send_message_stream(
    conversation_id: str,
    message: MessageCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Envia mensagem com resposta em streaming"""
    
    # Verificações similares ao endpoint anterior
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == current_user.organization_id
    ).first()
    
    if not conversation:
        raise HTTPException(404, "Conversation not found")
    
    # Configurar para streaming
    agent_config = {
        "id": conversation.agent_id,
        "prompt": conversation.agent.prompt,
        "temperature": conversation.agent.temperature,
        "max_tokens": conversation.agent.max_tokens,
        "enable_streaming": True
    }
    
    # Preparar contextos
    ai_service = AIService()
    
    # Generator para streaming
    async def generate():
        try:
            # Enviar evento inicial
            yield f"data: {json.dumps({'type': 'start', 'conversation_id': conversation_id})}\n\n"
            
            # Processar com streaming
            response = await ai_service.process_message(
                message=message.content,
                conversation_history=[],  # Simplificado
                agent_config=agent_config,
                user_context={
                    "organization_id": current_user.organization_id,
                    "user_id": current_user.id
                }
            )
            
            if response["type"] == "stream":
                async for chunk in response["stream"]:
                    yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
            
            # Evento final
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable Nginx buffering
        }
    )


@router.get("/analytics/models")
async def get_model_usage(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Obtém estatísticas de uso dos modelos de IA"""
    
    ai_service = AIService()
    
    usage_stats = await ai_service.get_usage_stats(
        organization_id=current_user.organization_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return usage_stats


@router.get("/models")
async def list_available_models(
    current_user = Depends(get_current_user)
):
    """Lista modelos de IA disponíveis para a organização"""
    
    ai_service = AIService()
    
    models = await ai_service.get_available_models(
        organization_id=current_user.organization_id
    )
    
    # Filtrar baseado no plano
    plan = current_user.organization.plan
    tier_limits = {
        "free": 1,
        "starter": 2,
        "professional": 3,
        "enterprise": 4
    }
    
    max_tier = tier_limits.get(plan, 2)
    
    filtered_models = [
        model for model in models
        if model.get("tier", 1) <= max_tier
    ]
    
    return {
        "models": filtered_models,
        "plan": plan,
        "max_tier": max_tier
    }


# Função auxiliar para análise em background
async def analyze_conversation_metrics(
    conversation_id: str,
    organization_id: str
):
    """Analisa métricas da conversa em background"""
    
    try:
        ai_service = AIService()
        
        analysis = await ai_service.analyze_conversation(
            conversation_id=conversation_id,
            organization_id=organization_id
        )
        
        # Salvar análise no banco ou cache
        logger.info(f"Conversation {conversation_id} analyzed: {analysis}")
        
    except Exception as e:
        logger.error(f"Error analyzing conversation: {e}")
