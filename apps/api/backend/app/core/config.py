import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Agentes de Conversão"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "API Enterprise para Agentes Inteligentes"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["*"]  # Configure properly in production
    
    # Database
    SUPABASE_URL: str = "https://faccixlabriqwxkxqprw.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2NpeGxhYnJpcXd4a3hxcHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzQ4NzMsImV4cCI6MjA1MjQ1MDg3M30.eBGqJ-t9V0hK-QIDJzN0SZuQ4QX-Y66TwBJ1sVcWKGQ"
    SUPABASE_SERVICE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2NpeGxhYnJpcXd4a3hxcHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3NDg3MywiZXhwIjoyMDUyNDUwODczfQ.8J3XrqFWYEEjCG-yT5ZN_hV4Bl3sMhUEV0vEhMJDlNc"
    
    # AI Providers
    OPENAI_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis (for caching and sessions)
    REDIS_URL: Optional[str] = None
    
    model_config = {"env_file": ".env", "case_sensitive": True}

settings = Settings()