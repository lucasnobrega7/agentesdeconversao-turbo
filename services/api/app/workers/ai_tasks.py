"""
Tasks Celery para processamento de IA com LiteLLM
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import json
import asyncio

from celery import shared_task
from sqlalchemy.orm import Session

from app.services.ai_service import AIService
from app.services.ai_router import AIRouter
from app.services.cache_service import cache_service
from app.services.knowledge_service import KnowledgeService
from app.database import get_db
from app.models.conversation import Conversation, Message
from app.models.agent import Agent

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_conversation_batch(
    self,
    conversation_ids: List[str],
    organization_id: str
) -> Dict[str, Any]:
    """Processa batch de conversas para análise"""
    
    try:
        ai_service = AIService()
        results = {
            "processed": 0,
            "failed": 0,
            "analyses": []
        }
        
        # Usar asyncio.run para chamar funções async
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        for conv_id in conversation_ids:
            try:
                analysis = loop.run_until_complete(
                    ai_service.analyze_conversation(
                        conversation_id=conv_id,
                        organization_id=organization_id
                    )
                )
                
                results["analyses"].append(analysis)
                results["processed"] += 1
                
            except Exception as e:
                logger.error(f"Error analyzing conversation {conv_id}: {e}")
                results["failed"] += 1
        
        loop.close()
        return results
        
    except Exception as e:
        logger.error(f"Task failed: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def generate_conversation_summary(
    self,
    conversation_id: str,
    organization_id: str
) -> Dict[str, Any]:
    """Gera resumo de conversa usando LiteLLM"""
    
    try:
        # Buscar mensagens da conversa
        db = next(get_db())
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()
        
        if not messages:
            return {"error": "No messages found"}
        
        # Preparar contexto
        conversation_text = "\n".join([
            f"{msg.role}: {msg.content}"
            for msg in messages
        ])
        
        # Chamar LiteLLM para resumo
        ai_service = AIService()
        
        summary_prompt = f"""
        Analise a conversa abaixo e forneça:
        1. Resumo executivo (2-3 linhas)
        2. Principais tópicos discutidos
        3. Sentimento geral do cliente
        4. Ações ou follow-ups necessários
        5. Nível de satisfação estimado (1-10)
        
        Conversa:
        {conversation_text[:3000]}  # Limitar tamanho
        """
        
        # Executar async em sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        response = loop.run_until_complete(
            ai_service.chat_completion(
                messages=[
                    {"role": "system", "content": "Você é um analista especializado em conversas de atendimento."},
                    {"role": "user", "content": summary_prompt}
                ],
                metadata={
                    "organization_id": organization_id,
                    "task": "conversation_summary",
                    "conversation_id": conversation_id
                },
                temperature=0.3,
                max_tokens=500
            )
        )
        
        loop.close()
        
        # Extrair resposta
        summary = response["choices"][0]["message"]["content"]
        
        # Salvar no banco
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if conversation:
            conversation.summary = summary
            conversation.analyzed_at = datetime.utcnow()
            db.commit()
        
        return {
            "conversation_id": conversation_id,
            "summary": summary,
            "message_count": len(messages),
            "analyzed_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Task failed: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=5)
def process_streaming_response(
    self,
    message_id: str,
    conversation_id: str,
    organization_id: str
) -> Dict[str, Any]:
    """Processa resposta de streaming em background"""
    
    try:
        # Esta task seria usada para processar respostas longas
        # ou que precisam de pós-processamento
        
        db = next(get_db())
        message = db.query(Message).filter(
            Message.id == message_id
        ).first()
        
        if not message:
            return {"error": "Message not found"}
        
        # Exemplo: verificar se precisa moderação
        if len(message.content) > 1000:
            # Chamar LiteLLM para moderação
            ai_service = AIService()
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            moderation_response = loop.run_until_complete(
                ai_service.chat_completion(
                    messages=[
                        {
                            "role": "system", 
                            "content": "Você é um moderador. Verifique se o conteúdo é apropriado."
                        },
                        {"role": "user", "content": f"Modere este conteúdo: {message.content[:500]}"}
                    ],
                    metadata={
                        "organization_id": organization_id,
                        "task": "moderation"
                    },
                    temperature=0,
                    max_tokens=100
                )
            )
            
            loop.close()
            
            # Atualizar metadata da mensagem
            message.metadata["moderation"] = {
                "checked": True,
                "result": moderation_response["choices"][0]["message"]["content"],
                "checked_at": datetime.utcnow().isoformat()
            }
            db.commit()
        
        return {
            "message_id": message_id,
            "processed": True
        }
        
    except Exception as e:
        logger.error(f"Task failed: {e}")
        raise self.retry(exc=e, countdown=30)


@shared_task(bind=True)
def warm_up_models(
    self,
    organization_id: str,
    models: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Aquece modelos para reduzir latência inicial"""
    
    try:
        ai_service = AIService()
        
        # Modelos padrão para aquecer
        if not models:
            models = [
                "tier1/llama-3.2-3b",
                "tier2/claude-haiku",
                "tier3/claude-sonnet"
            ]
        
        results = {}
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        for model in models:
            try:
                # Fazer chamada simples
                start_time = datetime.utcnow()
                
                response = loop.run_until_complete(
                    ai_service.chat_completion(
                        messages=[
                            {"role": "user", "content": "Hi"}
                        ],
                        metadata={
                            "organization_id": organization_id,
                            "task": "warm_up"
                        },
                        model=model,
                        max_tokens=10
                    )
                )
                
                end_time = datetime.utcnow()
                latency = (end_time - start_time).total_seconds()
                
                results[model] = {
                    "status": "success",
                    "latency": latency,
                    "warmed_at": end_time.isoformat()
                }
                
            except Exception as e:
                results[model] = {
                    "status": "error",
                    "error": str(e)
                }
        
        loop.close()
        return results
        
    except Exception as e:
        logger.error(f"Warm up task failed: {e}")
        return {"error": str(e)}


@shared_task(bind=True, max_retries=3)
def optimize_prompt_with_ai(
    self,
    agent_id: str,
    current_prompt: str,
    performance_metrics: Dict[str, Any]
) -> Dict[str, Any]:
    """Usa IA para otimizar prompts de agentes baseado em performance"""
    
    try:
        ai_service = AIService()
        
        optimization_prompt = f"""
        Você é um especialista em otimização de prompts para chatbots.
        
        Prompt atual:
        {current_prompt}
        
        Métricas de performance:
        - Taxa de resolução: {performance_metrics.get('resolution_rate', 0)}%
        - Satisfação média: {performance_metrics.get('avg_satisfaction', 0)}/10
        - Tempo médio de conversa: {performance_metrics.get('avg_conversation_time', 0)} min
        - Taxa de escalação: {performance_metrics.get('escalation_rate', 0)}%
        
        Sugira melhorias no prompt para:
        1. Aumentar a taxa de resolução
        2. Melhorar a satisfação do cliente
        3. Reduzir tempo de conversa
        4. Diminuir necessidade de escalação
        
        Forneça o prompt otimizado e explique as mudanças.
        """
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        response = loop.run_until_complete(
            ai_service.chat_completion(
                messages=[
                    {
                        "role": "system", 
                        "content": "Você é um expert em design de prompts para IA conversacional."
                    },
                    {"role": "user", "content": optimization_prompt}
                ],
                metadata={
                    "agent_id": agent_id,
                    "task": "prompt_optimization"
                },
                temperature=0.7,
                max_tokens=1000
            )
        )
        
        loop.close()
        
        optimization_result = response["choices"][0]["message"]["content"]
        
        # Salvar sugestão no banco
        db = next(get_db())
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        
        if agent:
            agent.prompt_suggestions = agent.prompt_suggestions or []
            agent.prompt_suggestions.append({
                "suggested_at": datetime.utcnow().isoformat(),
                "current_metrics": performance_metrics,
                "suggestion": optimization_result,
                "status": "pending_review"
            })
            db.commit()
        
        return {
            "agent_id": agent_id,
            "optimization_suggested": True,
            "suggestion": optimization_result,
            "metrics_before": performance_metrics
        }
        
    except Exception as e:
        logger.error(f"Prompt optimization failed: {e}")
        raise self.retry(exc=e, countdown=300)
