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
    
    # AI Providers (agora gerenciados pelo LiteLLM)
    OPENAI_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    TOGETHER_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # LiteLLM Gateway
    LITELLM_URL: str = os.getenv("LITELLM_URL", "http://litellm:4000")
    LITELLM_API_KEY: str = os.getenv("LITELLM_MASTER_KEY", "sk-master-dev")
    LITELLM_TIMEOUT: int = 180
    LITELLM_MAX_RETRIES: int = 3
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis (for caching and sessions)
    REDIS_URL: Optional[str] = None
    
    # Qdrant (Vector DB)
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://qdrant:6333")
    QDRANT_API_KEY: Optional[str] = None
    
    # Evolution API (WhatsApp)
    EVOLUTION_API_URL: Optional[str] = None
    EVOLUTION_API_KEY: Optional[str] = None
    
    # Knowledge Base
    KNOWLEDGE_CHUNK_SIZE: int = 1000
    KNOWLEDGE_CHUNK_OVERLAP: int = 200
    KNOWLEDGE_EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    model_config = {"env_file": ".env", "case_sensitive": True}

settings = Settings()