"""
=============================================================================
EMAIL.PY - SERVICE DE EMAIL QUE FUNCIONA DE VERDADE
Enquanto outros usam SMTP do Gmail, nós usamos Resend/SendGrid como gente grande
=============================================================================
"""

import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from jinja2 import Environment, FileSystemLoader, select_autoescape
from pydantic import EmailStr, BaseModel

from app.core.config import settings


# =============================================================================
# LOGGING - PORQUE EMAIL PERDIDO É CLIENTE PERDIDO
# =============================================================================

logger = logging.getLogger(__name__)


# =============================================================================
# EMAIL MODELS - ESTRUTURA QUE FAZ SENTIDO
# =============================================================================

class EmailTemplate(BaseModel):
    """Template de email com dados tipados"""
    subject: str
    template_name: str
    context: Dict[str, Any]


class EmailMessage(BaseModel):
    """Mensagem de email estruturada"""
    to_email: EmailStr
    subject: str
    html_content: str
    text_content: Optional[str] = None
    from_email: Optional[EmailStr] = None
    from_name: Optional[str] = None
    reply_to: Optional[EmailStr] = None
    cc: Optional[List[EmailStr]] = None
    bcc: Optional[List[EmailStr]] = None
    attachments: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


# =============================================================================
# EMAIL SERVICE - ONDE A MÁGICA ACONTECE
# =============================================================================

class EmailService:
    """
    Service de email enterprise.
    
    Suporta múltiplos providers, templates, tracking.
    Se você usa print() para debugar email, volta pro YouTube.
    """
    
    def __init__(self):
        """
        Inicializa service com provider configurado.
        
        Resend > SendGrid > SMTP. Nessa ordem.
        """
        self.provider = settings.EMAIL_PROVIDER  # resend, sendgrid, smtp
        self.from_email = settings.DEFAULT_FROM_EMAIL
        self.from_name = settings.DEFAULT_FROM_NAME
        
        # Template engine - Jinja2 porque é o melhor
        self.template_env = Environment(
            loader=FileSystemLoader("app/templates/emails"),
            autoescape=select_autoescape(["html", "xml"]),
            enable_async=True  # Async templates
        )
        
        # Configurações por provider
        if self.provider == "resend":
            import resend
            resend.api_key = settings.RESEND_API_KEY
            self.client = resend
        elif self.provider == "sendgrid":
            from sendgrid import SendGridAPIClient
            self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        else:
            # SMTP fallback
            self.smtp_host = settings.SMTP_HOST
            self.smtp_port = settings.SMTP_PORT
            self.smtp_username = settings.SMTP_USERNAME
            self.smtp_password = settings.SMTP_PASSWORD
            self.smtp_use_tls = settings.SMTP_USE_TLS
    
    # =============================================================================
    # TEMPLATE RENDERING - EMAILS BONITOS QUE CONVERTEM
    # =============================================================================
    
    async def render_template(
        self,
        template_name: str,
        context: Dict[str, Any]
    ) -> tuple[str, str]:
        """
        Renderiza template HTML e texto.
        
        Retorna (html, text) porque email sem texto é spam.
        """
        # Contexto padrão
        default_context = {
            "app_name": settings.APP_NAME,
            "app_url": f"https://{settings.FRONTEND_URL}",
            "current_year": datetime.utcnow().year,
            "support_email": settings.SUPPORT_EMAIL,
            "company_name": "Agentes de Conversão",
            "company_address": "São Paulo, Brasil"
        }
        
        # Merge contexts
        full_context = {**default_context, **context}
        
        # Renderiza HTML
        html_template = self.template_env.get_template(f"{template_name}.html")
        html_content = await html_template.render_async(**full_context)
        
        # Renderiza texto (se existir)
        try:
            text_template = self.template_env.get_template(f"{template_name}.txt")
            text_content = await text_template.render_async(**full_context)
        except:
            # Fallback para versão sem formatação
            text_content = self._html_to_text(html_content)
        
        return html_content, text_content
    
    def _html_to_text(self, html: str) -> str:
        """
        Converte HTML para texto plano.
        
        Bem básico, mas funciona.
        """
        import re
        from html import unescape
        
        # Remove tags HTML
        text = re.sub(r'<[^>]+>', '', html)
        # Unescape HTML entities
        text = unescape(text)
        # Remove espaços extras
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    # =============================================================================
    # SEND METHODS - PROVIDERS DIFERENTES, INTERFACE ÚNICA
    # =============================================================================
    
    async def send_email(self, message: EmailMessage) -> bool:
        """
        Envia email usando provider configurado.
        
        Tenta 3 vezes com backoff exponencial.
        Se falhar, loga e retorna False.
        """
        # Adiciona defaults
        if not message.from_email:
            message.from_email = self.from_email
        if not message.from_name:
            message.from_name = self.from_name
        
        # Tenta enviar com retry
        for attempt in range(3):
            try:
                if self.provider == "resend":
                    return await self._send_resend(message)
                elif self.provider == "sendgrid":
                    return await self._send_sendgrid(message)
                else:
                    return await self._send_smtp(message)
            except Exception as e:
                logger.error(
                    f"Email send attempt {attempt + 1} failed: {str(e)}"
                )
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)  # Backoff exponencial
                else:
                    logger.error(
                        f"Failed to send email to {message.to_email} after 3 attempts"
                    )
                    return False
        
        return False
    
    async def _send_resend(self, message: EmailMessage) -> bool:
        """
        Envia via Resend (melhor provider).
        
        Tracking automático, webhooks, tudo que precisa.
        """
        try:
            params = {
                "from": f"{message.from_name} <{message.from_email}>",
                "to": [message.to_email],
                "subject": message.subject,
                "html": message.html_content
            }
            
            if message.text_content:
                params["text"] = message.text_content
            if message.reply_to:
                params["reply_to"] = message.reply_to
            if message.cc:
                params["cc"] = message.cc
            if message.bcc:
                params["bcc"] = message.bcc
            if message.tags:
                params["tags"] = message.tags
            
            response = self.client.Emails.send(params)
            
            logger.info(
                f"Email sent via Resend to {message.to_email} - ID: {response['id']}"
            )
            return True
            
        except Exception as e:
            logger.error(f"Resend error: {str(e)}")
            raise
    
    async def _send_sendgrid(self, message: EmailMessage) -> bool:
        """
        Envia via SendGrid (alternativa robusta).
        
        Mais features, mais complexo.
        """
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        try:
            mail = Mail(
                from_email=Email(message.from_email, message.from_name),
                to_emails=To(message.to_email),
                subject=message.subject,
                html_content=Content("text/html", message.html_content)
            )
            
            if message.text_content:
                mail.add_content(Content("text/plain", message.text_content))
            
            response = self.client.send(mail)
            
            logger.info(
                f"Email sent via SendGrid to {message.to_email} - "
                f"Status: {response.status_code}"
            )
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            logger.error(f"SendGrid error: {str(e)}")
            raise
    
    async def _send_smtp(self, message: EmailMessage) -> bool:
        """
        Envia via SMTP (último recurso).
        
        Funciona, mas sem tracking nem nada fancy.
        """
        try:
            # Cria mensagem MIME
            msg = MIMEMultipart("alternative")
            msg["Subject"] = message.subject
            msg["From"] = f"{message.from_name} <{message.from_email}>"
            msg["To"] = message.to_email
            
            if message.reply_to:
                msg["Reply-To"] = message.reply_to
            
            # Adiciona conteúdo
            if message.text_content:
                msg.attach(MIMEText(message.text_content, "plain"))
            msg.attach(MIMEText(message.html_content, "html"))
            
            # Envia via SMTP assíncrono
            async with aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                use_tls=self.smtp_use_tls
            ) as smtp:
                if self.smtp_username and self.smtp_password:
                    await smtp.login(self.smtp_username, self.smtp_password)
                
                await smtp.send_message(msg)
            
            logger.info(f"Email sent via SMTP to {message.to_email}")
            return True
            
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            raise
    
    # =============================================================================
    # EMAIL TEMPLATES ESPECÍFICOS - OS MAIS USADOS
    # =============================================================================
    
    async def send_verification_email(
        self,
        to_email: EmailStr,
        user_name: str,
        verification_token: str
    ) -> bool:
        """
        Email de verificação de conta.
        
        Template bonito, CTA claro, mobile-friendly.
        """
        verification_url = (
            f"https://{settings.FRONTEND_URL}/verify-email/{verification_token}"
        )
        
        context = {
            "user_name": user_name,
            "verification_url": verification_url,
            "expires_in": "24 horas"
        }
        
        html_content, text_content = await self.render_template(
            "verification_email",
            context
        )
        
        message = EmailMessage(
            to_email=to_email,
            subject=f"Verifique sua conta - {settings.APP_NAME}",
            html_content=html_content,
            text_content=text_content,
            tags=["verification", "transactional"]
        )
        
        return await self.send_email(message)
    
    async def send_welcome_email(
        self,
        to_email: EmailStr,
        user_name: str
    ) -> bool:
        """
        Email de boas-vindas após verificação.
        
        Onboarding, próximos passos, CTA para dashboard.
        """
        dashboard_url = f"https://{settings.FRONTEND_URL}/dashboard"
        
        context = {
            "user_name": user_name,
            "dashboard_url": dashboard_url,
            "features": [
                "Crie agentes de conversão em minutos",
                "Integre com WhatsApp, Telegram e mais",
                "Analytics em tempo real",
                "Suporte prioritário"
            ]
        }
        
        html_content, text_content = await self.render_template(
            "welcome_email",
            context
        )
        
        message = EmailMessage(
            to_email=to_email,
            subject=f"Bem-vindo ao {settings.APP_NAME}! 🚀",
            html_content=html_content,
            text_content=text_content,
            tags=["welcome", "onboarding"]
        )
        
        return await self.send_email(message)
    
    async def send_password_reset_email(
        self,
        to_email: EmailStr,
        user_name: str,
        reset_token: str
    ) -> bool:
        """
        Email de reset de senha.
        
        Segurança em primeiro lugar, expira em 1 hora.
        """
        reset_url = (
            f"https://{settings.FRONTEND_URL}/reset-password/{reset_token}"
        )
        
        context = {
            "user_name": user_name,
            "reset_url": reset_url,
            "expires_in": "1 hora",
            "ip_address": "Detectado do request",
            "browser": "Detectado do user-agent"
        }
        
        html_content, text_content = await self.render_template(
            "password_reset",
            context
        )
        
        message = EmailMessage(
            to_email=to_email,
            subject="Redefinir senha - Ação necessária",
            html_content=html_content,
            text_content=text_content,
            tags=["password-reset", "security"]
        )
        
        return await self.send_email(message)
    
    async def send_password_changed_email(
        self,
        to_email: EmailStr,
        user_name: str
    ) -> bool:
        """
        Notificação de senha alterada.
        
        Segurança: avisa se não foi o usuário.
        """
        context = {
            "user_name": user_name,
            "changed_at": datetime.utcnow().strftime("%d/%m/%Y às %H:%M UTC"),
            "support_url": f"https://{settings.FRONTEND_URL}/support"
        }
        
        html_content, text_content = await self.render_template(
            "password_changed",
            context
        )
        
        message = EmailMessage(
            to_email=to_email,
            subject="Sua senha foi alterada",
            html_content=html_content,
            text_content=text_content,
            tags=["password-changed", "security"]
        )
        
        return await self.send_email(message)
    
    async def send_agent_created_email(
        self,
        to_email: EmailStr,
        user_name: str,
        agent_name: str,
        agent_id: str
    ) -> bool:
        """
        Notificação de agente criado.
        
        Próximos passos, dicas, CTA para configurar.
        """
        agent_url = f"https://{settings.FRONTEND_URL}/agents/{agent_id}"
        
        context = {
            "user_name": user_name,
            "agent_name": agent_name,
            "agent_url": agent_url,
            "next_steps": [
                "Configure as integrações (WhatsApp, Telegram)",
                "Personalize as respostas do agente",
                "Adicione conhecimento específico",
                "Teste e publique"
            ]
        }
        
        html_content, text_content = await self.render_template(
            "agent_created",
            context
        )
        
        message = EmailMessage(
            to_email=to_email,
            subject=f"Agente '{agent_name}' criado com sucesso! 🎉",
            html_content=html_content,
            text_content=text_content,
            tags=["agent-created", "engagement"]
        )
        
        return await self.send_email(message)
    
    async def send_conversation_summary_email(
        self,
        to_email: EmailStr,
        user_name: str,
        summary_data: Dict[str, Any]
    ) -> bool:
        """
        Resumo diário/semanal de conversas.
        
        Métricas, insights, oportunidades.
        """
        context = {
            "user_name": user_name,
            "period": summary_data.get("period", "hoje"),
            "total_conversations": summary_data.get("total_conversations", 0),
            "total_messages": summary_data.get("total_messages", 0),
            "conversion_rate": summary_data.get("conversion_rate", 0),
            "top_agents": summary_data.get("top_agents", []),
            "insights": summary_data.get("insights", []),
            "dashboard_url": f"https://{settings.FRONTEND_URL}/analytics"
        }
        
        html_content, text_content = await self.render_template(
            "conversation_summary",
            context
        )
        
        message = EmailMessage(
            to_email=to_email,
            subject=f"Resumo de conversas - {context['period']}",
            html_content=html_content,
            text_content=text_content,
            tags=["summary", "analytics"]
        )
        
        return await self.send_email(message)
    
    # =============================================================================
    # BULK EMAIL - PARA CAMPANHAS E NOTIFICAÇÕES EM MASSA
    # =============================================================================
    
    async def send_bulk_email(
        self,
        recipients: List[Dict[str, Any]],
        template_name: str,
        base_context: Dict[str, Any],
        batch_size: int = 50
    ) -> Dict[str, Any]:
        """
        Envia emails em massa com personalização.
        
        Batches para não sobrecarregar.
        Tracking de sucesso/falha.
        """
        results = {
            "total": len(recipients),
            "sent": 0,
            "failed": 0,
            "errors": []
        }
        
        # Processa em batches
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i:i + batch_size]
            
            # Envia batch em paralelo
            tasks = []
            for recipient in batch:
                # Personaliza contexto
                context = {
                    **base_context,
                    **recipient.get("context", {})
                }
                
                # Renderiza template
                html_content, text_content = await self.render_template(
                    template_name,
                    context
                )
                
                # Cria mensagem
                message = EmailMessage(
                    to_email=recipient["email"],
                    subject=recipient.get("subject", base_context.get("subject", "Notificação")),
                    html_content=html_content,
                    text_content=text_content,
                    tags=["bulk", template_name]
                )
                
                # Adiciona task
                tasks.append(self.send_email(message))
            
            # Executa batch
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Conta resultados
            for idx, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    results["failed"] += 1
                    results["errors"].append({
                        "email": batch[idx]["email"],
                        "error": str(result)
                    })
                elif result:
                    results["sent"] += 1
                else:
                    results["failed"] += 1
            
            # Delay entre batches
            if i + batch_size < len(recipients):
                await asyncio.sleep(1)
        
        logger.info(
            f"Bulk email completed: {results['sent']} sent, "
            f"{results['failed']} failed"
        )
        
        return results


# =============================================================================
# SINGLETON - UMA INSTÂNCIA PARA TODAS AS NECESSIDADES
# =============================================================================

email_service = EmailService()


# =============================================================================
# EXPORTS - USE COM RESPONSABILIDADE
# =============================================================================

__all__ = [
    "EmailService",
    "email_service",
    "EmailMessage",
    "EmailTemplate"
]