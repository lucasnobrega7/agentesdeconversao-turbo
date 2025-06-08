# 🤖 Integração LiteLLM - Agentes de Conversão

Este documento descreve a implementação completa do LiteLLM como gateway centralizado de LLMs no projeto.

## 📋 Visão Geral

O LiteLLM atua como gateway unificado para todos os modelos de IA, oferecendo:

- **Roteamento Inteligente**: Seleção automática de modelos baseada em complexidade, contexto e valor do cliente
- **Fallback Automático**: Migração transparente entre modelos em caso de falha
- **Cache Inteligente**: Respostas frequentes armazenadas em Redis
- **Controle de Custos**: Tracking detalhado por organização e modelo
- **Streaming**: Suporte nativo para respostas em tempo real

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Gateway    │────▶│  Backend API    │
│   (Next.js)     │     │   (Gateway)      │     │  (FastAPI)      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                        ┌──────────────────────────────────┴──────────┐
                        │                                             │
                        ▼                                             ▼
              ┌─────────────────┐                          ┌──────────────────┐
              │  LiteLLM Gateway│                          │  Knowledge Base  │
              │   (Port 4000)   │                          │    (Qdrant)      │
              └────────┬────────┘                          └──────────────────┘
                       │
         ┌─────────────┼──────────────┬────────────────┐
         ▼             ▼              ▼                ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐    ┌──────────┐
   │ Claude   │  │  OpenAI  │  │  Gemini  │    │  Llama   │
   └──────────┘  └──────────┘  └──────────┘    └──────────┘
```

## 🚀 Configuração

### 1. Variáveis de Ambiente

```env
# LiteLLM
LITELLM_MASTER_KEY=sk-master-production-key
LITELLM_DATABASE_URL=postgresql://...

# Provedores de IA
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
TOGETHER_API_KEY=...
GROQ_API_KEY=gsk_...

# Redis
REDIS_URL=redis://localhost:6379
```

### 2. Configuração de Modelos

O arquivo `config/litellm_config.yaml` define os tiers de modelos:

- **Tier 1**: Modelos rápidos para queries simples (Llama 3.2 3B, Gemini Flash)
- **Tier 2**: Modelos balanceados (Claude Haiku, GPT-3.5)
- **Tier 3**: Modelos avançados (Claude Sonnet, GPT-4)
- **Tier 4**: Modelos premium (Claude Opus, GPT-4 Turbo)

## 🔧 Componentes Implementados

### 1. AI Service (`ai_service.py`)
- Interface unificada para chamadas ao LiteLLM
- Suporte a streaming e respostas normais
- Análise de conversas e geração de insights

### 2. AI Router (`ai_router.py`)
- Análise de complexidade de mensagens
- Detecção automática de intent
- Roteamento baseado em regras e contexto
- Consideração de valor do cliente (VIP)

### 3. Knowledge Service (`knowledge_service.py`)
- Integração com Qdrant para busca vetorial
- Geração de embeddings via LiteLLM
- Cache de resultados de busca

### 4. Cache Service (`cache_service.py`)
- Cache de respostas de IA
- Tracking de uso e métricas
- Rate limiting por organização

### 5. Celery Workers
- **ai_tasks.py**: Processamento assíncrono de conversas
- **analytics_tasks.py**: Coleta de métricas e análise com Jarvis
- **knowledge_tasks.py**: Processamento de documentos
- **notification_tasks.py**: Envio de alertas e relatórios

## 📊 Métricas e Monitoramento

### Métricas Prometheus Expostas

- `llm_requests_total`: Total de requisições por modelo/tier
- `llm_tokens_total`: Tokens processados
- `llm_latency_seconds`: Latência das requisições
- `llm_cost_total`: Custo acumulado
- `llm_active_requests`: Requisições em andamento

### Analytics Dashboard

```python
# Exemplo de uso das métricas
GET /ai/usage?start_date=2024-01-01&end_date=2024-01-31

{
  "organization_id": "org_123",
  "summary": {
    "total_cost": 125.43,
    "total_tokens": 1234567,
    "total_requests": 5432
  },
  "by_model": {
    "tier1/llama-3.2-3b": {
      "requests": 3000,
      "tokens": 500000,
      "cost": 5.00
    },
    "tier3/claude-sonnet": {
      "requests": 1000,
      "tokens": 400000,
      "cost": 80.00
    }
  }
}
```

## 🔄 Fluxo de Requisição

1. **Frontend** envia mensagem para API
2. **Backend** analisa contexto e histórico
3. **AI Router** determina complexidade e tier apropriado
4. **Knowledge Service** busca contexto relevante (se configurado)
5. **Cache Service** verifica se existe resposta em cache
6. **LiteLLM Gateway** roteia para modelo apropriado
7. **Fallback** automático se modelo falhar
8. **Response** retorna ao usuário (streaming ou normal)
9. **Analytics** registra métricas em background

## 🧪 Testando a Integração

### Script de Teste Completo

```bash
# Executar todos os testes
python scripts/test_litellm.py

# Testes incluem:
# - Health check
# - Listagem de modelos
# - Chat completion (todos os tiers)
# - Streaming
# - Roteamento inteligente
# - Estatísticas de uso
```

### Teste Manual via cURL

```bash
# Testar chat completion
curl -X POST http://localhost:4000/ai/chat/completions \
  -H "Authorization: Bearer sk-master-dev" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Olá!"}
    ],
    "metadata": {
      "organization_id": "org_123"
    }
  }'
```

## 🐛 Troubleshooting

### Problema: Modelos não respondem
```bash
# Verificar status do LiteLLM
curl http://localhost:4000/health

# Verificar logs
docker-compose logs litellm
```

### Problema: Alto custo inesperado
```python
# Verificar roteamento
GET /api/conversations/analytics/models

# Ajustar regras em ai_router.py
```

### Problema: Cache não funciona
```bash
# Verificar Redis
redis-cli ping

# Limpar cache
redis-cli FLUSHDB
```

## 📈 Otimizações Futuras

1. **Model Fine-tuning**: Treinar modelos específicos por vertical
2. **A/B Testing**: Testar diferentes modelos para mesmas queries
3. **Predictive Routing**: ML para prever melhor modelo
4. **Cost Optimization**: Análise automática de custo/benefício
5. **Multi-region**: Deploy distribuído para menor latência

## 🔒 Segurança

- Todas as chaves de API em variáveis de ambiente
- Rate limiting por organização e plano
- Sanitização de prompts antes de envio
- Audit trail completo de todas requisições
- Criptografia de dados sensíveis em cache

## 📚 Referências

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Google Gemini API](https://ai.google.dev/)
