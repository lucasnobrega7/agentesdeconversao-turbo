"""
=============================================================================
SERVICES INIT - PORQUE ORGANIZAÇÃO SEPARA PROFISSIONAL DE AMADOR
=============================================================================
"""

from app.services.email import EmailService, email_service
from app.services.redis import RedisService, redis_service

__all__ = [
    "EmailService",
    "email_service",
    "RedisService", 
    "redis_service"
]