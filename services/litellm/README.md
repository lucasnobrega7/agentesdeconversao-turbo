# LiteLLM Gateway Service

O LiteLLM Gateway é o serviço centralizado para gerenciamento de modelos de IA no projeto Agentes de Conversão.

## 🎯 Funcionalidades

### Roteamento Inteligente por Tiers

O gateway classifica e roteia requisições para diferentes modelos baseado em:

1. **Complexidade da mensagem** - Análise automática do conteúdo
2. **Intenção detectada** - Classificação do tipo de interação
3. **Valor do cliente** - VIPs recebem modelos superiores
4. **Plano da organização** - Limites por tier de assinatura

### Tiers de Modelos

- **Tier 1 (Fast)**: Llama 3.2 3B, Gemini Flash - Para saudações, FAQ, queries simples
- **Tier 2 (Balanced)**: Claude Haiku, GPT-3.5 - Para suporte básico, consultas de produto
- **Tier 3 (Advanced)**: Claude Sonnet, GPT-4 - Para suporte técnico, queries complexas
- **Tier 4 (Premium)**: Claude Opus, GPT-4 Turbo - Para negociações, leads high-value

### Features

- ✅ Fallback automático entre modelos
- ✅ Cache Redis para respostas frequentes
- ✅ Streaming de respostas
- ✅ Métricas Prometheus
- ✅ Rate limiting por organização
- ✅ Cost tracking em tempo real
- ✅ Retry logic com backoff exponencial

## 🚀 Uso

### Endpoint Principal

```bash
POST /ai/chat/completions
Authorization: Bearer {LITELLM_API_KEY}

{
  "messages": [
    {"role": "system", "content": "Você é um assistente útil"},
    {"role": "user", "content": "Olá!"}
  ],
  "metadata": {
    "organization_id": "org_123",
    "user_id": "user_456",
    "conversation_id": "conv_789",
    "intent": "greeting"
  },
  "stream": false
}
```

### Streaming

```javascript
const response = await fetch('/ai/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-master-key'
  },
  body: JSON.stringify({
    messages: [...],
    stream: true
  })
});

const reader = response.body.getReader();
// Process streaming chunks...
```

### Listar Modelos

```bash
GET /ai/models
Authorization: Bearer {LITELLM_API_KEY}
```

### Analytics de Uso

```bash
GET /ai/usage?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {LITELLM_API_KEY}
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Chaves dos Provedores
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
TOGETHER_API_KEY=...
GROQ_API_KEY=gsk_...

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=...

# Master Key
LITELLM_MASTER_KEY=sk-master-production
```

### Arquivo de Configuração

O arquivo `config/litellm_config.yaml` define:

1. Lista de modelos disponíveis
2. Configurações de fallback
3. Limites de rate
4. Regras de roteamento
5. Callbacks de monitoramento

## 📊 Métricas

O serviço expõe métricas Prometheus em `/metrics`:

- `llm_requests_total` - Total de requisições por modelo/tier/status
- `llm_tokens_total` - Tokens processados (prompt/completion)
- `llm_latency_seconds` - Latência das requisições
- `llm_cost_total` - Custo acumulado por organização
- `llm_active_requests` - Requisições em andamento

## 🛡️ Segurança

1. **Autenticação**: Bearer token obrigatório
2. **Rate Limiting**: Configurável por organização/plano
3. **Input Validation**: Sanitização de prompts
4. **Cost Control**: Limites de gastos por organização
5. **Audit Trail**: Todas requisições são logadas

## 🔄 Fallback Strategy

```yaml
fallbacks:
  tier4/claude-opus: ["tier4/gpt-4-turbo", "tier3/claude-sonnet"]
  tier3/claude-sonnet: ["tier3/gpt-4", "tier2/claude-haiku"]
  tier2/claude-haiku: ["tier2/gpt-3.5-turbo", "tier1/llama-3.2-3b"]
  tier1/llama-3.2-3b: ["tier1/gemini-flash"]
```

## 🐛 Troubleshooting

### Erro 503 - Service Unavailable
- Verificar se o modelo está disponível
- Checar limites de rate
- Verificar chaves de API

### Streaming não funciona
- Confirmar que o cliente suporta SSE
- Verificar proxy/nginx buffering
- Testar com `stream: false` primeiro

### Alto custo inesperado
- Revisar logs de roteamento
- Verificar se VIPs estão configurados corretamente
- Analisar métricas de uso por modelo

## 📚 Exemplos

### Python

```python
import httpx
import json

async def chat_with_litellm():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:4000/ai/chat/completions",
            headers={
                "Authorization": "Bearer sk-master-key",
                "Content-Type": "application/json"
            },
            json={
                "messages": [
                    {"role": "user", "content": "Olá!"}
                ],
                "metadata": {
                    "organization_id": "org_123"
                }
            }
        )
        return response.json()
```

### Node.js

```javascript
const response = await fetch('http://localhost:4000/ai/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-master-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Olá!' }
    ],
    metadata: {
      organization_id: 'org_123'
    }
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```
