"""
Core Configuration Module
Implements the Twelve-Factor App methodology for configuration management
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache
import os


class Settings(BaseSettings):
    """
    Application settings following environment-based configuration pattern
    """
    # Application Core
    PROJECT_NAME: str = "Agentes de Conversão"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    # Server Configuration
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    WORKERS: int = 4
    
    # Database Configuration
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0
    
    # Redis Configuration
    REDIS_URL: Optional[str] = None
    REDIS_POOL_SIZE: int = 10
    
    # Authentication & Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Supabase Integration
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # OpenRouter AI Configuration
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    DEFAULT_AI_MODEL: str = "openai/gpt-3.5-turbo"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://dash.agentesdeconversao.ai",
        "https://lp.agentesdeconversao.ai",
    ]
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # Monitoring & Observability
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    ENABLE_METRICS: bool = True
    
    # Feature Flags
    ENABLE_WEBSOCKETS: bool = True
    ENABLE_BACKGROUND_TASKS: bool = True
    ENABLE_CACHE: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return not self.DEBUG
    
    @property
    def database_url_async(self) -> str:
        """Convert sync database URL to async"""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance following Singleton pattern
    """
    return Settings()


# Global settings instance
settings = get_settings()
