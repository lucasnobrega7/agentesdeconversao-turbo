"""
Rotas de monitoramento e administração do Gateway
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
from datetime import datetime
import psutil
import platform
from .config import settings
from .utils import HealthChecker

router = APIRouter()


@router.get("/info")
async def gateway_info():
    """Informações sobre o gateway"""
    return {
        "name": "Agentes de Conversão API Gateway",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "features": {
            "rate_limiting": settings.RATE_LIMIT_ENABLED,
            "authentication": True,
            "circuit_breaker": True,
            "caching": settings.CACHE_ENABLED,
            "compression": True
        },
        "services": {
            "backend": settings.BACKEND_URL,
            "litellm": settings.LITELLM_URL,
            "jarvis": settings.JARVIS_URL
        },
        "limits": {
            "default_rate_limit": f"{settings.RATE_LIMIT_DEFAULT}/min",
            "rate_limit_window": f"{settings.RATE_LIMIT_WINDOW}s"
        },
        "uptime": _get_uptime()
    }


@router.get("/health")
async def health_check(request: Request):
    """Health check detalhado"""
    health_checker = request.app.state.health_checker
    return await health_checker.check_all_services()


@router.get("/stats")
async def gateway_stats(request: Request):
    """Estatísticas do gateway"""
    redis = request.app.state.redis
    
    # Coletar estatísticas
    stats = {
        "timestamp": datetime.now().isoformat(),
        "system": {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "platform": platform.platform(),
            "python_version": platform.python_version()
        },
        "process": {
            "pid": psutil.Process().pid,
            "memory_mb": psutil.Process().memory_info().rss / 1024 / 1024,
            "threads": psutil.Process().num_threads(),
            "connections": len(psutil.Process().connections())
        },
        "redis": {
            "connected": await _check_redis_connection(redis)
        }
    }
    
    # Adicionar estatísticas de rate limit
    if settings.RATE_LIMIT_ENABLED:
        rate_limit_stats = await _get_rate_limit_stats(redis)
        stats["rate_limiting"] = rate_limit_stats
    
    return stats


@router.get("/circuit-breakers")
async def circuit_breaker_status(request: Request):
    """Status dos circuit breakers"""
    circuit_breakers = request.app.state.circuit_breakers
    
    status = {}
    for service, breaker in circuit_breakers.items():
        status[service] = {
            "state": breaker.state.value,
            "failure_count": breaker._failure_count,
            "failure_threshold": breaker.failure_threshold,
            "recovery_timeout": breaker.recovery_timeout
        }
    
    return {
        "circuit_breakers": status,
        "timestamp": datetime.now().isoformat()
    }


@router.post("/circuit-breakers/{service}/reset")
async def reset_circuit_breaker(service: str, request: Request):
    """Reset manual de um circuit breaker"""
    circuit_breakers = request.app.state.circuit_breakers
    
    if service not in circuit_breakers:
        raise HTTPException(404, f"Service '{service}' not found")
    
    breaker = circuit_breakers[service]
    breaker._state = breaker.CircuitState.CLOSED
    breaker._failure_count = 0
    breaker._last_failure_time = None
    
    return {
        "service": service,
        "state": "closed",
        "message": "Circuit breaker reset successfully"
    }


@router.get("/rate-limits")
async def rate_limit_info():
    """Informações sobre rate limits"""
    return {
        "enabled": settings.RATE_LIMIT_ENABLED,
        "default_limit": settings.RATE_LIMIT_DEFAULT,
        "window": settings.RATE_LIMIT_WINDOW,
        "endpoints": settings.RATE_LIMITS
    }


@router.delete("/cache")
async def clear_cache(request: Request, pattern: Optional[str] = None):
    """Limpar cache (parcial ou total)"""
    redis = request.app.state.redis
    
    if pattern:
        # Limpar keys que correspondem ao padrão
        keys = await redis.keys(f"cache:{pattern}*")
        if keys:
            await redis.delete(*keys)
        count = len(keys)
    else:
        # Limpar todo cache
        keys = await redis.keys("cache:*")
        if keys:
            await redis.delete(*keys)
        count = len(keys)
    
    return {
        "cleared": count,
        "pattern": pattern or "*",
        "timestamp": datetime.now().isoformat()
    }


@router.get("/routes")
async def list_routes():
    """Lista todas as rotas configuradas"""
    from main import SERVICE_ROUTES
    
    routes = []
    for prefix, service in SERVICE_ROUTES.items():
        routes.append({
            "prefix": prefix,
            "service": service,
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"]
        })
    
    return {
        "total": len(routes),
        "routes": routes
    }


# Funções auxiliares

async def _check_redis_connection(redis) -> bool:
    """Verifica conexão com Redis"""
    try:
        await redis.ping()
        return True
    except:
        return False


async def _get_rate_limit_stats(redis) -> Dict[str, Any]:
    """Coleta estatísticas de rate limit"""
    keys = await redis.keys("rate_limit:*")
    
    active_clients = set()
    total_requests = 0
    
    for key in keys:
        parts = key.split(":")
        if len(parts) >= 3:
            client_ip = parts[1]
            active_clients.add(client_ip)
            
            count = await redis.get(key)
            if count:
                total_requests += int(count)
    
    return {
        "active_clients": len(active_clients),
        "total_requests": total_requests,
        "tracking_keys": len(keys)
    }


def _get_uptime() -> str:
    """Calcula uptime do processo"""
    boot_time = psutil.Process().create_time()
    uptime_seconds = time.time() - boot_time
    
    days = int(uptime_seconds // 86400)
    hours = int((uptime_seconds % 86400) // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    
    return f"{days}d {hours}h {minutes}m"
