"""
Utilitários do Gateway
"""

import asyncio
import time
import httpx
from typing import Optional, Callable, Any, Dict
from datetime import datetime, timedelta
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Estados do circuit breaker"""
    CLOSED = "closed"      # Normal, permitindo requests
    OPEN = "open"          # Bloqueando requests
    HALF_OPEN = "half_open"  # Testando se serviço voltou


class CircuitBreaker:
    """
    Circuit Breaker para proteger contra falhas em cascata
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        expected_exception: type = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self._failure_count = 0
        self._last_failure_time = None
        self._state = CircuitState.CLOSED
    
    @property
    def state(self) -> CircuitState:
        """Retorna o estado atual do circuit breaker"""
        if self._state == CircuitState.OPEN:
            if self._last_failure_time and \
               datetime.now() - self._last_failure_time > timedelta(seconds=self.recovery_timeout):
                self._state = CircuitState.HALF_OPEN
        return self._state
    
    def is_closed(self) -> bool:
        """Verifica se o circuito está fechado (normal)"""
        return self.state in [CircuitState.CLOSED, CircuitState.HALF_OPEN]
    
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Executa função com proteção do circuit breaker"""
        if not self.is_closed():
            raise Exception(f"Circuit breaker is {self.state.value}")
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    def _on_success(self):
        """Registra sucesso"""
        if self._state == CircuitState.HALF_OPEN:
            self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time = None
    
    def _on_failure(self):
        """Registra falha"""
        self._failure_count += 1
        self._last_failure_time = datetime.now()
        
        if self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN
            logger.warning(
                f"Circuit breaker opened after {self._failure_count} failures"
            )


class HealthChecker:
    """
    Verificador de saúde dos serviços
    """
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.service_checks = {
            "backend": self._check_backend,
            "litellm": self._check_litellm,
            "jarvis": self._check_jarvis,
            "redis": self._check_redis,
        }
    
    async def check_service(self, service: str) -> Dict[str, Any]:
        """Verifica saúde de um serviço específico"""
        if service not in self.service_checks:
            return {
                "healthy": False,
                "error": "Unknown service"
            }
        
        try:
            start_time = time.time()
            result = await self.service_checks[service]()
            duration = time.time() - start_time
            
            return {
                "healthy": result,
                "response_time": f"{duration:.3f}s",
                "checked_at": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "healthy": False,
                "error": str(e),
                "checked_at": datetime.now().isoformat()
            }
    
    async def check_all_services(self) -> Dict[str, Any]:
        """Verifica saúde de todos os serviços"""
        results = {}
        
        # Verificar serviços em paralelo
        tasks = [
            self.check_service(service)
            for service in self.service_checks.keys()
        ]
        
        service_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for service, result in zip(self.service_checks.keys(), service_results):
            if isinstance(result, Exception):
                results[service] = {
                    "healthy": False,
                    "error": str(result)
                }
            else:
                results[service] = result
        
        # Status geral
        all_healthy = all(
            r.get("healthy", False) for r in results.values()
        )
        
        return {
            "status": "healthy" if all_healthy else "unhealthy",
            "services": results,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _check_backend(self) -> bool:
        """Verifica saúde do backend"""
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://backend:8000/health")
            return response.status_code == 200
    
    async def _check_litellm(self) -> bool:
        """Verifica saúde do LiteLLM"""
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://litellm:4000/health")
            return response.status_code == 200
    
    async def _check_jarvis(self) -> bool:
        """Verifica saúde do Jarvis"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get("http://jarvis:8001/health")
                return response.status_code == 200
        except:
            # Jarvis é opcional
            return True
    
    async def _check_redis(self) -> bool:
        """Verifica saúde do Redis"""
        try:
            await self.redis.ping()
            return True
        except:
            return False


class RequestValidator:
    """Validador de requests"""
    
    @staticmethod
    def validate_content_length(request, max_size: int = 10 * 1024 * 1024):
        """Valida tamanho do conteúdo (default: 10MB)"""
        content_length = request.headers.get("Content-Length")
        if content_length and int(content_length) > max_size:
            raise ValueError(f"Content too large: {content_length} bytes")
    
    @staticmethod
    def validate_content_type(request, allowed_types: list):
        """Valida content-type"""
        content_type = request.headers.get("Content-Type", "")
        if not any(ct in content_type for ct in allowed_types):
            raise ValueError(f"Invalid content type: {content_type}")


class ResponseCache:
    """Cache simples para responses"""
    
    def __init__(self, redis_client, ttl: int = 300):
        self.redis = redis_client
        self.ttl = ttl
    
    def _get_cache_key(self, method: str, path: str, params: dict) -> str:
        """Gera chave de cache"""
        param_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        return f"cache:{method}:{path}:{param_str}"
    
    async def get(self, method: str, path: str, params: dict) -> Optional[Dict]:
        """Busca no cache"""
        if method not in ["GET", "HEAD"]:
            return None
        
        key = self._get_cache_key(method, path, params)
        data = await self.redis.get(key)
        
        if data:
            import json
            return json.loads(data)
        
        return None
    
    async def set(
        self,
        method: str,
        path: str,
        params: dict,
        response_data: Dict,
        ttl: Optional[int] = None
    ):
        """Salva no cache"""
        if method not in ["GET", "HEAD"]:
            return
        
        key = self._get_cache_key(method, path, params)
        import json
        
        await self.redis.setex(
            key,
            ttl or self.ttl,
            json.dumps(response_data)
        )


def calculate_retry_delay(attempt: int, base_delay: float = 1.0) -> float:
    """Calcula delay exponencial para retry"""
    return min(base_delay * (2 ** attempt), 60.0)  # Max 60 segundos
