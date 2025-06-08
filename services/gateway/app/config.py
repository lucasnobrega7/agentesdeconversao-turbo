"""
Configurações do Gateway
"""

from pydantic_settings import BaseSettings
from typing import List, Dict
import os

class Settings(BaseSettings):
    """Configurações do gateway"""
    
    # Básico
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Redis
    REDIS_URL: str = "redis://default:redis@redis:6379/0"
    
    # URLs dos serviços
    BACKEND_URL: str = "http://backend:8000"
    LITELLM_URL: str = "http://litellm:4000"
    JARVIS_URL: str = "http://jarvis:8001"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://dash.agentesdeconversao.ai",
        "https://agentesdeconversao.ai"
    ]
    
    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: int = 100  # requests por minuto
    RATE_LIMIT_WINDOW: int = 60    # segundos
    
    # Rate limits específicos por endpoint
    RATE_LIMITS: Dict[str, int] = {
        "/api/v1/messages": 200,      # Mais alto para mensagens
        "/ai/chat": 50,               # Mais baixo para AI
        "/webhooks": 1000,            # Alto para webhooks
        "/api/v1/analytics": 30,      # Baixo para analytics pesadas
    }
    
    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret")
    JWT_ALGORITHM: str = "HS256"
    
    # Endpoints públicos (sem auth)
    PUBLIC_ENDPOINTS: List[str] = [
        "/health",
        "/metrics",
        "/_gateway",
        "/docs",
        "/openapi.json",
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/webhooks"
    ]
    
    # Circuit breaker
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 5
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT: int = 30
    CIRCUIT_BREAKER_EXPECTED_EXCEPTION: type = Exception
    
    # Timeouts
    DEFAULT_TIMEOUT: int = 30
    AI_TIMEOUT: int = 60
    ANALYTICS_TIMEOUT: int = 120
    
    # Serviços para health check
    SERVICES: List[str] = ["backend", "litellm", "jarvis", "redis"]
    
    # Cache
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 300  # 5 minutos
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_REQUESTS: bool = True
    LOG_RESPONSES: bool = False
    
    # Compression
    GZIP_MIN_SIZE: int = 1000  # bytes
    
    # Security headers
    SECURITY_HEADERS: Dict[str, str] = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Instância global
settings = Settings()
