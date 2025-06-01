"""
=============================================================================
REDIS.PY - CACHE QUE FAZ A DIFERENÇA ENTRE AMADOR E PROFISSIONAL
Enquanto outros usam dict() do Python, nós usamos Redis distribuído
=============================================================================
"""

import json
import pickle
from typing import Optional, Any, Union, List, Dict
from datetime import timedelta
import asyncio
import logging

import redis.asyncio as redis
from redis.asyncio.retry import Retry
from redis.backoff import ExponentialBackoff
from redis.exceptions import RedisError, ConnectionError, TimeoutError

from app.core.config import settings


# =============================================================================
# LOGGING - PORQUE DEBUGAR NO ESCURO É COISA DE INICIANTE
# =============================================================================

logger = logging.getLogger(__name__)


# =============================================================================
# REDIS CLIENT - CONEXÃO QUE AGUENTA PANCADA
# =============================================================================

class RedisService:
    """
    Service Redis enterprise.
    
    Cache distribuído, session storage, rate limiting, pub/sub.
    Tudo que você precisa para escalar de verdade.
    """
    
    def __init__(self):
        """
        Inicializa conexão Redis com retry automático.
        
        Porque perder conexão em produção não é opção.
        """
        # Retry configuration - reconecta automaticamente
        retry = Retry(
            retries=3,
            backoff=ExponentialBackoff(base=0.1, cap=1.0)
        )
        
        # Pool de conexões - performance máxima
        self.redis_client = redis.Redis(
            # URL com autenticação
            host=settings.REDIS_URL.split("://")[1].split("@")[1].split(":")[0],
            port=int(settings.REDIS_URL.split(":")[-1]),
            password=settings.REDIS_URL.split("://")[1].split("@")[0].split(":")[1],
            # Configurações de performance
            decode_responses=True,  # Strings ao invés de bytes
            max_connections=50,     # Pool robusto
            socket_keepalive=True,  # Mantém conexão viva
            socket_connect_timeout=5,
            socket_timeout=5,
            retry=retry,
            retry_on_error=[ConnectionError, TimeoutError],
            # SSL em produção
            ssl=settings.is_production,
            ssl_cert_reqs="required" if settings.is_production else None
        )
        
        # Pub/Sub client separado
        self.pubsub_client = self.redis_client.pubsub()
        
        # Prefixos por ambiente
        self.prefix = f"{settings.APP_NAME}:{settings.ENVIRONMENT}:"
    
    def _make_key(self, key: str) -> str:
        """
        Adiciona prefixo nas chaves.
        
        Evita colisão entre ambientes.
        Organização é profissionalismo.
        """
        return f"{self.prefix}{key}"
    
    # =============================================================================
    # OPERAÇÕES BÁSICAS - O FEIJÃO COM ARROZ QUE FUNCIONA
    # =============================================================================
    
    async def get(
        self, 
        key: str,
        default: Any = None
    ) -> Optional[Any]:
        """
        Get simples com deserialização automática.
        
        Tenta JSON primeiro, fallback para pickle.
        Retorna default se não existir.
        """
        try:
            value = await self.redis_client.get(self._make_key(key))
            
            if value is None:
                return default
            
            # Tenta deserializar JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                # Fallback para pickle (objetos complexos)
                try:
                    return pickle.loads(value.encode('latin-1'))
                except:
                    # String pura
                    return value
                    
        except RedisError as e:
            logger.error(f"Redis GET error for key {key}: {str(e)}")
            return default
    
    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[int] = None,
        nx: bool = False,
        xx: bool = False
    ) -> bool:
        """
        Set com serialização automática.
        
        - expire: TTL em segundos
        - nx: Só seta se não existir (SET IF NOT EXISTS)
        - xx: Só seta se existir (SET IF EXISTS)
        
        Flexível e poderoso.
        """
        try:
            # Serializa valor
            if isinstance(value, (str, int, float)):
                serialized = str(value)
            else:
                try:
                    serialized = json.dumps(value)
                except (TypeError, ValueError):
                    # Objetos complexos com pickle
                    serialized = pickle.dumps(value).decode('latin-1')
            
            # Set com opções
            result = await self.redis_client.set(
                self._make_key(key),
                serialized,
                ex=expire,
                nx=nx,
                xx=xx
            )
            
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Redis SET error for key {key}: {str(e)}")
            return False
    
    async def delete(self, *keys: str) -> int:
        """
        Deleta uma ou mais chaves.
        
        Retorna quantidade deletada.
        Delete em massa = performance.
        """
        try:
            if not keys:
                return 0
            
            full_keys = [self._make_key(k) for k in keys]
            return await self.redis_client.delete(*full_keys)
            
        except RedisError as e:
            logger.error(f"Redis DELETE error: {str(e)}")
            return 0
    
    async def exists(self, *keys: str) -> int:
        """
        Verifica se chaves existem.
        
        Retorna quantidade que existe.
        Mais eficiente que GET para verificação.
        """
        try:
            if not keys:
                return 0
            
            full_keys = [self._make_key(k) for k in keys]
            return await self.redis_client.exists(*full_keys)
            
        except RedisError as e:
            logger.error(f"Redis EXISTS error: {str(e)}")
            return 0
    
    async def expire(
        self,
        key: str,
        seconds: int
    ) -> bool:
        """
        Define TTL em chave existente.
        
        Útil para renovar expiração.
        """
        try:
            return bool(
                await self.redis_client.expire(
                    self._make_key(key),
                    seconds
                )
            )
        except RedisError as e:
            logger.error(f"Redis EXPIRE error for key {key}: {str(e)}")
            return False
    
    async def ttl(self, key: str) -> int:
        """
        Retorna TTL restante em segundos.
        
        -2: chave não existe
        -1: chave sem expiração
        N: segundos restantes
        """
        try:
            return await self.redis_client.ttl(self._make_key(key))
        except RedisError as e:
            logger.error(f"Redis TTL error for key {key}: {str(e)}")
            return -2
    
    # =============================================================================
    # OPERAÇÕES ATÔMICAS - CONCORRÊNCIA SEM DOR DE CABEÇA
    # =============================================================================
    
    async def incr(
        self,
        key: str,
        amount: int = 1
    ) -> Optional[int]:
        """
        Incremento atômico.
        
        Para contadores, rate limiting, etc.
        Thread-safe, distribuído.
        """
        try:
            return await self.redis_client.incrby(
                self._make_key(key),
                amount
            )
        except RedisError as e:
            logger.error(f"Redis INCR error for key {key}: {str(e)}")
            return None
    
    async def decr(
        self,
        key: str,
        amount: int = 1
    ) -> Optional[int]:
        """
        Decremento atômico.
        
        Oposto do incr.
        """
        try:
            return await self.redis_client.decrby(
                self._make_key(key),
                amount
            )
        except RedisError as e:
            logger.error(f"Redis DECR error for key {key}: {str(e)}")
            return None
    
    # =============================================================================
    # ESTRUTURAS DE DADOS - ALÉM DO KEY-VALUE BÁSICO
    # =============================================================================
    
    async def hset(
        self,
        name: str,
        key: str,
        value: Any
    ) -> int:
        """
        Set em hash (dicionário).
        
        Perfeito para objetos com campos.
        """
        try:
            serialized = json.dumps(value) if not isinstance(value, str) else value
            return await self.redis_client.hset(
                self._make_key(name),
                key,
                serialized
            )
        except RedisError as e:
            logger.error(f"Redis HSET error for {name}:{key}: {str(e)}")
            return 0
    
    async def hget(
        self,
        name: str,
        key: str
    ) -> Optional[Any]:
        """
        Get de hash.
        
        Retorna campo específico.
        """
        try:
            value = await self.redis_client.hget(
                self._make_key(name),
                key
            )
            
            if value is None:
                return None
            
            try:
                return json.loads(value)
            except:
                return value
                
        except RedisError as e:
            logger.error(f"Redis HGET error for {name}:{key}: {str(e)}")
            return None
    
    async def hgetall(self, name: str) -> Dict[str, Any]:
        """
        Get todos os campos do hash.
        
        Retorna dicionário completo.
        """
        try:
            data = await self.redis_client.hgetall(self._make_key(name))
            
            # Deserializa valores
            result = {}
            for key, value in data.items():
                try:
                    result[key] = json.loads(value)
                except:
                    result[key] = value
            
            return result
            
        except RedisError as e:
            logger.error(f"Redis HGETALL error for {name}: {str(e)}")
            return {}
    
    async def lpush(
        self,
        key: str,
        *values: Any
    ) -> int:
        """
        Push em lista (esquerda).
        
        Para filas, históricos, etc.
        """
        try:
            serialized = [
                json.dumps(v) if not isinstance(v, str) else v
                for v in values
            ]
            return await self.redis_client.lpush(
                self._make_key(key),
                *serialized
            )
        except RedisError as e:
            logger.error(f"Redis LPUSH error for key {key}: {str(e)}")
            return 0
    
    async def rpop(
        self,
        key: str,
        count: Optional[int] = None
    ) -> Optional[Union[Any, List[Any]]]:
        """
        Pop da lista (direita).
        
        Remove e retorna elementos.
        """
        try:
            if count:
                values = await self.redis_client.rpop(
                    self._make_key(key),
                    count
                )
                if not values:
                    return []
                
                # Deserializa lista
                result = []
                for v in values:
                    try:
                        result.append(json.loads(v))
                    except:
                        result.append(v)
                return result
            else:
                value = await self.redis_client.rpop(self._make_key(key))
                if value is None:
                    return None
                
                try:
                    return json.loads(value)
                except:
                    return value
                    
        except RedisError as e:
            logger.error(f"Redis RPOP error for key {key}: {str(e)}")
            return [] if count else None
    
    async def sadd(
        self,
        key: str,
        *values: Any
    ) -> int:
        """
        Adiciona em set (conjunto único).
        
        Para tags, categorias, IDs únicos.
        """
        try:
            serialized = [
                json.dumps(v) if not isinstance(v, str) else v
                for v in values
            ]
            return await self.redis_client.sadd(
                self._make_key(key),
                *serialized
            )
        except RedisError as e:
            logger.error(f"Redis SADD error for key {key}: {str(e)}")
            return 0
    
    async def sismember(
        self,
        key: str,
        value: Any
    ) -> bool:
        """
        Verifica se valor está no set.
        
        O(1) - super rápido.
        """
        try:
            serialized = json.dumps(value) if not isinstance(value, str) else value
            return bool(
                await self.redis_client.sismember(
                    self._make_key(key),
                    serialized
                )
            )
        except RedisError as e:
            logger.error(f"Redis SISMEMBER error for key {key}: {str(e)}")
            return False
    
    # =============================================================================
    # CACHE PATTERNS - ESTRATÉGIAS QUE FUNCIONAM
    # =============================================================================
    
    async def get_or_set(
        self,
        key: str,
        factory,
        expire: Optional[int] = None
    ) -> Any:
        """
        Cache-aside pattern.
        
        1. Tenta buscar do cache
        2. Se não existe, chama factory
        3. Salva no cache
        4. Retorna valor
        
        Factory pode ser sync ou async.
        """
        # Tenta cache primeiro
        cached = await self.get(key)
        if cached is not None:
            return cached
        
        # Gera valor
        if asyncio.iscoroutinefunction(factory):
            value = await factory()
        else:
            value = factory()
        
        # Salva no cache
        await self.set(key, value, expire=expire)
        
        return value
    
    async def cache_stampede_protection(
        self,
        key: str,
        factory,
        expire: int = 3600,
        lock_timeout: int = 30
    ) -> Any:
        """
        Proteção contra cache stampede.
        
        Quando cache expira e múltiplas requests
        tentam regenerar ao mesmo tempo.
        
        Usa lock distribuído para garantir
        que apenas uma request regenera.
        """
        # Tenta cache
        cached = await self.get(key)
        if cached is not None:
            return cached
        
        # Lock key
        lock_key = f"lock:{key}"
        
        # Tenta adquirir lock
        lock_acquired = await self.set(
            lock_key,
            "1",
            expire=lock_timeout,
            nx=True  # Só se não existir
        )
        
        if lock_acquired:
            try:
                # Dupla verificação
                cached = await self.get(key)
                if cached is not None:
                    return cached
                
                # Gera valor
                if asyncio.iscoroutinefunction(factory):
                    value = await factory()
                else:
                    value = factory()
                
                # Salva no cache
                await self.set(key, value, expire=expire)
                
                return value
            finally:
                # Libera lock
                await self.delete(lock_key)
        else:
            # Espera lock ser liberado
            for _ in range(lock_timeout * 10):  # Tenta por lock_timeout segundos
                await asyncio.sleep(0.1)
                cached = await self.get(key)
                if cached is not None:
                    return cached
            
            # Timeout - tenta gerar mesmo assim
            if asyncio.iscoroutinefunction(factory):
                return await factory()
            else:
                return factory()
    
    # =============================================================================
    # PUB/SUB - COMUNICAÇÃO EM TEMPO REAL
    # =============================================================================
    
    async def publish(
        self,
        channel: str,
        message: Any
    ) -> int:
        """
        Publica mensagem em canal.
        
        Para eventos, notificações, etc.
        Retorna número de subscribers que receberam.
        """
        try:
            serialized = json.dumps(message) if not isinstance(message, str) else message
            return await self.redis_client.publish(
                self._make_key(channel),
                serialized
            )
        except RedisError as e:
            logger.error(f"Redis PUBLISH error for channel {channel}: {str(e)}")
            return 0
    
    async def subscribe(
        self,
        *channels: str,
        handler = None
    ):
        """
        Inscreve em canais.
        
        Handler é chamado para cada mensagem.
        Use em asyncio task separada.
        """
        try:
            full_channels = [self._make_key(ch) for ch in channels]
            await self.pubsub_client.subscribe(*full_channels)
            
            # Se handler fornecido, processa mensagens
            if handler:
                async for message in self.pubsub_client.listen():
                    if message["type"] == "message":
                        try:
                            data = json.loads(message["data"])
                        except:
                            data = message["data"]
                        
                        if asyncio.iscoroutinefunction(handler):
                            await handler(message["channel"], data)
                        else:
                            handler(message["channel"], data)
                            
        except RedisError as e:
            logger.error(f"Redis SUBSCRIBE error: {str(e)}")
    
    # =============================================================================
    # DISTRIBUTED LOCKING - SINCRONIZAÇÃO DISTRIBUÍDA
    # =============================================================================
    
    async def acquire_lock(
        self,
        resource: str,
        timeout: int = 10,
        blocking: bool = True,
        blocking_timeout: Optional[int] = None
    ) -> Optional[str]:
        """
        Adquire lock distribuído.
        
        Para operações que precisam ser exclusivas.
        Retorna lock_id se sucesso, None se falha.
        """
        import uuid
        
        lock_key = f"lock:{resource}"
        lock_id = str(uuid.uuid4())
        
        if blocking:
            # Tenta adquirir com timeout
            start_time = asyncio.get_event_loop().time()
            timeout_time = start_time + (blocking_timeout or timeout)
            
            while asyncio.get_event_loop().time() < timeout_time:
                acquired = await self.set(
                    lock_key,
                    lock_id,
                    expire=timeout,
                    nx=True
                )
                
                if acquired:
                    return lock_id
                
                await asyncio.sleep(0.1)
            
            return None
        else:
            # Tenta uma vez só
            acquired = await self.set(
                lock_key,
                lock_id,
                expire=timeout,
                nx=True
            )
            
            return lock_id if acquired else None
    
    async def release_lock(
        self,
        resource: str,
        lock_id: str
    ) -> bool:
        """
        Libera lock distribuído.
        
        Verifica se o lock_id confere antes de liberar.
        Evita liberar lock de outro processo.
        """
        lock_key = f"lock:{resource}"
        
        # Script Lua para operação atômica
        lua_script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        
        try:
            result = await self.redis_client.eval(
                lua_script,
                1,
                self._make_key(lock_key),
                lock_id
            )
            return bool(result)
        except RedisError as e:
            logger.error(f"Redis RELEASE_LOCK error for {resource}: {str(e)}")
            return False
    
    # =============================================================================
    # UTILITIES - FERRAMENTAS ÚTEIS
    # =============================================================================
    
    async def clear_pattern(self, pattern: str) -> int:
        """
        Deleta todas as chaves que match pattern.
        
        Use com cuidado - pode deletar muita coisa.
        """
        try:
            full_pattern = self._make_key(pattern)
            keys = []
            
            # Scan iterativo para não bloquear
            async for key in self.redis_client.scan_iter(
                match=full_pattern,
                count=100
            ):
                keys.append(key)
                
                # Delete em batches
                if len(keys) >= 1000:
                    await self.redis_client.delete(*keys)
                    keys = []
            
            # Delete restante
            if keys:
                await self.redis_client.delete(*keys)
            
            return len(keys)
            
        except RedisError as e:
            logger.error(f"Redis CLEAR_PATTERN error for {pattern}: {str(e)}")
            return 0
    
    async def ping(self) -> bool:
        """
        Verifica se Redis está respondendo.
        
        Para health checks.
        """
        try:
            return await self.redis_client.ping()
        except:
            return False
    
    async def info(self) -> Dict[str, Any]:
        """
        Informações do servidor Redis.
        
        Estatísticas, memória, etc.
        """
        try:
            info = await self.redis_client.info()
            return {
                "redis_version": info.get("redis_version"),
                "connected_clients": info.get("connected_clients"),
                "used_memory_human": info.get("used_memory_human"),
                "used_memory_peak_human": info.get("used_memory_peak_human"),
                "total_connections_received": info.get("total_connections_received"),
                "total_commands_processed": info.get("total_commands_processed"),
                "instantaneous_ops_per_sec": info.get("instantaneous_ops_per_sec"),
                "keyspace_hits": info.get("keyspace_hits"),
                "keyspace_misses": info.get("keyspace_misses"),
                "evicted_keys": info.get("evicted_keys"),
                "expired_keys": info.get("expired_keys")
            }
        except RedisError as e:
            logger.error(f"Redis INFO error: {str(e)}")
            return {}
    
    async def close(self):
        """
        Fecha conexões Redis.
        
        Importante chamar ao desligar aplicação.
        """
        try:
            await self.pubsub_client.close()
            await self.redis_client.close()
            await self.redis_client.connection_pool.disconnect()
        except:
            pass


# =============================================================================
# SINGLETON - UMA INSTÂNCIA PARA DOMINAR TODAS
# =============================================================================

redis_service = RedisService()


# =============================================================================
# EXPORTS - USE COM PODER E RESPONSABILIDADE
# =============================================================================

__all__ = [
    "RedisService",
    "redis_service"
]