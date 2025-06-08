"""
Cache Service usando Redis para otimizar LiteLLM
"""

import json
import hashlib
from typing import Any, Dict, Optional, List
from datetime import timedelta
import logging

import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """Serviço de cache para respostas de IA e dados frequentes"""
    
    def __init__(self):
        self.redis_url = settings.REDIS_URL or "redis://localhost:6379"
        self._redis: Optional[redis.Redis] = None
        
    async def connect(self):
        """Conecta ao Redis"""
        if not self._redis:
            self._redis = await redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            
    async def disconnect(self):
        """Desconecta do Redis"""
        if self._redis:
            await self._redis.close()
            self._redis = None
            
    async def get_redis(self) -> redis.Redis:
        """Obtém conexão Redis"""
        if not self._redis:
            await self.connect()
        return self._redis
    
    def _generate_cache_key(self, prefix: str, params: Dict[str, Any]) -> str:
        """Gera chave de cache determinística"""
        # Serializar parâmetros de forma ordenada
        params_str = json.dumps(params, sort_keys=True)
        
        # Gerar hash
        hash_obj = hashlib.sha256(params_str.encode())
        param_hash = hash_obj.hexdigest()[:16]
        
        return f"{prefix}:{param_hash}"
    
    async def get_ai_response(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Busca resposta de IA no cache"""
        
        redis_client = await self.get_redis()
        
        # Gerar chave
        cache_params = {
            "messages": messages,
            "model": model,
            "org": organization_id
        }
        
        cache_key = self._generate_cache_key("ai_response", cache_params)
        
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info(f"Cache hit for AI response: {cache_key}")
                return json.loads(cached)
                
        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
            
        return None
    
    async def set_ai_response(
        self,
        messages: List[Dict[str, str]],
        response: Dict[str, Any],
        model: Optional[str] = None,
        organization_id: Optional[str] = None,
        ttl_seconds: int = 3600  # 1 hora default
    ):
        """Armazena resposta de IA no cache"""
        
        redis_client = await self.get_redis()
        
        # Gerar chave
        cache_params = {
            "messages": messages,
            "model": model,
            "org": organization_id
        }
        
        cache_key = self._generate_cache_key("ai_response", cache_params)
        
        try:
            await redis_client.setex(
                cache_key,
                ttl_seconds,
                json.dumps(response)
            )
            logger.info(f"Cached AI response: {cache_key}")
            
        except Exception as e:
            logger.error(f"Error setting cache: {e}")
    
    async def get_knowledge_search(
        self,
        query: str,
        knowledge_base_id: str,
        organization_id: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Busca resultado de pesquisa em knowledge base no cache"""
        
        redis_client = await self.get_redis()
        
        cache_params = {
            "query": query,
            "kb_id": knowledge_base_id,
            "org": organization_id
        }
        
        cache_key = self._generate_cache_key("kb_search", cache_params)
        
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info(f"Cache hit for knowledge search: {cache_key}")
                return json.loads(cached)
                
        except Exception as e:
            logger.error(f"Error getting knowledge search from cache: {e}")
            
        return None
    
    async def set_knowledge_search(
        self,
        query: str,
        results: List[Dict[str, Any]],
        knowledge_base_id: str,
        organization_id: str,
        ttl_seconds: int = 1800  # 30 minutos
    ):
        """Armazena resultado de pesquisa em knowledge base no cache"""
        
        redis_client = await self.get_redis()
        
        cache_params = {
            "query": query,
            "kb_id": knowledge_base_id,
            "org": organization_id
        }
        
        cache_key = self._generate_cache_key("kb_search", cache_params)
        
        try:
            await redis_client.setex(
                cache_key,
                ttl_seconds,
                json.dumps(results)
            )
            logger.info(f"Cached knowledge search: {cache_key}")
            
        except Exception as e:
            logger.error(f"Error setting knowledge search cache: {e}")
    
    async def increment_usage_counter(
        self,
        organization_id: str,
        model: str,
        tokens: int,
        cost: float
    ):
        """Incrementa contadores de uso para analytics"""
        
        redis_client = await self.get_redis()
        
        # Chaves para diferentes métricas
        today = datetime.utcnow().strftime("%Y%m%d")
        
        keys = {
            "requests": f"usage:{organization_id}:{today}:requests:{model}",
            "tokens": f"usage:{organization_id}:{today}:tokens:{model}",
            "cost": f"usage:{organization_id}:{today}:cost:{model}"
        }
        
        try:
            # Incrementar contadores
            pipe = redis_client.pipeline()
            pipe.incr(keys["requests"])
            pipe.incrby(keys["tokens"], tokens)
            pipe.incrbyfloat(keys["cost"], cost)
            
            # Expirar em 35 dias
            for key in keys.values():
                pipe.expire(key, 35 * 24 * 3600)
                
            await pipe.execute()
            
        except Exception as e:
            logger.error(f"Error incrementing usage counters: {e}")
    
    async def get_usage_stats(
        self,
        organization_id: str,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """Obtém estatísticas de uso agregadas"""
        
        redis_client = await self.get_redis()
        
        stats = {
            "total_requests": 0,
            "total_tokens": 0,
            "total_cost": 0.0,
            "by_model": {},
            "by_date": {}
        }
        
        try:
            # Iterar sobre datas
            current = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            
            while current <= end:
                date_str = current.strftime("%Y%m%d")
                
                # Buscar todas as chaves do dia
                pattern = f"usage:{organization_id}:{date_str}:*"
                keys = []
                
                async for key in redis_client.scan_iter(match=pattern):
                    keys.append(key)
                
                # Processar chaves
                for key in keys:
                    parts = key.split(":")
                    if len(parts) >= 5:
                        metric_type = parts[3]
                        model = parts[4]
                        
                        value = await redis_client.get(key)
                        if value:
                            if metric_type == "requests":
                                stats["total_requests"] += int(value)
                                if model not in stats["by_model"]:
                                    stats["by_model"][model] = {"requests": 0, "tokens": 0, "cost": 0}
                                stats["by_model"][model]["requests"] += int(value)
                                
                            elif metric_type == "tokens":
                                stats["total_tokens"] += int(value)
                                if model not in stats["by_model"]:
                                    stats["by_model"][model] = {"requests": 0, "tokens": 0, "cost": 0}
                                stats["by_model"][model]["tokens"] += int(value)
                                
                            elif metric_type == "cost":
                                stats["total_cost"] += float(value)
                                if model not in stats["by_model"]:
                                    stats["by_model"][model] = {"requests": 0, "tokens": 0, "cost": 0}
                                stats["by_model"][model]["cost"] += float(value)
                
                current += timedelta(days=1)
                
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            
        return stats
    
    async def rate_limit_check(
        self,
        organization_id: str,
        limit_per_minute: int = 60
    ) -> bool:
        """Verifica rate limit da organização"""
        
        redis_client = await self.get_redis()
        
        key = f"rate_limit:{organization_id}:{datetime.utcnow().strftime('%Y%m%d%H%M')}"
        
        try:
            # Incrementar contador
            current = await redis_client.incr(key)
            
            # Definir expiração se for o primeiro
            if current == 1:
                await redis_client.expire(key, 60)
            
            return current <= limit_per_minute
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            return True  # Permitir em caso de erro
    
    async def store_conversation_context(
        self,
        conversation_id: str,
        context: Dict[str, Any],
        ttl_seconds: int = 300  # 5 minutos
    ):
        """Armazena contexto de conversa temporariamente"""
        
        redis_client = await self.get_redis()
        
        key = f"conversation_context:{conversation_id}"
        
        try:
            await redis_client.setex(
                key,
                ttl_seconds,
                json.dumps(context)
            )
            
        except Exception as e:
            logger.error(f"Error storing conversation context: {e}")
    
    async def get_conversation_context(
        self,
        conversation_id: str
    ) -> Optional[Dict[str, Any]]:
        """Recupera contexto de conversa"""
        
        redis_client = await self.get_redis()
        
        key = f"conversation_context:{conversation_id}"
        
        try:
            cached = await redis_client.get(key)
            if cached:
                return json.loads(cached)
                
        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            
        return None


# Singleton instance
cache_service = CacheService()
