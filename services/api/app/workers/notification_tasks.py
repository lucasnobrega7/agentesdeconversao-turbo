"""
Tasks Celery para notificações
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import asyncio

from celery import shared_task
import httpx

from app.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.services.email import EmailService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_email_notification(
    self,
    to_email: str,
    subject: str,
    template: str,
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Envia notificação por email"""
    
    try:
        email_service = EmailService()
        
        result = email_service.send_template_email(
            to_email=to_email,
            subject=subject,
            template_name=template,
            context=context
        )
        
        return {
            "success": result,
            "to": to_email,
            "subject": subject,
            "sent_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True)
def send_usage_alert(
    self,
    organization_id: str,
    alert_type: str,
    alert_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Envia alerta de uso para administradores"""
    
    try:
        db = next(get_db())
        
        # Buscar organização e admins
        organization = db.query(Organization).filter(
            Organization.id == organization_id
        ).first()
        
        if not organization:
            return {"error": "Organization not found"}
        
        # Buscar admins
        admins = db.query(User).filter(
            User.organization_id == organization_id,
            User.role.in_(["owner", "admin"])
        ).all()
        
        if not admins:
            logger.warning(f"No admins found for organization {organization_id}")
            return {"error": "No admins to notify"}
        
        # Preparar contexto do email
        context = {
            "organization_name": organization.name,
            "alert_type": alert_type,
            "current_usage": alert_data.get("current_usage"),
            "limit": alert_data.get("limit"),
            "percentage": alert_data.get("percentage"),
            "alert_level": alert_data.get("alert_level", "warning")
        }
        
        # Enviar para cada admin
        sent_to = []
        for admin in admins:
            try:
                send_email_notification.delay(
                    to_email=admin.email,
                    subject=f"[{alert_type.upper()}] Alerta de Uso - {organization.name}",
                    template="usage_alert",
                    context=context
                )
                sent_to.append(admin.email)
            except Exception as e:
                logger.error(f"Error queueing email for {admin.email}: {e}")
        
        return {
            "organization_id": organization_id,
            "alert_type": alert_type,
            "notifications_sent": len(sent_to),
            "sent_to": sent_to
        }
        
    except Exception as e:
        logger.error(f"Error sending usage alert: {e}")
        return {"error": str(e)}


@shared_task(bind=True)
def send_daily_summary(
    self,
    organization_id: str,
    date: Optional[str] = None
) -> Dict[str, Any]:
    """Envia resumo diário para organização"""
    
    try:
        # Buscar métricas do dia
        from app.services.cache_service import cache_service
        
        if not date:
            date = datetime.utcnow().date().isoformat()
        
        cache_key = f"daily_metrics:{organization_id}:{date}"
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        redis = loop.run_until_complete(cache_service.get_redis())
        metrics_json = loop.run_until_complete(redis.get(cache_key))
        
        loop.close()
        
        if not metrics_json:
            return {"error": "No metrics found for date"}
        
        metrics = json.loads(metrics_json)
        
        # Buscar organização e configurações
        db = next(get_db())
        organization = db.query(Organization).filter(
            Organization.id == organization_id
        ).first()
        
        if not organization:
            return {"error": "Organization not found"}
        
        # Verificar se resumo diário está habilitado
        if not organization.settings.get("notifications", {}).get("daily_summary", False):
            return {"info": "Daily summary disabled for organization"}
        
        # Buscar destinatários
        recipients = db.query(User).filter(
            User.organization_id == organization_id,
            User.role.in_(["owner", "admin"]),
            User.preferences.has_key("receive_daily_summary"),
            User.preferences["receive_daily_summary"] == True
        ).all()
        
        if not recipients:
            return {"info": "No recipients configured for daily summary"}
        
        # Preparar contexto
        context = {
            "organization_name": organization.name,
            "date": date,
            "metrics": metrics,
            "highlights": [
                f"{metrics['conversations']['total']} conversas processadas",
                f"{metrics['conversations']['completion_rate']:.1f}% de taxa de conclusão",
                f"Tempo médio de resposta: {metrics['response']['avg_time_seconds']:.1f}s",
                f"Custo de IA: ${metrics['ai_usage']['total_cost']:.2f}"
            ]
        }
        
        # Enviar emails
        sent_count = 0
        for recipient in recipients:
            try:
                send_email_notification.delay(
                    to_email=recipient.email,
                    subject=f"Resumo Diário - {organization.name} ({date})",
                    template="daily_summary",
                    context=context
                )
                sent_count += 1
            except Exception as e:
                logger.error(f"Error queueing summary for {recipient.email}: {e}")
        
        return {
            "organization_id": organization_id,
            "date": date,
            "summaries_sent": sent_count
        }
        
    except Exception as e:
        logger.error(f"Error sending daily summary: {e}")
        return {"error": str(e)}


@shared_task(bind=True)
def send_webhook_notification(
    self,
    webhook_url: str,
    event_type: str,
    payload: Dict[str, Any],
    organization_id: str
) -> Dict[str, Any]:
    """Envia notificação via webhook"""
    
    try:
        # Adicionar metadata ao payload
        full_payload = {
            "event": event_type,
            "organization_id": organization_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        
        # Enviar webhook
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                webhook_url,
                json=full_payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Event-Type": event_type,
                    "X-Organization-ID": organization_id
                }
            )
            
            return {
                "success": response.is_success,
                "status_code": response.status_code,
                "webhook_url": webhook_url,
                "event_type": event_type
            }
            
    except httpx.TimeoutException:
        logger.error(f"Webhook timeout: {webhook_url}")
        raise self.retry(exc=Exception("Webhook timeout"), countdown=60)
        
    except Exception as e:
        logger.error(f"Error sending webhook: {e}")
        raise self.retry(exc=e, countdown=120)


@shared_task(bind=True)
def send_agent_performance_report(
    self,
    agent_id: str,
    organization_id: str,
    period_days: int = 7
) -> Dict[str, Any]:
    """Envia relatório de performance de agente"""
    
    try:
        # Coletar métricas do agente
        db = next(get_db())
        
        # Esta é uma versão simplificada
        # Em produção, coletar métricas detalhadas
        
        # Buscar agente
        from app.models.agent import Agent
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.organization_id == organization_id
        ).first()
        
        if not agent:
            return {"error": "Agent not found"}
        
        # Preparar relatório
        report = {
            "agent_name": agent.name,
            "period": f"{period_days} dias",
            "metrics": {
                "total_conversations": 150,  # Exemplo
                "avg_rating": 4.5,
                "resolution_rate": 85,
                "avg_response_time": 2.3
            },
            "top_intents": [
                {"intent": "product_query", "count": 45},
                {"intent": "support", "count": 38},
                {"intent": "pricing", "count": 27}
            ],
            "recommendations": [
                "Considere adicionar mais exemplos para queries de produto",
                "O tempo de resposta está acima da média para suporte técnico"
            ]
        }
        
        # Buscar destinatários
        recipients = db.query(User).filter(
            User.organization_id == organization_id,
            User.role.in_(["owner", "admin"])
        ).all()
        
        # Enviar relatórios
        sent_count = 0
        for recipient in recipients:
            try:
                send_email_notification.delay(
                    to_email=recipient.email,
                    subject=f"Relatório de Performance - {agent.name}",
                    template="agent_performance",
                    context={
                        "recipient_name": recipient.name,
                        "report": report
                    }
                )
                sent_count += 1
            except Exception as e:
                logger.error(f"Error sending report to {recipient.email}: {e}")
        
        return {
            "agent_id": agent_id,
            "reports_sent": sent_count,
            "period_days": period_days
        }
        
    except Exception as e:
        logger.error(f"Error generating agent report: {e}")
        return {"error": str(e)}
