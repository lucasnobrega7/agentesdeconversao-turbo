"""
🚪 API Gateway - Agentes de Conversão
Gateway inteligente com rate limiting, roteamento e observability
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import httpx
import time
import json
from datetime import datetime
from typing import Optional, Dict, Any
import logging
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import redis.asyncio as redis
from app.middleware import RateLimitMiddleware, AuthMiddleware, LoggingMiddleware
from app.config import settings
from app.utils import CircuitBreaker, HealthChecker
from app.routes import router as monitoring_router

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Métricas Prometheus
request_count = Counter(
    'gateway_requests_total',
    'Total requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'gateway_request_duration_seconds',
    'Request duration',
    ['method', 'endpoint']
)

active_requests = Gauge(
    'gateway_active_requests',
    'Active requests'
)

rate_limit_hits = Counter(
    'gateway_rate_limit_hits_total',
    'Rate limit hits',
    ['client']
)

# Lifespan para gerenciar recursos
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Gateway iniciando...")
    
    # Conectar Redis
    app.state.redis = await redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
    
    # Inicializar circuit breakers
    app.state.circuit_breakers = {}
    for service in settings.SERVICES:
        app.state.circuit_breakers[service] = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=30,
            expected_exception=httpx.RequestError
        )
    
    # Health checker
    app.state.health_checker = HealthChecker(app.state.redis)
    
    logger.info("✅ Gateway pronto!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Gateway encerrando...")
    await app.state.redis.close()

# Criar app
app = FastAPI(
    title="Agentes de Conversão - API Gateway",
    description="Gateway inteligente para roteamento e proteção de APIs",
    version="1.0.0",
    lifespan=lifespan
)

# Middlewares globais
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitMiddleware)

# Incluir rotas de monitoramento
app.include_router(monitoring_router, prefix="/_gateway", tags=["monitoring"])

# Roteamento de serviços
SERVICE_ROUTES = {
    # Backend principal
    "/api/v1/agents": settings.BACKEND_URL,
    "/api/v1/conversations": settings.BACKEND_URL,
    "/api/v1/messages": settings.BACKEND_URL,
    "/api/v1/analytics": settings.BACKEND_URL,
    "/api/v1/users": settings.BACKEND_URL,
    "/api/v1/organizations": settings.BACKEND_URL,
    
    # Webhooks
    "/webhooks/evolution": settings.BACKEND_URL,
    "/webhooks/stripe": settings.BACKEND_URL,
    
    # LiteLLM
    "/ai/chat": settings.LITELLM_URL,
    "/ai/models": settings.LITELLM_URL,
    "/ai/usage": settings.LITELLM_URL,
    
    # Auth (direto para backend)
    "/auth": settings.BACKEND_URL,
    
    # Jarvis AI
    "/jarvis": settings.JARVIS_URL,
    
    # WebSocket
    "/ws": settings.BACKEND_URL,
}

def get_service_for_path(path: str) -> tuple[str, str]:
    """Determina qual serviço deve processar a requisição"""
    for route_prefix, service_url in SERVICE_ROUTES.items():
        if path.startswith(route_prefix):
            return service_url, route_prefix
    
    # Default para backend
    return settings.BACKEND_URL, "backend"

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def gateway_proxy(path: str, request: Request):
    """Proxy principal do gateway"""
    
    # Métricas
    active_requests.inc()
    start_time = time.time()
    
    try:
        # Determinar serviço destino
        service_url, service_name = get_service_for_path(path)
        
        # Circuit breaker check
        circuit_breaker = request.app.state.circuit_breakers.get(service_name)
        if circuit_breaker and not circuit_breaker.is_closed():
            request_count.labels(
                method=request.method,
                endpoint=service_name,
                status=503
            ).inc()
            
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Service temporarily unavailable",
                    "service": service_name,
                    "retry_after": circuit_breaker.recovery_timeout
                }
            )
        
        # Preparar headers
        headers = dict(request.headers)
        headers.pop("host", None)
        
        # Adicionar headers do gateway
        headers["X-Forwarded-For"] = request.client.host
        headers["X-Forwarded-Proto"] = "https" if request.url.scheme == "https" else "http"
        headers["X-Gateway-Request-ID"] = request.state.request_id
        
        # Fazer request
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                # Request com circuit breaker
                if circuit_breaker:
                    response = await circuit_breaker.call(
                        client.request,
                        method=request.method,
                        url=f"{service_url}/{path}",
                        headers=headers,
                        content=await request.body(),
                        params=dict(request.query_params)
                    )
                else:
                    response = await client.request(
                        method=request.method,
                        url=f"{service_url}/{path}",
                        headers=headers,
                        content=await request.body(),
                        params=dict(request.query_params)
                    )
                
                # Métricas
                request_count.labels(
                    method=request.method,
                    endpoint=service_name,
                    status=response.status_code
                ).inc()
                
                # Preparar response headers
                response_headers = dict(response.headers)
                response_headers["X-Gateway-Service"] = service_name
                response_headers["X-Gateway-Response-Time"] = f"{time.time() - start_time:.3f}"
                
                # Streaming response
                return StreamingResponse(
                    response.iter_bytes(),
                    status_code=response.status_code,
                    headers=response_headers
                )
                
            except httpx.RequestError as e:
                logger.error(f"Error proxying request to {service_name}: {e}")
                
                request_count.labels(
                    method=request.method,
                    endpoint=service_name,
                    status=502
                ).inc()
                
                return JSONResponse(
                    status_code=502,
                    content={
                        "error": "Bad gateway",
                        "service": service_name,
                        "message": str(e)
                    }
                )
    
    finally:
        # Métricas
        active_requests.dec()
        request_duration.labels(
            method=request.method,
            endpoint=service_name
        ).observe(time.time() - start_time)

# Health check principal
@app.get("/health", tags=["health"])
async def health_check(request: Request):
    """Health check do gateway"""
    health_status = await request.app.state.health_checker.check_all_services()
    
    # Determinar status HTTP
    if all(s["healthy"] for s in health_status["services"].values()):
        status_code = 200
    elif any(s["healthy"] for s in health_status["services"].values()):
        status_code = 206  # Partial content
    else:
        status_code = 503
    
    return JSONResponse(
        status_code=status_code,
        content=health_status
    )

# Métricas Prometheus
@app.get("/metrics", tags=["monitoring"])
async def metrics():
    """Endpoint de métricas Prometheus"""
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )

# Root endpoint
@app.get("/", tags=["info"])
async def root():
    """Informações do gateway"""
    return {
        "service": "API Gateway",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": list(SERVICE_ROUTES.keys()),
        "features": [
            "Rate limiting",
            "Circuit breaker",
            "Request routing",
            "Authentication proxy",
            "Metrics collection",
            "Health checking"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        log_level="info",
        access_log=True
    )
