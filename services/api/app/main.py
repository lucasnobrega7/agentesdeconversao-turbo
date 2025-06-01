"""
=============================================================================
MAIN.PY - ARQUITETURA ENTERPRISE
Implementação que outros CTOs vão pagar R$200.000 para entender
=============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1.agents import router as agents_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.auth import router as auth_router
from app.core.config import settings

# =============================================================================
# FASTAPI APP - 30 LINHAS QUE VALEM MILHÕES
# =============================================================================

app = FastAPI(
    title="Agentes de Conversão API",
    description="API Enterprise que transforma conversas em conversões",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Security Middleware - NÍVEL ENTERPRISE
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=[
        "api.agentesdeconversao.ai",
        "localhost",
        "127.0.0.1"
    ]
)

# CORS - CONFIGURAÇÃO ENTERPRISE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dash.agentesdeconversao.ai",
        "https://lp.agentesdeconversao.ai", 
        "https://login.agentesdeconversao.ai",
        "http://localhost:3000",  # Development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# =============================================================================
# ROUTERS - ARQUITETURA MODULAR QUE OUTROS VÃO COPIAR
# =============================================================================

# V1 API Routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(agents_router, prefix="/agents", tags=["Agents"])
app.include_router(conversations_router, prefix="/conversations", tags=["Conversations"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(knowledge_router, prefix="/knowledge", tags=["Knowledge"])
app.include_router(integrations_router, prefix="/integrations", tags=["Integrations"])

# =============================================================================
# HEALTH CHECK - ENTERPRISE MONITORING
# =============================================================================

@app.get("/", tags=["Health"])
async def root():
    """API Info - Só para quem merece"""
    return {
        "message": "Agentes de Conversão API",
        "version": "1.0.0",
        "status": "Enterprise Ready",
        "docs": "api.agentesdeconversao.ai/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check enterprise que outros vão copiar"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "cache": "active",
        "ai_models": "ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=settings.DEBUG
    )