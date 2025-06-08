# ARQUITETURA.md - Definições Técnicas do Projeto

> Este arquivo define a arquitetura oficial do projeto Agentes de Conversão.
> Sempre siga estas especificações ao desenvolver.

## 🎯 Princípios Arquiteturais

1. **Python First**: Backend 100% Python com FastAPI
2. **Async by Default**: Toda operação I/O deve ser assíncrona
3. **Queue Everything**: Operações pesadas vão para Celery
4. **Cache Agressivo**: Redis para tudo que puder ser cacheado
5. **Observability**: Logs estruturados + métricas + traces

## 🏗️ Stack Definitiva

### Frontend
- **Framework**: Next.js 15.3.3 + React 19
- **Styling**: Tailwind CSS + Motion Primitives
- **State**: Zustand (global) + React Query (server)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Editor**: ReactFlow (apenas para editor de fluxos)

### Backend
- **API**: FastAPI 0.109+
- **Queue**: Celery + Redis
- **Database**: Supabase (PostgreSQL)
- **Vector DB**: Qdrant
- **Cache**: Redis
- **AI Gateway**: LiteLLM
- **AI Orchestration**: LangChain
- **Validation**: Pydantic V2

### Infraestrutura
- **Dev**: Docker Compose
- **Backend Deploy**: Railway
- **Frontend Deploy**: Vercel
- **CI/CD**: GitHub Actions
- **CDN**: Cloudflare

## 📁 Estrutura de Pastas

```
services/api/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── agents.py
│   │       ├── conversations.py
│   │       ├── messages.py
│   │       └── webhooks.py
│   ├── core/
│   │   ├── config.py      # Settings com Pydantic
│   │   ├── database.py    # Conexões
│   │   ├── security.py    # JWT, auth
│   │   └── dependencies.py
│   ├── models/            # Pydantic models
│   ├── services/          # Business logic
│   ├── workers/           # Celery tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── message_tasks.py
│   │   └── jarvis_tasks.py
│   └── main.py
├── tests/
└── requirements.txt
```

## 🔄 Fluxo de Dados

1. **Request** → Gateway (rate limit, auth)
2. **Gateway** → Backend API (business logic)
3. **Backend** → Celery Queue (se operação pesada)
4. **Celery Worker** → LangChain → LiteLLM
5. **Response** → Redis Cache → Cliente

## 📝 Padrões de Código

### Backend (Python)
```python
# Use Type Hints sempre
from typing import List, Optional, Dict, Any

# Pydantic models para validação
from pydantic import BaseModel, Field

class AgentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    model_tier: int = Field(1, ge=1, le=4)

# Async sempre que possível
async def create_agent(data: AgentCreate) -> Agent:
    # Business logic aqui
    pass

# Dependency injection
async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> User:
    # Validação JWT
    pass
```

### Celery Tasks
```python
from celery import shared_task
from app.workers import celery_app

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def process_message(self, message_id: str):
    try:
        # Processamento
        pass
    except Exception as exc:
        raise self.retry(exc=exc)
```

### Frontend (TypeScript)
```typescript
// Sempre use interfaces
interface Agent {
  id: string;
  name: string;
  description?: string;
  modelTier: number;
}

// API client centralizado
export const api = {
  agents: {
    list: () => fetcher<Agent[]>('/api/v1/agents'),
    create: (data: AgentCreate) => 
      fetcher<Agent>('/api/v1/agents', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }
}

// React Query para server state
const { data, isLoading } = useQuery({
  queryKey: ['agents'],
  queryFn: api.agents.list
})
```

## 🔐 Segurança

1. **Auth**: Supabase Auth + JWT
2. **API Keys**: Por organização, não por usuário
3. **Rate Limiting**: Por IP e por API Key
4. **CORS**: Configurado no Gateway
5. **Validation**: Pydantic em TODAS entradas

## 🚀 Comandos Essenciais

```bash
# Development
./start.sh              # Inicia tudo
docker-compose logs -f  # Ver todos logs

# Backend
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload

# Celery
celery -A app.workers worker --loglevel=info
celery -A app.workers beat --loglevel=info
celery -A app.workers flower  # Dashboard

# Frontend
cd apps/web
pnpm install
pnpm dev

# Tests
pytest
pnpm test
```

## ⚡ Performance

1. **Cache Strategy**:
   - GET requests: 5 min cache
   - User data: 1 min cache
   - AI responses: 1 hour cache

2. **Database**:
   - Índices em foreign keys
   - Soft delete sempre
   - Paginação obrigatória

3. **AI Optimization**:
   - Router inteligente por complexidade
   - Fallback para modelos mais baratos
   - Cache de embeddings

## 🧠 Vector Database - Quantização de Usuários no Qdrant

### Arquitetura de Embeddings
```python
# models/user_embedding.py
from pydantic import BaseModel
from typing import List, Dict, Any

class UserEmbedding(BaseModel):
    user_id: str
    organization_id: str
    embedding_vector: List[float]  # 1536 dims (OpenAI ada-002)
    metadata: Dict[str, Any] = {
        "conversation_count": 0,
        "last_interaction": None,
        "preferences": {},
        "behavior_patterns": [],
        "conversion_score": 0.0
    }
```

### Pipeline de Quantização
```python
# workers/embedding_tasks.py
@celery_app.task(queue='embeddings')
async def quantize_user_data(user_id: str):
    """
    Pipeline para transformar dados do usuário em embeddings
    """
    # 1. Coletar dados históricos
    user_data = await collect_user_history(user_id)
    
    # 2. Preparar texto para embedding
    embedding_text = prepare_embedding_text(user_data)
    
    # 3. Gerar embedding via OpenAI
    embedding = await generate_embedding(embedding_text)
    
    # 4. Armazenar no Qdrant
    await qdrant_client.upsert(
        collection_name="user_profiles",
        points=[{
            "id": user_id,
            "vector": embedding,
            "payload": user_data.metadata
        }]
    )
```

### Estratégia de Sincronização
1. **Real-time Updates**: Após cada conversa finalizada
2. **Batch Processing**: Job diário para re-embeddings
3. **Incremental Updates**: Apenas dados novos são processados

### Coleções no Qdrant
```yaml
collections:
  user_profiles:
    size: 1536  # OpenAI ada-002
    distance: Cosine
    hnsw_config:
      m: 16
      ef_construct: 100
      
  conversation_contexts:
    size: 768   # Sentence transformers
    distance: Cosine
    
  product_embeddings:
    size: 1536
    distance: Cosine
```

## 🚦 AI Router - Sistema Inteligente de Roteamento

### Arquitetura do Router
```python
# services/ai_router.py
from enum import Enum
from typing import Dict, Tuple

class ModelTier(Enum):
    TIER_1 = "fast"      # Llama 3.2, Gemini Nano
    TIER_2 = "balanced"  # Claude Haiku, GPT-3.5
    TIER_3 = "advanced"  # Claude Sonnet, GPT-4-mini
    TIER_4 = "premium"   # Claude Opus, GPT-4

class AIRouter:
    def __init__(self):
        self.intent_classifier = load_intent_model()
        self.complexity_analyzer = load_complexity_model()
        
    async def route_message(
        self, 
        message: str,
        context: Dict,
        user_profile: UserEmbedding
    ) -> Tuple[ModelTier, str]:
        """
        Analisa mensagem e contexto para determinar o tier ideal
        """
        # 1. Classificação de intenção
        intent = await self.classify_intent(message)
        
        # 2. Análise de complexidade
        complexity = await self.analyze_complexity(message, context)
        
        # 3. Perfil do usuário (valor, histórico)
        user_value = user_profile.metadata.get('lifetime_value', 0)
        
        # 4. Decisão de roteamento
        if intent in ['greeting', 'faq', 'simple_info']:
            return ModelTier.TIER_1, "llama-3.2-3b"
            
        elif intent in ['product_query', 'support_basic']:
            if user_value > 1000:  # Cliente valioso
                return ModelTier.TIER_2, "claude-3-haiku"
            return ModelTier.TIER_1, "gemini-1.5-flash"
            
        elif intent in ['technical_support', 'complex_query']:
            return ModelTier.TIER_3, "claude-3-sonnet"
            
        elif intent in ['sales_negotiation', 'high_value_lead']:
            return ModelTier.TIER_4, "claude-3-opus"
```

### Configuração no LiteLLM
```yaml
# litellm_config.yaml
model_list:
  # Tier 1 - Respostas Rápidas
  - model_name: "tier1-llama"
    litellm_params:
      model: "together_ai/Meta-Llama-3.2-3B-Instruct-Turbo"
      api_key: ${TOGETHER_API_KEY}
      max_tokens: 150
      temperature: 0.7
      
  - model_name: "tier1-gemini"
    litellm_params:
      model: "gemini/gemini-1.5-flash"
      api_key: ${GOOGLE_API_KEY}
      max_tokens: 200
      
  # Tier 2 - Consultas Balanceadas
  - model_name: "tier2-haiku"
    litellm_params:
      model: "claude-3-haiku-20240307"
      api_key: ${ANTHROPIC_API_KEY}
      max_tokens: 500
      
  # Tier 3 - Suporte Avançado
  - model_name: "tier3-sonnet"
    litellm_params:
      model: "claude-3-5-sonnet-20241022"
      api_key: ${ANTHROPIC_API_KEY}
      max_tokens: 1000
      
  # Tier 4 - Decisões Críticas
  - model_name: "tier4-opus"
    litellm_params:
      model: "claude-3-opus-20240229"
      api_key: ${ANTHROPIC_API_KEY}
      max_tokens: 2000

router_settings:
  routing_strategy: "smart-intent"
  fallback_model: "tier1-llama"
  timeout_seconds: 30
  retry_policy:
    max_retries: 3
    backoff_factor: 2
```

### Métricas e Otimização
```python
# services/router_analytics.py
class RouterAnalytics:
    async def track_routing_decision(
        self,
        message_id: str,
        tier_selected: ModelTier,
        model_used: str,
        response_time: float,
        token_count: int,
        cost_estimate: float
    ):
        """
        Rastreia decisões do router para otimização contínua
        """
        await redis_client.hincrby(
            f"router:stats:{tier_selected.value}",
            "total_requests"
        )
        
        # Armazena para análise posterior
        await postgres_client.execute(
            """
            INSERT INTO routing_analytics 
            (message_id, tier, model, response_time, tokens, cost)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            message_id, tier_selected.value, model_used,
            response_time, token_count, cost_estimate
        )
```

### Economia Projetada
- **Tier 1**: 70% das mensagens → $0.006/1k tokens
- **Tier 2**: 20% das mensagens → $0.25/1k tokens  
- **Tier 3**: 8% das mensagens → $1.50/1k tokens
- **Tier 4**: 2% das mensagens → $15/1k tokens

**Economia média**: 85% comparado a usar GPT-4 para tudo

## 🎯 Checklist de Feature Nova

- [ ] Criar Pydantic models
- [ ] Implementar service layer
- [ ] Criar rotas FastAPI
- [ ] Adicionar testes
- [ ] Criar Celery task se necessário
- [ ] Atualizar Gateway routes
- [ ] Implementar frontend
- [ ] Adicionar ao Jarvis analytics
- [ ] Documentar no OpenAPI
- [ ] Configurar embeddings se necessário
- [ ] Ajustar AI Router para novo caso de uso

---

**IMPORTANTE**: Este arquivo é a fonte da verdade para arquitetura. 
Em caso de dúvida, siga o que está aqui definido.
