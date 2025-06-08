# 📋 Guia de Implementação - Agentes de Conversão (Turborepo)

Este documento fornece instruções detalhadas para completar as funcionalidades do projeto, aproveitando a estrutura Turborepo.

## 🏗️ Estrutura Turborepo

### Configuração Base

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
```

```json
# turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Pacotes Compartilhados

```bash
# Criar estrutura de pacotes compartilhados
mkdir -p packages/{types,config,utils,ui}
```

#### @agentes/types - Tipos TypeScript Compartilhados

```typescript
// packages/types/src/index.ts
export * from './auth';
export * from './agent';
export * from './organization';
export * from './conversation';
export * from './billing';

// packages/types/src/organization.ts
export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  stripeCustomerId?: string;
  plan: PlanType;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBase {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  config: KnowledgeBaseConfig;
}

// packages/types/src/agent.ts
export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  prompt: string;
  knowledgeBaseId?: string;
  flowId?: string;
  config: AgentConfig;
}

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'condition' | 'action' | 'tool' | 'end';
  position: { x: number; y: number };
  data: Record<string, any>;
}
```

#### @agentes/config - Configurações Compartilhadas

```typescript
// packages/config/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  
  // AI Models
  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  TOGETHER_API_KEY: z.string().optional(),
  
  // Services
  REDIS_URL: z.string(),
  QDRANT_HOST: z.string(),
  EVOLUTION_API_URL: z.string(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);

// packages/config/src/constants.ts
export const AI_MODELS = {
  TIER_1: {
    DEFAULT: 'together_ai/Meta-Llama-3.2-3B-Instruct-Turbo',
    ALTERNATIVES: ['gemini/gemini-1.5-flash'],
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
  },
  TIER_2: {
    DEFAULT: 'claude-3-haiku-20240307',
    ALTERNATIVES: ['gpt-3.5-turbo'],
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.5,
  },
  TIER_3: {
    DEFAULT: 'claude-3-5-sonnet-20241022',
    ALTERNATIVES: ['gpt-4'],
    MAX_TOKENS: 8192,
    TEMPERATURE: 0.3,
  },
  TIER_4: {
    DEFAULT: 'claude-3-opus-20240229',
    ALTERNATIVES: ['gpt-4-turbo'],
    MAX_TOKENS: 16384,
    TEMPERATURE: 0.2,
  },
} as const;
```

#### @agentes/utils - Utilitários Compartilhados

```typescript
// packages/utils/src/api-client.ts
import type { Agent, Organization, KnowledgeBase } from '@agentes/types';

export class AgentesAPIClient {
  constructor(private apiUrl: string, private authToken?: string) {}
  
  async getOrganization(id: string): Promise<Organization> {
    const res = await fetch(`${this.apiUrl}/organizations/${id}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }
  
  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${this.apiUrl}/agents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
    };
  }
}
```

## 🔐 1. Sistema de Autenticação e Multi-tenancy com Supabase

### 1.1 Configuração do Workspace

```bash
# Instalar dependências no workspace correto
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs -w apps/web
pnpm add supabase -w services/api
```

### 1.2 Auth Provider Compartilhado

```typescript
// packages/utils/src/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@agentes/config';

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// packages/utils/src/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### 1.3 Hooks React Compartilhados

```typescript
// packages/ui/src/hooks/use-auth.ts
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@agentes/utils/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { user, loading, supabase };
}
```

### 1.4 Middleware FastAPI com Dependency Injection

```python
# services/api/app/core/dependencies.py
from typing import Annotated
from fastapi import Depends, HTTPException
from supabase import Client
from app.core.supabase import get_supabase_client
from app.types.auth import CurrentUser

async def get_current_user(
    supabase: Annotated[Client, Depends(get_supabase_client)],
    authorization: str = Header(None)
) -> CurrentUser:
    """Dependency para obter usuário atual"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(401, "Invalid token")
        
        # Buscar dados da organização
        org_data = await get_user_organization(user.id)
        
        return CurrentUser(
            id=user.id,
            email=user.email,
            organization_id=org_data.id,
            organization=org_data
        )
    except Exception as e:
        raise HTTPException(401, str(e))
```

## 📚 2. Base de Conhecimento por Organização

### 2.1 Package de Processamento de Documentos

```typescript
// packages/utils/src/document-processor.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';

export class DocumentProcessor {
  private splitter: RecursiveCharacterTextSplitter;
  
  constructor(chunkSize = 1000, chunkOverlap = 200) {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
  }
  
  async processFile(content: string, metadata: Record<string, any>) {
    const docs = await this.splitter.createDocuments([content]);
    return docs.map(doc => ({
      ...doc,
      metadata: { ...doc.metadata, ...metadata },
    }));
  }
}
```

### 2.2 API Routes com FastAPI

```python
# services/api/app/api/v1/knowledge.py
from typing import Annotated
from fastapi import APIRouter, UploadFile, File, Depends
from app.core.dependencies import get_current_user
from app.services.knowledge_service import KnowledgeService
from app.types.auth import CurrentUser

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    knowledge_base_id: str = Form(...),
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    knowledge_service: Annotated[KnowledgeService, Depends()]
):
    """Upload e processa documento"""
    
    # Validar permissão
    kb = await knowledge_service.get_knowledge_base(
        knowledge_base_id, 
        current_user.organization_id
    )
    
    if not kb:
        raise HTTPException(404, "Knowledge base not found")
    
    # Processar arquivo
    result = await knowledge_service.process_document(
        file=file,
        knowledge_base_id=knowledge_base_id,
        organization_id=current_user.organization_id
    )
    
    return result
```

## 🔌 3. Integração com MCPs (Packages Compartilhados)

### 3.1 MCP Types Package

```typescript
// packages/types/src/mcp.ts
export interface MCPConfig {
  name: string;
  baseUrl: string;
  authToken?: string;
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MCPRequest {
  tool: string;
  params: Record<string, any>;
  context?: Record<string, any>;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 3.2 MCP Client Package

```typescript
// packages/utils/src/mcp-client.ts
import type { MCPConfig, MCPRequest, MCPResponse } from '@agentes/types';

export class MCPClient {
  constructor(private config: MCPConfig) {}
  
  async callTool<T = any>(
    toolName: string,
    params: Record<string, any>
  ): Promise<MCPResponse<T>> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/tools/${toolName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.authToken && {
              Authorization: `Bearer ${this.config.authToken}`,
            }),
          },
          body: JSON.stringify({ params }),
        }
      );
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

## 🎨 4. AgentStudio - Editor Visual (UI Package)

### 4.1 UI Components Package

```typescript
// packages/ui/src/components/flow-editor/index.tsx
import React from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import type { FlowData } from '@agentes/types';
import { nodeTypes } from './nodes';
import 'reactflow/dist/style.css';

interface FlowEditorProps {
  flow: FlowData;
  onSave: (flow: FlowData) => Promise<void>;
  readonly?: boolean;
}

export function FlowEditor({ flow, onSave, readonly }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readonly ? undefined : onNodesChange}
          onEdgesChange={readonly ? undefined : onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
```

### 4.2 Node Components Library

```typescript
// packages/ui/src/components/flow-editor/nodes/base-node.tsx
import { Handle, Position } from 'reactflow';
import { cn } from '@agentes/utils/cn';

interface BaseNodeProps {
  data: any;
  selected?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}

export function BaseNode({ 
  data, 
  selected, 
  children, 
  icon,
  className 
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 shadow-md rounded-md bg-white border-2',
        selected ? 'border-primary' : 'border-gray-300',
        className
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
      />
      
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex-1">
          <div className="text-lg font-bold">{data.label}</div>
          {children}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
      />
    </div>
  );
}
```

## 📱 5. WhatsApp Service Package

### 5.1 Evolution API Client

```typescript
// packages/utils/src/evolution-client.ts
import { env } from '@agentes/config';

export interface WhatsAppInstance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending_qr';
  qrCode?: string;
}

export class EvolutionClient {
  private baseUrl: string;
  
  constructor(apiUrl?: string) {
    this.baseUrl = apiUrl || env.EVOLUTION_API_URL;
  }
  
  async createInstance(
    instanceName: string,
    webhookUrl: string
  ): Promise<WhatsAppInstance> {
    const response = await fetch(`${this.baseUrl}/instance/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
        webhookUrl,
      }),
    });
    
    return response.json();
  }
  
  async sendMessage(
    instanceId: string,
    to: string,
    message: string
  ): Promise<void> {
    await fetch(`${this.baseUrl}/message/sendText/${instanceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: to,
        text: message,
      }),
    });
  }
}
```

## 🧠 6. Sistema de Embeddings (Vector Package)

### 6.1 Vector Store Abstraction

```typescript
// packages/utils/src/vector-store.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '@agentes/config';

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export class VectorStore {
  private client: QdrantClient;
  
  constructor() {
    this.client = new QdrantClient({
      host: env.QDRANT_HOST,
      port: 6333,
    });
  }
  
  async createCollection(name: string, vectorSize: number) {
    await this.client.createCollection(name, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine',
      },
    });
  }
  
  async upsert(
    collection: string,
    documents: VectorDocument[]
  ) {
    const points = documents.map(doc => ({
      id: doc.id,
      vector: doc.embedding!,
      payload: {
        content: doc.content,
        ...doc.metadata,
      },
    }));
    
    await this.client.upsert(collection, { points });
  }
  
  async search(
    collection: string,
    query: number[],
    limit = 5
  ) {
    return this.client.search(collection, {
      vector: query,
      limit,
      with_payload: true,
    });
  }
}
```

## 🤖 7. AI Router Package

### 7.1 AI Router com Configuração Centralizada

```typescript
// packages/utils/src/ai-router.ts
import { AI_MODELS } from '@agentes/config';
import type { ModelTier, AIConfig } from '@agentes/types';

export class AIRouter {
  async routeMessage(params: {
    message: string;
    context: Record<string, any>;
    userValue: number;
  }): Promise<AIConfig> {
    const complexity = await this.analyzeComplexity(params.message);
    const isVIP = params.userValue > 1000;
    
    // Lógica de roteamento
    let tier: ModelTier;
    
    if (complexity < 0.3 && !isVIP) {
      tier = 'TIER_1';
    } else if (complexity < 0.6) {
      tier = isVIP ? 'TIER_3' : 'TIER_2';
    } else {
      tier = 'TIER_4';
    }
    
    const config = AI_MODELS[tier];
    
    return {
      model: config.DEFAULT,
      alternatives: config.ALTERNATIVES,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMPERATURE,
    };
  }
  
  private async analyzeComplexity(message: string): Promise<number> {
    // Implementar análise de complexidade
    const wordCount = message.split(' ').length;
    const hasQuestions = /\?/.test(message);
    const hasTechnicalTerms = /API|database|error|bug/i.test(message);
    
    let score = 0;
    if (wordCount > 50) score += 0.3;
    if (hasQuestions) score += 0.2;
    if (hasTechnicalTerms) score += 0.3;
    
    return Math.min(score, 1);
  }
}
```

## 💰 8. Billing Package

### 8.1 Stripe Client Compartilhado

```typescript
// packages/utils/src/stripe-client.ts
import Stripe from 'stripe';
import { env } from '@agentes/config';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export class BillingClient {
  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    return stripe.checkout.sessions.create({
      customer: params.customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });
  }
  
  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  }
}
```

## 📊 9. Analytics Package

### 9.1 Metrics Collector

```typescript
// packages/utils/src/analytics/metrics.ts
export class MetricsCollector {
  async collectDailyMetrics(organizationId: string) {
    const [
      conversations,
      messages,
      aiUsage,
      conversion,
    ] = await Promise.all([
      this.getConversationMetrics(organizationId),
      this.getMessageMetrics(organizationId),
      this.getAIUsageMetrics(organizationId),
      this.getConversionMetrics(organizationId),
    ]);
    
    return {
      date: new Date().toISOString(),
      organizationId,
      conversations,
      messages,
      aiUsage,
      conversion,
    };
  }
  
  private async getConversationMetrics(organizationId: string) {
    // Implementar coleta de métricas
    return {
      total: 0,
      completed: 0,
      abandoned: 0,
    };
  }
}
```

## 🚀 10. Deploy Otimizado com Turborepo

### 10.1 Scripts do Root Package.json

```json
{
  "name": "agentes-conversao",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "start": "turbo start",
    "lint": "turbo lint",
    "test": "turbo test",
    "type-check": "turbo type-check",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo build --filter=./packages/* && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.2",
    "prettier": "^3.0.3",
    "turbo": "latest"
  },
  "packageManager": "pnpm@8.6.10"
}
```

### 10.2 Docker Compose para Desenvolvimento

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agentes
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  evolution:
    image: evolutionapi/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/evolution

volumes:
  postgres_data:
  qdrant_data:
```

### 10.3 GitHub Actions com Cache Turborepo

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Setup Turbo Cache
        uses: actions/cache@v3
        with:
          path: .turbo
          key: turbo-${{ runner.os }}-${{ github.sha }}
          restore-keys: |
            turbo-${{ runner.os }}-
            
      - name: Run CI
        run: |
          pnpm lint
          pnpm type-check
          pnpm test
          pnpm build
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: |
            apps/*/dist
            apps/*/.next
            services/*/dist

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Preview
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npx vercel --token=$VERCEL_TOKEN --yes
```

### 10.4 Railway Deploy com Monorepo

```yaml
# railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build --filter=api"
  },
  "deploy": {
    "startCommand": "pnpm --filter=api start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  },
  "environments": {
    "production": {
      "build": {
        "cacheMount": "/root/.pnpm-store"
      }
    }
  }
}
```

## 📦 Estrutura Final do Projeto

```
agentes-conversao/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/
│       ├── public/
│       └── package.json
├── services/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   ├── requirements.txt
│   │   └── pyproject.toml
│   └── worker/                 # Celery workers
│       ├── tasks/
│       └── package.json
├── packages/
│   ├── types/                  # TypeScript types
│   ├── config/                 # Shared configuration
│   ├── utils/                  # Shared utilities
│   └── ui/                     # Shared UI components
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── docker-compose.dev.yml
└── README.md
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                        # Inicia todos os serviços
pnpm dev --filter=web          # Inicia apenas o frontend
pnpm dev --filter=api          # Inicia apenas a API

# Build
pnpm build                      # Build de todos os pacotes
pnpm build --filter=@agentes/* # Build apenas dos packages

# Testes
pnpm test                       # Roda todos os testes
pnpm test:watch                # Testes em modo watch

# Linting e Formatação
pnpm lint                       # Lint em todos os pacotes
pnpm format                     # Formata todo o código

# Gerenciamento de Pacotes
pnpm add lodash -w apps/web    # Adiciona dep ao workspace
pnpm add express -w services/api

# Publicação
pnpm changeset                  # Cria um changeset
pnpm version-packages          # Versiona pacotes
pnpm release                   # Publica no npm
```

## 📚 Recursos Adicionais

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Changesets](https://github.com/changesets/changesets)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Evolution API Docs](https://doc.evolution-api.com)
- [Qdrant Documentation](https://qdrant.tech/documentation)
- [ReactFlow Examples](https://reactflow.dev/examples)