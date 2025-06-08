# 🏗️ Arquitetura LiteLLM - Agentes de Conversão

```mermaid
graph TB
    %% Frontend Layer
    subgraph "Frontend Layer"
        WEB[Next.js App<br/>:3000]
        CHAT[Chat Interface<br/>com Streaming]
    end
    
    %% Gateway Layer
    subgraph "Gateway Layer"
        GW[API Gateway<br/>:8080]
        AUTH[Auth Middleware]
        RL[Rate Limiter]
    end
    
    %% Backend Layer
    subgraph "Backend Services"
        API[FastAPI Backend<br/>:8000]
        
        subgraph "AI Services"
            AIS[AI Service]
            AIR[AI Router]
            CS[Cache Service]
        end
        
        subgraph "Knowledge Services"
            KS[Knowledge Service]
            QD[(Qdrant<br/>Vector DB)]
        end
    end
    
    %% LiteLLM Layer
    subgraph "LiteLLM Gateway [:4000]"
        LLM[LiteLLM Router]
        
        subgraph "Model Tiers"
            T1[Tier 1<br/>Fast Models]
            T2[Tier 2<br/>Balanced]
            T3[Tier 3<br/>Advanced]
            T4[Tier 4<br/>Premium]
        end
        
        CACHE[(Redis Cache)]
        METRICS[Prometheus<br/>Metrics]
    end
    
    %% AI Providers
    subgraph "AI Providers"
        subgraph "Tier 1"
            LLAMA[Llama 3.2]
            GEMINI[Gemini Flash]
        end
        
        subgraph "Tier 2"
            HAIKU[Claude Haiku]
            GPT35[GPT-3.5]
        end
        
        subgraph "Tier 3"
            SONNET[Claude Sonnet]
            GPT4[GPT-4]
        end
        
        subgraph "Tier 4"
            OPUS[Claude Opus]
            GPT4T[GPT-4 Turbo]
        end
    end
    
    %% Workers
    subgraph "Background Workers"
        CW[Celery Workers]
        JW[Jarvis Analytics]
        CB[Celery Beat]
    end
    
    %% Data Layer
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Supabase)]
        RD[(Redis)]
    end
    
    %% Connections
    WEB --> CHAT
    CHAT --> GW
    GW --> AUTH
    AUTH --> RL
    RL --> API
    
    API --> AIS
    AIS --> AIR
    AIR --> LLM
    AIS --> CS
    CS --> CACHE
    
    API --> KS
    KS --> QD
    
    LLM --> T1
    LLM --> T2
    LLM --> T3
    LLM --> T4
    
    T1 --> LLAMA
    T1 --> GEMINI
    T2 --> HAIKU
    T2 --> GPT35
    T3 --> SONNET
    T3 --> GPT4
    T4 --> OPUS
    T4 --> GPT4T
    
    LLM --> CACHE
    LLM --> METRICS
    
    API --> CW
    CW --> JW
    CW --> CB
    
    API --> PG
    API --> RD
    CW --> RD
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef gateway fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef backend fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef litellm fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef ai fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef data fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    classDef worker fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class WEB,CHAT frontend
    class GW,AUTH,RL gateway
    class API,AIS,AIR,CS,KS backend
    class LLM,T1,T2,T3,T4,CACHE,METRICS litellm
    class LLAMA,GEMINI,HAIKU,GPT35,SONNET,GPT4,OPUS,GPT4T ai
    class PG,RD,QD data
    class CW,JW,CB worker
```

## 🔄 Fluxo de Dados

### 1. **Requisição de Chat**
```
User → Frontend → Gateway → Backend → AI Router → LiteLLM → AI Provider
```

### 2. **Roteamento Inteligente**
```
Message → Complexity Analysis → Intent Detection → User Value Check → Tier Selection
```

### 3. **Fallback Chain**
```
Primary Model → Fallback 1 → Fallback 2 → Default Response
```

### 4. **Cache Flow**
```
Request → Check Cache → Hit? Return : Process → Store in Cache → Return
```

## 📊 Decisão de Roteamento

```mermaid
flowchart TD
    MSG[Nova Mensagem] --> COMPLEX{Complexidade?}
    
    COMPLEX -->|Baixa| INTENT1{Intent?}
    COMPLEX -->|Média| INTENT2{Intent?}
    COMPLEX -->|Alta| INTENT3{Intent?}
    
    INTENT1 -->|Greeting/FAQ| T1[Tier 1]
    INTENT1 -->|Other| VIP1{VIP?}
    
    INTENT2 -->|Product/Support| VIP2{VIP?}
    INTENT2 -->|Technical| T3[Tier 3]
    
    INTENT3 -->|Any| VIP3{VIP?}
    
    VIP1 -->|Yes| T2[Tier 2]
    VIP1 -->|No| T1
    
    VIP2 -->|Yes| T3
    VIP2 -->|No| T2
    
    VIP3 -->|Yes| T4[Tier 4]
    VIP3 -->|No| T3
    
    T1 --> MODEL1[Llama/Gemini]
    T2 --> MODEL2[Haiku/GPT-3.5]
    T3 --> MODEL3[Sonnet/GPT-4]
    T4 --> MODEL4[Opus/GPT-4T]
```

## 💾 Cache Strategy

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant C as Cache
    participant L as LiteLLM
    participant M as AI Model
    
    U->>A: Send Message
    A->>C: Check Cache
    
    alt Cache Hit
        C-->>A: Return Cached Response
        A-->>U: Return Response
    else Cache Miss
        A->>L: Forward Request
        L->>M: Call AI Model
        M-->>L: Model Response
        L-->>A: Return Response
        A->>C: Store in Cache
        A-->>U: Return Response
    end
```

## 🎯 Key Features

### Intelligent Routing
- **Complexity Analysis**: Word count, technical terms, code detection
- **Intent Classification**: Greeting, FAQ, support, sales, technical
- **User Segmentation**: Standard, VIP, Enterprise
- **Cost Optimization**: Route to cheapest capable model

### Reliability
- **Automatic Fallback**: Seamless failover between models
- **Circuit Breaker**: Prevent cascade failures
- **Health Checks**: Continuous monitoring
- **Request Retry**: With exponential backoff

### Performance
- **Response Caching**: TTL-based caching
- **Connection Pooling**: Reuse HTTP connections
- **Async Processing**: Non-blocking operations
- **Stream Support**: Real-time responses

### Observability
- **Prometheus Metrics**: Request count, latency, tokens, cost
- **Structured Logging**: JSON logs with context
- **Distributed Tracing**: Request flow tracking
- **Cost Analytics**: Real-time spend monitoring

## 🚀 Deployment Ready

The implementation is production-ready with:
- ✅ Docker containerization
- ✅ Environment-based configuration
- ✅ Horizontal scaling support
- ✅ Security best practices
- ✅ Comprehensive monitoring
- ✅ Automated testing
- ✅ CI/CD integration
- ✅ Documentation
