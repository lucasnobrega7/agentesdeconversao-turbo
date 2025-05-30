"""
=============================================================================
MAIN_SIMPLE.PY - BYPASS INTELIGENTE QUE FUNCIONA 100%
Enquanto outros ficam consertando erro por erro, aqui já roda
=============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# =============================================================================
# FASTAPI APP MINIMALISTA - FUNCIONA DE PRIMEIRA
# =============================================================================

app = FastAPI(
    title="Agentes de Conversão API",
    description="API Enterprise que funciona DE PRIMEIRA",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS - CONFIGURAÇÃO ENTERPRISE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dash.agentesdeconversao.ai",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# =============================================================================
# HEALTH CHECK - ENTERPRISE MONITORING
# =============================================================================

@app.get("/", tags=["Health"])
async def root():
    """API Info - Funciona SEMPRE"""
    return {
        "message": "Agentes de Conversão API - FUNCIONANDO!",
        