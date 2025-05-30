"""
=============================================================================
INTEGRATIONS ROUTER - CONECTA COM TUDO QUE EXISTE
CRM, WhatsApp, Slack, Discord, Email - automação total
=============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.integration import (
    IntegrationCreate, IntegrationResponse, IntegrationUpdate,
    WebhookPayload, SyncRequest
)
from app.services.integration_service import IntegrationService

router = APIRouter(prefix="/api/v1/integrations", tags=["Integrations"])

@router.get("/available")
async def list_available_integrations():
    """Lista integrações disponíveis - arsenal completo"""
    return {
        "crm": [
            {"name": "HubSpot", "type": "crm", "supports": ["contacts", "deals", "companies"]},
            {"name": "Salesforce", "type": "crm", "supports": ["leads", "opportunities", "accounts"]},
            {"name": "Pipedrive", "type": "crm", "supports": ["deals", "contacts", "organizations"]},
            {"name": "RD Station", "type": "crm", "supports": ["leads", "conversions", "funnel"]}
        ],
        "messaging": [
            {"name": "WhatsApp Business", "type": "messaging", "supports": ["messages", "media", "status"]},
            {"name": "Telegram", "type": "messaging", "supports": ["messages", "bots", "channels"]},
            {"name": "Discord", "type": "messaging", "supports": ["messages", "webhooks", "bots"]},
            {"name": "Slack", "type": "messaging", "supports": ["messages", "apps", "workflows"]}
        ],
        "email": [
            {"name": "Mailchimp", "type": "email", "supports": ["campaigns", "automation", "segments"]},
            {"name": "SendGrid", "type": "email", "supports": ["transactional", "marketing", "analytics"]},
            {"name": "Gmail", "type": "email", "supports": ["send", "read", "labels"]}
        ],
        "analytics": [
            {"name": "Google Analytics", "type": "analytics", "supports": ["events", "conversions", "reports"]},
            {"name": "Facebook Pixel", "type": "analytics", "supports": ["events", "conversions", "audiences"]},
            {"name": "Mixpanel", "type": "analytics", "supports": ["events", "funnels", "cohorts"]}
        ],
        "ecommerce": [
            {"name": "Shopify", "type": "ecommerce", "supports": ["orders", "customers", "products"]},
            {"name": "WooCommerce", "type": "ecommerce", "supports": ["orders", "customers", "webhooks"]},
            {"name": "Stripe", "type": "payment", "supports": ["payments", "subscriptions", "customers"]}
        ]
    }

@router.post("/", response_model=IntegrationResponse)
async def create_integration(
    integration_data: IntegrationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria nova integração - conecta seu negócio"""
    service = IntegrationService(db)
    integration = await service.create_integration(integration_data, current_user.id)
    
    # Testa a conexão em background
    background_tasks.add_task(service.test_integration_connection, integration.id)
    
    return integration

@router.get("/", response_model=List[IntegrationResponse])
async def list_integrations(
    integration_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista integrações ativas - seu ecossistema conectado"""
    service = IntegrationService(db)
    integrations = await service.get_user_integrations(
        current_user.id, integration_type, status
    )
    return integrations

@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Busca integração específica com detalhes"""
    service = IntegrationService(db)
    integration = await service.get_integration(integration_id, current_user.id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração não encontrada"
        )
    return integration

@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: UUID,
    integration_data: IntegrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualiza configurações da integração"""
    service = IntegrationService(db)
    integration = await service.update_integration(
        integration_id, integration_data, current_user.id
    )
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração não encontrada"
        )
    return integration

@router.post("/{integration_id}/test")
async def test_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Testa conexão da integração - diagnóstico completo"""
    service = IntegrationService(db)
    result = await service.test_integration_connection(integration_id, current_user.id)
    return result

@router.post("/{integration_id}/sync")
async def sync_integration(
    integration_id: UUID,
    sync_data: SyncRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sincroniza dados - import/export automático"""
    service = IntegrationService(db)
    
    # Inicia sync em background para não travar
    sync_task = await service.start_sync(
        integration_id, sync_data, current_user.id
    )
    
    background_tasks.add_task(
        service.execute_sync, sync_task.id
    )
    
    return {
        "sync_id": sync_task.id,
        "status": "started",
        "estimated_duration": sync_task.estimated_duration,
        "webhook_url": f"/integrations/{integration_id}/sync/{sync_task.id}/status"
    }

@router.post("/{integration_id}/webhook")
async def handle_webhook(
    integration_id: UUID,
    payload: WebhookPayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Recebe webhooks - automação em tempo real"""
    service = IntegrationService(db)
    
    # Processa webhook em background
    background_tasks.add_task(
        service.process_webhook, integration_id, payload.dict()
    )
    
    return {"status": "received", "processed": "background"}

@router.get("/{integration_id}/logs")
async def get_integration_logs(
    integration_id: UUID,
    limit: int = 100,
    level: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Logs da integração - debugging enterprise"""
    service = IntegrationService(db)
    logs = await service.get_integration_logs(
        integration_id, current_user.id, limit, level
    )
    return logs

@router.post("/{integration_id}/actions/{action_name}")
async def execute_integration_action(
    integration_id: UUID,
    action_name: str,
    action_params: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Executa ação específica da integração"""
    service = IntegrationService(db)
    result = await service.execute_action(
        integration_id, action_name, action_params, current_user.id
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ação '{action_name}' não disponível ou falhou"
        )
    return result

@router.get("/{integration_id}/analytics")
async def get_integration_analytics(
    integration_id: UUID,
    period: str = "30d",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analytics da integração - performance e uso"""
    service = IntegrationService(db)
    analytics = await service.get_integration_analytics(
        integration_id, current_user.id, period
    )
    return analytics

@router.delete("/{integration_id}")
async def delete_integration(
    integration_id: UUID,
    cleanup_data: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove integração - com limpeza opcional"""
    service = IntegrationService(db)
    success = await service.delete_integration(
        integration_id, current_user.id, cleanup_data
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração não encontrada"
        )
    
    message = "Integração removida"
    if cleanup_data:
        message += " com limpeza de dados"
    
    return {"message": message}

@router.post("/bulk-sync")
async def bulk_sync_integrations(
    integration_ids: List[UUID],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sincroniza múltiplas integrações - operação em lote"""
    service = IntegrationService(db)
    
    tasks = []
    for integration_id in integration_ids:
        task = await service.start_bulk_sync(integration_id, current_user.id)
        tasks.append(task)
        background_tasks.add_task(service.execute_sync, task.id)
    
    return {
        "total_syncs": len(tasks),
        "sync_ids": [task.id for task in tasks],
        "status": "all_started"
    }