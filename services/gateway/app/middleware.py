"""
Middlewares customizados do Gateway
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import jwt
import uuid
import logging
from typing import Optional
from .config import settings

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware de rate limiting"""
    
    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)
        
        # Pular rate limit para endpoints internos
        if request.url.path.startswith("/_gateway"):
            return await call_next(request)
        
        # Identificar cliente
        client_ip = request.client.host
        if "X-Forwarded-For" in request.headers:
            client_ip = request.headers["X-Forwarded-For"].split(",")[0].strip()
        
        # Determinar limite para o endpoint
        limit = settings.RATE_LIMIT_DEFAULT
        for endpoint, endpoint_limit in settings.RATE_LIMITS.items():
            if request.url.path.startswith(endpoint):
                limit = endpoint_limit
                break
        
        # Verificar rate limit
        redis = request.app.state.redis
        key = f"rate_limit:{client_ip}:{request.url.path}"
        
        try:
            current = await redis.incr(key)
            if current == 1:
                await redis.expire(key, settings.RATE_LIMIT_WINDOW)
            
            if current > limit:
                # Incrementar métrica
                from main import rate_limit_hits
                rate_limit_hits.labels(client=client_ip).inc()
                
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "retry_after": settings.RATE_LIMIT_WINDOW,
                        "limit": limit,
                        "window": f"{settings.RATE_LIMIT_WINDOW} seconds"
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": str(max(0, limit - current)),
                        "X-RateLimit-Reset": str(int(time.time()) + settings.RATE_LIMIT_WINDOW),
                        "Retry-After": str(settings.RATE_LIMIT_WINDOW)
                    }
                )
            
            # Adicionar headers de rate limit
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current))
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + settings.RATE_LIMIT_WINDOW)
            
            return response
            
        except Exception as e:
            logger.error(f"Rate limit error: {e}")
            # Em caso de erro, deixar passar (fail open)
            return await call_next(request)


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware de autenticação"""
    
    async def dispatch(self, request: Request, call_next):
        # Verificar se endpoint é público
        path = request.url.path
        if any(path.startswith(public) for public in settings.PUBLIC_ENDPOINTS):
            return await call_next(request)
        
        # Extrair token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"error": "Missing or invalid authorization header"}
            )
        
        token = auth_header.split(" ")[1]
        
        try:
            # Validar token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Adicionar informações do usuário ao request
            request.state.user_id = payload.get("sub")
            request.state.organization_id = payload.get("org_id")
            request.state.roles = payload.get("roles", [])
            
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=401,
                content={"error": "Token expired"}
            )
        except jwt.InvalidTokenError:
            return JSONResponse(
                status_code=401,
                content={"error": "Invalid token"}
            )
        
        return await call_next(request)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware de logging"""
    
    async def dispatch(self, request: Request, call_next):
        # Gerar request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log da request
        if settings.LOG_REQUESTS:
            logger.info(
                f"Request: {request.method} {request.url.path} "
                f"from {request.client.host} "
                f"[{request_id}]"
            )
        
        # Processar request
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log da response
        if settings.LOG_RESPONSES or response.status_code >= 400:
            logger.info(
                f"Response: {response.status_code} "
                f"in {duration:.3f}s "
                f"[{request_id}]"
            )
        
        # Adicionar headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration:.3f}"
        
        # Security headers
        for header, value in settings.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        return response


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware para tratamento de erros"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": e.detail,
                    "status_code": e.status_code,
                    "request_id": getattr(request.state, "request_id", None)
                }
            )
        except Exception as e:
            logger.error(f"Unhandled error: {e}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "request_id": getattr(request.state, "request_id", None)
                }
            )


class CompressionMiddleware(BaseHTTPMiddleware):
    """Middleware para compressão customizada"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Verificar se cliente suporta gzip
        accept_encoding = request.headers.get("Accept-Encoding", "")
        if "gzip" not in accept_encoding:
            return response
        
        # Verificar content-type
        content_type = response.headers.get("Content-Type", "")
        if not any(ct in content_type for ct in ["json", "text", "javascript", "css"]):
            return response
        
        return response
