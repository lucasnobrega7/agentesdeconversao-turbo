"""
🤖 LiteLLM Gateway Service - Agentes de Conversão
Proxy inteligente para gerenciamento de LLMs com roteamento por tiers
"""

import os
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import litellm
from litellm import Router, completion, acompletion
from litellm.integrations.custom_logger import CustomLogger
from prometheus_client import Counter, Histogram, Gauge
import redis.asyncio as redis
import yaml
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar configuração
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Métricas Prometheus
llm_requests = Counter(
    'llm_requests_total',
    'Total LLM requests',
    ['model', 'tier', 'status']
)

llm_tokens = Counter(
    'llm_tokens_total',
    'Total tokens processed',
    ['model', 'type']  # type: prompt/completion
)

llm_latency = Histogram(
    'llm_request_duration_seconds',
    'LLM request latency',
    ['model', 'tier']
)

llm_cost = Counter(
    'llm_cost_total',
    'Total cost in USD',
    ['model', 'organization']
)

active_llm_requests = Gauge(
    'llm_active_requests',
    'Active LLM requests',
    ['model']
)

# Custom Logger para métricas e análise
class MetricsLogger(CustomLogger):
    def __init__(self, redis_client):
        self.redis = redis_client
        
    async def log_pre_api_call(self, model, messages, kwargs):
        """Log antes da chamada"""
        active_llm_requests.labels(model=model).inc()
        
    async def log_success_event(self, kwargs, response_obj, start_time, end_time):
        """Log de sucesso com métricas"""
        model = kwargs.get("model", "unknown")
        
        # Extrair tier do nome do modelo
        tier = model.split("/")[0] if "/" in model else "unknown"
        
        # Métricas
        llm_requests.labels(model=model, tier=tier, status="success").inc()
        
        # Tokens
        usage = response_obj.get("usage", {})
        if usage:
            llm_tokens.labels(model=model, type="prompt").inc(usage.get("prompt_tokens", 0))
            llm_tokens.labels(model=model, type="completion").inc(usage.get("completion_tokens", 0))
        
        # Latência
        duration = end_time - start_time
        llm_latency.labels(model=model, tier=tier).observe(duration)
        
        # Custo estimado
        cost = self._calculate_cost(model, usage)
        if cost > 0:
            org_id = kwargs.get("metadata", {}).get("organization_id", "unknown")
            llm_cost.labels(model=model, organization=org_id).inc(cost)
        
        # Salvar no Redis para analytics
        await self._save_to_redis(model, kwargs, response_obj, duration, cost)
        
        active_llm_requests.labels(model=model).dec()
        
    async def log_failure_event(self, kwargs, response_obj, start_time, end_time):
        """Log de falha"""
        model = kwargs.get("model", "unknown")
        tier = model.split("/")[0] if "/" in model else "unknown"
        
        llm_requests.labels(model=model, tier=tier, status="failure").inc()
        active_llm_requests.labels(model=model).dec()
        
    def _calculate_cost(self, model: str, usage: Dict) -> float:
        """Calcula custo baseado no modelo e uso"""
        # Buscar informações do modelo no config
        for model_config in config["model_list"]:
            if model_config["model_name"] == model:
                cost_per_token = model_config.get("model_info", {}).get("cost_per_token", 0)
                total_tokens = usage.get("total_tokens", 0)
                return total_tokens * cost_per_token
        return 0
        
    async def _save_to_redis(self, model: str, kwargs: Dict, response: Dict, duration: float, cost: float):
        """Salva dados para analytics"""
        data = {
            "timestamp": datetime.utcnow().isoformat(),
            "model": model,
            "organization_id": kwargs.get("metadata", {}).get("organization_id"),
            "user_id": kwargs.get("metadata", {}).get("user_id"),
            "conversation_id": kwargs.get("metadata", {}).get("conversation_id"),
            "duration": duration,
            "cost": cost,
            "tokens": response.get("usage", {}),
            "intent": kwargs.get("metadata", {}).get("intent"),
            "tier": model.split("/")[0] if "/" in model else "unknown"
        }
        
        # Salvar no Redis com TTL de 30 dias
        key = f"llm_analytics:{data['organization_id']}:{datetime.utcnow().strftime('%Y%m%d')}:{response.get('id')}"
        await self.redis.setex(key, 30 * 24 * 3600, json.dumps(data))

# Lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 LiteLLM Gateway iniciando...")
    
    # Conectar Redis
    app.state.redis = await redis.from_url(
        os.getenv("REDIS_URL", "redis://localhost:6379"),
        encoding="utf-8",
        decode_responses=True
    )
    
    # Configurar LiteLLM
    litellm.success_callback = ["prometheus"]
    litellm.failure_callback = ["prometheus"]
    litellm.cache = litellm.Cache(
        type="redis",
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        password=os.getenv("REDIS_PASSWORD", None)
    )
    
    # Criar router com configuração
    app.state.router = Router(
        model_list=config["model_list"],
        fallbacks=config["litellm_settings"]["fallbacks"],
        context_window_fallbacks=config["litellm_settings"]["context_window_fallbacks"],
        num_retries=config["litellm_settings"]["num_retries"],
        timeout=config["litellm_settings"]["request_timeout"],
        retry_after=config["litellm_settings"]["retry_after"],
        routing_strategy="cost-optimized-routing"
    )
    
    # Adicionar custom logger
    metrics_logger = MetricsLogger(app.state.redis)
    litellm.callbacks = [metrics_logger]
    
    logger.info("✅ LiteLLM Gateway pronto!")
    
    yield
    
    # Shutdown
    logger.info("🛑 LiteLLM Gateway encerrando...")
    await app.state.redis.close()

# Criar app
app = FastAPI(
    title="LiteLLM Gateway - Agentes de Conversão",
    description="Gateway inteligente para LLMs com roteamento por tiers",
    version="1.0.0",
    lifespan=lifespan
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependências
async def get_auth_header(authorization: Optional[str] = Header(None)):
    """Valida autenticação"""
    if not authorization:
        raise HTTPException(401, "Missing authorization header")
    
    # Validar token (simplificado para exemplo)
    # Em produção, validar com Supabase ou JWT
    return authorization

async def get_organization_id(auth: str = Depends(get_auth_header)):
    """Extrai organization_id do token"""
    # Simplificado - em produção, decodificar JWT
    return "org_123"

# Rotas principais

@app.post("/ai/chat/completions")
async def chat_completion(
    request: Request,
    organization_id: str = Depends(get_organization_id)
):
    """Endpoint principal para chat completions com roteamento inteligente"""
    
    try:
        body = await request.json()
        
        # Extrair informações para roteamento
        messages = body.get("messages", [])
        metadata = body.get("metadata", {})
        
        # Adicionar organization_id ao metadata
        metadata["organization_id"] = organization_id
        
        # Determinar modelo baseado no contexto
        model = await determine_model(
            messages=messages,
            metadata=metadata,
            router=request.app.state.router
        )
        
        # Preparar request
        completion_kwargs = {
            "model": model,
            "messages": messages,
            "metadata": metadata,
            **{k: v for k, v in body.items() if k not in ["messages", "metadata", "model"]}
        }
        
        # Stream ou não
        if body.get("stream", False):
            response = await request.app.state.router.acompletion(**completion_kwargs, stream=True)
            
            async def generate():
                async for chunk in response:
                    yield f"data: {json.dumps(chunk.dict())}\n\n"
                yield "data: [DONE]\n\n"
                
            return StreamingResponse(generate(), media_type="text/event-stream")
        else:
            response = await request.app.state.router.acompletion(**completion_kwargs)
            return response.dict()
            
    except Exception as e:
        logger.error(f"Error in chat completion: {e}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.get("/ai/models")
async def list_models(
    organization_id: str = Depends(get_organization_id)
):
    """Lista modelos disponíveis para a organização"""
    
    # Filtrar modelos baseado no plano da organização
    # Simplificado - em produção, buscar plano do banco
    available_models = []
    
    for model in config["model_list"]:
        tier = model["model_info"]["tier"]
        
        # Exemplo: organizações free só acessam tier 1
        # Em produção, verificar plano real
        if organization_id == "org_free" and tier > 1:
            continue
            
        available_models.append({
            "id": model["model_name"],
            "object": "model",
            "created": 1677610602,
            "owned_by": "agentes-conversao",
            "permission": [],
            "root": model["litellm_params"]["model"],
            "parent": None,
            "tier": tier,
            "description": model["model_info"]["description"],
            "cost_per_token": model["model_info"]["cost_per_token"]
        })
    
    return {"object": "list", "data": available_models}

@app.get("/ai/usage")
async def get_usage(
    organization_id: str = Depends(get_organization_id),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Retorna uso e custos de IA para a organização"""
    
    # Buscar dados do Redis
    usage_data = await calculate_usage(
        request.app.state.redis,
        organization_id,
        start_date,
        end_date
    )
    
    return usage_data

# Funções auxiliares

async def determine_model(
    messages: List[Dict],
    metadata: Dict,
    router: Router
) -> str:
    """Determina o melhor modelo baseado no contexto"""
    
    # Extrair última mensagem
    last_message = messages[-1]["content"] if messages else ""
    
    # Analisar intent (simplificado)
    intent = metadata.get("intent") or analyze_intent(last_message)
    
    # Valor do usuário
    user_value = metadata.get("user_value", "standard")
    
    # Complexidade estimada
    complexity = estimate_complexity(messages)
    
    # Aplicar regras de roteamento
    for rule in config["router_settings"]["model_rules"]:
        conditions = rule["conditions"]
        
        # Verificar condições
        if "intent" in conditions and intent not in conditions["intent"]:
            continue
            
        if "user_value" in conditions and user_value != conditions["user_value"]:
            continue
            
        if "max_tokens" in conditions and complexity["estimated_tokens"] > conditions["max_tokens"]:
            continue
            
        # Condições atendidas - retornar primeiro modelo disponível
        for model in rule["preferred_models"]:
            if is_model_available(model, router):
                return model
    
    # Fallback para tier 1
    return "tier1/llama-3.2-3b"

def analyze_intent(message: str) -> str:
    """Analisa intent da mensagem (simplificado)"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["oi", "olá", "bom dia", "boa tarde", "boa noite"]):
        return "greeting"
    elif any(word in message_lower for word in ["preço", "custo", "valor", "quanto custa"]):
        return "product_query"
    elif any(word in message_lower for word in ["erro", "problema", "não funciona", "ajuda"]):
        return "technical_support"
    elif any(word in message_lower for word in ["comprar", "adquirir", "negociar", "desconto"]):
        return "sales_negotiation"
    else:
        return "general_query"

def estimate_complexity(messages: List[Dict]) -> Dict:
    """Estima complexidade da conversa"""
    total_chars = sum(len(msg["content"]) for msg in messages)
    estimated_tokens = total_chars // 4  # Aproximação
    
    return {
        "message_count": len(messages),
        "total_characters": total_chars,
        "estimated_tokens": estimated_tokens,
        "complexity_score": min(estimated_tokens / 1000, 1.0)
    }

def is_model_available(model: str, router: Router) -> bool:
    """Verifica se modelo está disponível"""
    return any(m["model_name"] == model for m in router.model_list)

async def calculate_usage(
    redis_client,
    organization_id: str,
    start_date: Optional[str],
    end_date: Optional[str]
) -> Dict:
    """Calcula uso e custos do período"""
    
    # Buscar dados do Redis
    pattern = f"llm_analytics:{organization_id}:*"
    keys = []
    
    async for key in redis_client.scan_iter(match=pattern):
        keys.append(key)
    
    # Agregar dados
    total_cost = 0
    total_tokens = 0
    model_usage = {}
    
    for key in keys:
        data = json.loads(await redis_client.get(key))
        
        # Filtrar por data se especificado
        if start_date and data["timestamp"] < start_date:
            continue
        if end_date and data["timestamp"] > end_date:
            continue
            
        total_cost += data["cost"]
        total_tokens += data["tokens"].get("total_tokens", 0)
        
        model = data["model"]
        if model not in model_usage:
            model_usage[model] = {
                "requests": 0,
                "tokens": 0,
                "cost": 0
            }
        
        model_usage[model]["requests"] += 1
        model_usage[model]["tokens"] += data["tokens"].get("total_tokens", 0)
        model_usage[model]["cost"] += data["cost"]
    
    return {
        "organization_id": organization_id,
        "period": {
            "start": start_date or "all_time",
            "end": end_date or "current"
        },
        "summary": {
            "total_cost": round(total_cost, 4),
            "total_tokens": total_tokens,
            "total_requests": len(keys)
        },
        "by_model": model_usage
    }

# Health check
@app.get("/health")
async def health_check():
    """Health check do serviço"""
    return {
        "status": "healthy",
        "service": "litellm-gateway",
        "models_available": len(config["model_list"]),
        "timestamp": datetime.utcnow().isoformat()
    }

# Métricas Prometheus
@app.get("/metrics")
async def metrics():
    """Endpoint de métricas Prometheus"""
    from prometheus_client import generate_latest
    from fastapi.responses import Response
    
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )

if __name__ == "__main__":
    import uvicorn
    
    # Usar configuração do LiteLLM se disponível
    port = int(os.getenv("LITELLM_PORT", 4000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=True
    )
