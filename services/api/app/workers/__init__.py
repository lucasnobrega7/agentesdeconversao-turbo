"""
Celery Workers para processamento assíncrono
"""

from celery import Celery
from app.core.config import settings

# Criar instância do Celery
celery_app = Celery(
    "agentes_conversao",
    broker=settings.REDIS_URL or "redis://localhost:6379/0",
    backend=settings.REDIS_URL or "redis://localhost:6379/0",
    include=[
        "app.workers.ai_tasks",
        "app.workers.analytics_tasks",
        "app.workers.knowledge_tasks",
        "app.workers.notification_tasks"
    ]
)

# Configurações
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Retry configuration
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Result backend
    result_expires=3600,  # 1 hora
    # Task routing
    task_routes={
        "app.workers.ai_tasks.*": {"queue": "ai_tasks"},
        "app.workers.analytics_tasks.*": {"queue": "analytics_tasks"},
        "app.workers.knowledge_tasks.*": {"queue": "knowledge_tasks"},
        "app.workers.notification_tasks.*": {"queue": "notification_tasks"},
        "app.workers.analytics_tasks.analyze_organization_performance": {"queue": "jarvis_tasks"}
    },
    # Rate limits
    task_annotations={
        "app.workers.ai_tasks.process_conversation_batch": {
            "rate_limit": "100/m"
        },
        "app.workers.knowledge_tasks.process_document": {
            "rate_limit": "50/m"
        }
    },
    # Beat schedule for periodic tasks
    beat_schedule={
        "collect-daily-metrics": {
            "task": "app.workers.analytics_tasks.collect_daily_metrics_all_orgs",
            "schedule": 86400.0,  # 24 horas
            "options": {"queue": "analytics_tasks"}
        },
        "cleanup-old-cache": {
            "task": "app.workers.maintenance_tasks.cleanup_old_cache",
            "schedule": 3600.0,  # 1 hora
            "options": {"queue": "maintenance_tasks"}
        },
        "check-usage-limits": {
            "task": "app.workers.analytics_tasks.check_usage_limits",
            "schedule": 600.0,  # 10 minutos
            "options": {"queue": "analytics_tasks"}
        }
    }
)
