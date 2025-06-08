"""
Tasks Celery para analytics e métricas
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import json

from celery import shared_task
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.services.ai_service import AIService
from app.services.cache_service import cache_service
from app.database import get_db
from app.models.conversation import Conversation, Message
from app.models.organization import Organization
from app.models.agent import Agent

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def collect_daily_metrics(
    self,
    organization_id: str,
    date: Optional[str] = None
) -> Dict[str, Any]:
    """Coleta métricas diárias para uma organização"""
    
    try:
        db = next(get_db())
        
        # Data alvo
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            target_date = datetime.utcnow().date() - timedelta(days=1)
        
        # Início e fim do dia
        start_time = datetime.combine(target_date, datetime.min.time())
        end_time = datetime.combine(target_date, datetime.max.time())
        
        # Métricas de conversas
        conversations = db.query(Conversation).filter(
            Conversation.organization_id == organization_id,
            Conversation.created_at >= start_time,
            Conversation.created_at <= end_time
        ).all()
        
        total_conversations = len(conversations)
        completed_conversations = len([c for c in conversations if c.status == "resolved"])
        abandoned_conversations = len([c for c in conversations if c.status == "abandoned"])
        
        # Métricas de mensagens
        messages = db.query(Message).join(Conversation).filter(
            Conversation.organization_id == organization_id,
            Message.created_at >= start_time,
            Message.created_at <= end_time
        ).all()
        
        total_messages = len(messages)
        user_messages = len([m for m in messages if m.role == "user"])
        assistant_messages = len([m for m in messages if m.role == "assistant"])
        
        # Tempo médio de resposta
        response_times = []
        for conv in conversations:
            conv_messages = sorted(
                [m for m in messages if m.conversation_id == conv.id],
                key=lambda x: x.created_at
            )
            
            for i in range(1, len(conv_messages)):
                if (conv_messages[i-1].role == "user" and 
                    conv_messages[i].role == "assistant"):
                    time_diff = (conv_messages[i].created_at - 
                               conv_messages[i-1].created_at).total_seconds()
                    response_times.append(time_diff)
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Métricas de IA
        ai_metrics = {
            "total_tokens": 0,
            "total_cost": 0,
            "by_tier": {
                "tier1": {"calls": 0, "tokens": 0, "cost": 0},
                "tier2": {"calls": 0, "tokens": 0, "cost": 0},
                "tier3": {"calls": 0, "tokens": 0, "cost": 0},
                "tier4": {"calls": 0, "tokens": 0, "cost": 0}
            }
        }
        
        # Agregar métricas de IA das mensagens
        for msg in assistant_messages:
            if msg.metadata:
                usage = msg.metadata.get("usage", {})
                model = msg.metadata.get("model", "")
                tier = msg.metadata.get("routing", {}).get("selected_tier", "unknown")
                
                tokens = usage.get("total_tokens", 0)
                # Estimar custo baseado no tier
                cost_per_token = {
                    "tier1": 0.00001,
                    "tier2": 0.00025,
                    "tier3": 0.003,
                    "tier4": 0.015
                }.get(tier, 0.001)
                
                cost = tokens * cost_per_token
                
                ai_metrics["total_tokens"] += tokens
                ai_metrics["total_cost"] += cost
                
                if tier in ai_metrics["by_tier"]:
                    ai_metrics["by_tier"][tier]["calls"] += 1
                    ai_metrics["by_tier"][tier]["tokens"] += tokens
                    ai_metrics["by_tier"][tier]["cost"] += cost
        
        # Compilar métricas
        metrics = {
            "date": target_date.isoformat(),
            "organization_id": organization_id,
            "conversations": {
                "total": total_conversations,
                "completed": completed_conversations,
                "abandoned": abandoned_conversations,
                "completion_rate": (completed_conversations / total_conversations * 100) if total_conversations > 0 else 0
            },
            "messages": {
                "total": total_messages,
                "user": user_messages,
                "assistant": assistant_messages,
                "avg_per_conversation": (total_messages / total_conversations) if total_conversations > 0 else 0
            },
            "response": {
                "avg_time_seconds": avg_response_time,
                "total_responses": len(response_times)
            },
            "ai_usage": ai_metrics,
            "collected_at": datetime.utcnow().isoformat()
        }
        
        # Salvar no Redis para análise posterior
        cache_key = f"daily_metrics:{organization_id}:{target_date.isoformat()}"
        await cache_service.get_redis()
        await cache_service._redis.setex(
            cache_key,
            86400 * 90,  # 90 dias
            json.dumps(metrics)
        )
        
        logger.info(f"Daily metrics collected for {organization_id} on {target_date}")
        return metrics
        
    except Exception as e:
        logger.error(f"Error collecting daily metrics: {e}")
        raise self.retry(exc=e, countdown=300)


@shared_task(bind=True)
def collect_daily_metrics_all_orgs(self) -> Dict[str, Any]:
    """Coleta métricas diárias para todas as organizações"""
    
    try:
        db = next(get_db())
        
        # Buscar todas as organizações ativas
        organizations = db.query(Organization).filter(
            Organization.is_active == True
        ).all()
        
        results = {
            "processed": 0,
            "failed": 0,
            "organizations": []
        }
        
        for org in organizations:
            try:
                # Disparar task individual
                collect_daily_metrics.delay(org.id)
                results["processed"] += 1
                results["organizations"].append(org.id)
                
            except Exception as e:
                logger.error(f"Error dispatching metrics for {org.id}: {e}")
                results["failed"] += 1
        
        return results
        
    except Exception as e:
        logger.error(f"Error collecting metrics for all orgs: {e}")
        return {"error": str(e)}


@shared_task(bind=True)
def analyze_organization_performance(
    self,
    organization_id: str,
    period_days: int = 30
) -> Dict[str, Any]:
    """Análise detalhada de performance usando Jarvis AI"""
    
    try:
        # Coletar métricas do período
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=period_days)
        
        metrics = []
        current_date = start_date
        
        # Buscar métricas diárias do cache
        while current_date <= end_date:
            cache_key = f"daily_metrics:{organization_id}:{current_date.isoformat()}"
            
            cached_metrics = await cache_service.get_redis()
            daily_metrics = await cache_service._redis.get(cache_key)
            
            if daily_metrics:
                metrics.append(json.loads(daily_metrics))
            
            current_date += timedelta(days=1)
        
        if not metrics:
            return {
                "error": "No metrics found for period",
                "organization_id": organization_id,
                "period_days": period_days
            }
        
        # Preparar dados para análise
        analysis_data = {
            "period": f"{period_days} days",
            "total_conversations": sum(m["conversations"]["total"] for m in metrics),
            "avg_completion_rate": sum(m["conversations"]["completion_rate"] for m in metrics) / len(metrics),
            "total_messages": sum(m["messages"]["total"] for m in metrics),
            "avg_response_time": sum(m["response"]["avg_time_seconds"] for m in metrics) / len(metrics),
            "total_ai_cost": sum(m["ai_usage"]["total_cost"] for m in metrics),
            "daily_metrics": metrics
        }
        
        # Chamar Jarvis AI para análise
        ai_service = AIService()
        
        analysis_prompt = f"""
        Analise os dados de performance abaixo e forneça:
        
        1. **Resumo Executivo** - Principais insights em 3-4 bullet points
        2. **Tendências Identificadas** - Padrões positivos e negativos
        3. **Problemas Críticos** - Questões que precisam atenção imediata
        4. **Oportunidades de Melhoria** - Sugestões específicas e acionáveis
        5. **Previsões** - Projeções para os próximos 30 dias se as tendências continuarem
        6. **Recomendações de Ação** - Top 5 ações prioritárias com impacto esperado
        
        Dados do período ({analysis_data['period']}):
        - Total de conversas: {analysis_data['total_conversations']}
        - Taxa média de conclusão: {analysis_data['avg_completion_rate']:.1f}%
        - Total de mensagens: {analysis_data['total_messages']}
        - Tempo médio de resposta: {analysis_data['avg_response_time']:.1f} segundos
        - Custo total de IA: ${analysis_data['total_ai_cost']:.2f}
        
        Seja específico, use números e percentuais quando relevante.
        """
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        response = loop.run_until_complete(
            ai_service.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": "Você é Jarvis, um analista de IA especializado em otimização de chatbots e experiência do cliente. Forneça análises precisas e acionáveis."
                    },
                    {"role": "user", "content": analysis_prompt}
                ],
                metadata={
                    "organization_id": organization_id,
                    "task": "performance_analysis",
                    "queue": "jarvis_tasks"
                },
                temperature=0.3,
                max_tokens=2000
            )
        )
        
        loop.close()
        
        analysis = response["choices"][0]["message"]["content"]
        
        # Salvar análise
        result = {
            "organization_id": organization_id,
            "period_analyzed": f"{start_date.isoformat()} to {end_date.isoformat()}",
            "metrics_summary": analysis_data,
            "jarvis_analysis": analysis,
            "analyzed_at": datetime.utcnow().isoformat(),
            "recommendations_count": 5
        }
        
        # Salvar no cache por 7 dias
        cache_key = f"performance_analysis:{organization_id}:{end_date.isoformat()}"
        await cache_service._redis.setex(
            cache_key,
            86400 * 7,
            json.dumps(result)
        )
        
        logger.info(f"Performance analysis completed for {organization_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error in performance analysis: {e}")
        raise self.retry(exc=e, countdown=600)


@shared_task(bind=True)
def check_usage_limits(self) -> Dict[str, Any]:
    """Verifica limites de uso das organizações"""
    
    try:
        db = next(get_db())
        
        # Buscar organizações ativas
        organizations = db.query(Organization).filter(
            Organization.is_active == True
        ).all()
        
        alerts = []
        
        for org in organizations:
            # Obter limites do plano
            limits = org.settings.get("limits", {})
            max_messages = limits.get("max_messages_per_month", 10000)
            
            # Calcular uso do mês atual
            start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
            
            message_count = db.query(func.count(Message.id)).join(
                Conversation
            ).filter(
                Conversation.organization_id == org.id,
                Message.created_at >= start_of_month
            ).scalar()
            
            usage_percentage = (message_count / max_messages * 100) if max_messages > 0 else 0
            
            # Criar alertas se necessário
            if usage_percentage >= 90:
                alert = {
                    "organization_id": org.id,
                    "organization_name": org.name,
                    "usage_type": "messages",
                    "current_usage": message_count,
                    "limit": max_messages,
                    "percentage": usage_percentage,
                    "alert_level": "critical" if usage_percentage >= 95 else "warning"
                }
                alerts.append(alert)
                
                # TODO: Enviar notificação via email/slack
                logger.warning(f"Usage limit alert for {org.name}: {usage_percentage:.1f}% of messages used")
        
        return {
            "organizations_checked": len(organizations),
            "alerts_generated": len(alerts),
            "alerts": alerts,
            "checked_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error checking usage limits: {e}")
        return {"error": str(e)}
