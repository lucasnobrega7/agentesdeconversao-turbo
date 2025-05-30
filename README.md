# 🚀 Agentes de Conversão
**Plataforma de IA Conversacional de Nível Enterprise**

![Status Enterprise Architecture Stack](https://img.shields.io/badge/status-produção_ativa-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Visão Geral

**Agentes de Conversão** é uma plataforma enterprise de IA conversacional que permite criar, gerenciar e otimizar agentes inteligentes para automatizar vendas, atendimento ao cliente e conversões. Com um editor visual avançado (AgentStudio) e arquitetura de microserviços robusta.

> **Status Atual:** 🚧 EM DESENVOLVIMENTO - Arquitetura definida e implementação em progresso.

### 🎯 Problema que Resolve
- **Vendas 24/7:** Agentes que nunca dormem, qualificam leads e fecham vendas
- **Atendimento Escalável:** Reduz custos de suporte em até 70%
- **Conversões Otimizadas:** IA que aprende e melhora continuamente
- **Integração Total:** WhatsApp, Telegram, Web, APIs e mais

### 🏆 Diferenciais Enterprise
- **Editor Visual (AgentStudio):** Crie fluxos complexos como no N8N
- **Arquitetura Microserviços:** Escalabilidade ilimitada
- **Multi-canal:** Uma IA, todas as plataformas
- **Analytics Avançados:** Dashboards em tempo real
- **Knowledge Base:** RAG com documentos e conectores MCP
- **Integração OpenRouter:** Acesso a múltiplos modelos de IA

# ARQUITETURA

## 1. Estrutura de Subdomínios

```
# Domínio Principal
agentesdeconversao.ai → Redireciona para lp.agentesdeconversao.ai

# Subdomínios
lp.agentesdeconversao.ai     # Landing Page
dash.agentesdeconversao.ai   # Dashboard Principal
docs.agentesdeconversao.ai   # Documentação
login.agentesdeconversao.ai  # Autenticação
api.agentesdeconversao.ai    # Backend API
chat.agentesdeconversao.ai   # Widget de Chat (embeddable)
```

## 2. Rotas do Frontend (Next.js App Router)

### 2.1 Rotas Públicas

```typescript
// Landing Page (lp.agentesdeconversao.ai)
/                           # Home da landing page
/sobre                      # Sobre a empresa
/precos                     # Planos e preços
/recursos                   # Features detalhadas
/casos-de-uso              # Cases de sucesso
/blog                      # Blog de conteúdo
/blog/[slug]               # Post individual do blog
/contato                   # Formulário de contato
/privacidade               # Política de privacidade
/termos                    # Termos de uso

// Autenticação (login.agentesdeconversao.ai)
/                          # Login principal
/signup                    # Criar conta
/forgot-password           # Recuperar senha
/reset-password           # Resetar senha com token
/verify-email             # Verificar email
/magic-link               # Login via link mágico
```

### 2.2 Rotas Protegidas - Dashboard Principal

```typescript
// Dashboard (dash.agentesdeconversao.ai)
/                          # Dashboard overview
/onboarding               # Wizard de primeiro acesso
/profile                  # Perfil do usuário
/settings                 # Configurações da conta
/billing                  # Faturamento e assinatura
/api-keys                 # Gerenciar tokens de API

// Gestão de Agentes
/agents                   # Lista de agentes
/agents/new              # Criar novo agente
/agents/[id]             # Detalhes do agente
/agents/[id]/edit        # Editar agente
/agents/[id]/analytics   # Analytics do agente
/agents/[id]/test        # Testar agente

// AgentStudio - Editor Visual
/agent-studio                      # Lista de fluxos
/agent-studio/new                  # Criar novo fluxo
/agent-studio/[agentId]           # Editor principal
/agent-studio/[agentId]/flow      # Editor visual de fluxo
/agent-studio/[agentId]/prompts   # Editor de prompts
/agent-studio/[agentId]/tools     # Configurar ferramentas
/agent-studio/[agentId]/training  # Treinamento do agente
/agent-studio/[agentId]/simulate  # Simulador de fluxo
/agent-studio/templates           # Galeria de templates

// Sistema de Conversas
/conversations                     # Lista de conversas
/conversations/active             # Conversas ativas
/conversations/[id]               # Conversa específica
/conversations/[id]/transcript    # Transcrição completa
/conversations/archived           # Conversas arquivadas
/conversations/search             # Buscar conversas

// Monitoramento em Tempo Real
/monitoring                       # Dashboard de monitoramento
/monitoring/live                  # Conversas ao vivo
/monitoring/agents               # Status dos agentes
/monitoring/alerts               # Alertas e notificações
/monitoring/performance          # Métricas de performance

// Analytics
/analytics                        # Overview de analytics
/analytics/conversations         # Análise de conversas
/analytics/agents                # Performance por agente
/analytics/conversion            # Funil de conversão
/analytics/satisfaction          # Satisfação do cliente
/analytics/trends                # Tendências temporais
/analytics/reports               # Relatórios personalizados
/analytics/export                # Exportar dados

// Base de Conhecimento
/knowledge                        # Gestão de conhecimento
/knowledge/documents             # Documentos carregados
/knowledge/upload                # Upload de arquivos
/knowledge/sources               # Fontes de dados
/knowledge/mcp                   # Conectores MCP
/knowledge/mcp/[connector]       # Configurar conector
/knowledge/search                # Buscar no conhecimento

// Integrações
/integrations                    # Lista de integrações
/integrations/whatsapp          # Configurar WhatsApp
/integrations/telegram          # Configurar Telegram
/integrations/webchat           # Configurar WebChat
/integrations/slack             # Configurar Slack
/integrations/[platform]        # Configuração específica
/integrations/webhooks          # Gerenciar webhooks
/integrations/api               # Documentação da API

// Time e Colaboração
/team                           # Membros da equipe
/team/invite                    # Convidar membros
/team/roles                     # Gerenciar papéis
/team/permissions               # Permissões detalhadas
```

### 2.3 Rotas Administrativas

```typescript
// Admin Panel (dash.agentesdeconversao.ai/admin)
/admin                          # Admin dashboard
/admin/users                    # Gerenciar usuários
/admin/organizations            # Gerenciar organizações
/admin/agents                   # Todos os agentes
/admin/conversations            # Todas as conversas
/admin/api-status               # Status das APIs
/admin/api-keys                 # Chaves de API globais
/admin/config-check             # Verificação de sistema
/admin/logs                     # Logs do sistema
/admin/metrics                  # Métricas globais
/admin/billing                  # Faturamento geral
/admin/subdomains               # Gerenciar subdomínios
/admin/maintenance              # Modo manutenção
```

## 3. Rotas da API Backend

### 3.1 Endpoints Públicos

```typescript
// API Base (api.agentesdeconversao.ai)
GET  /                         # API info e status
GET  /health                   # Health check
GET  /status                   # Status detalhado
POST /webhooks/[provider]      # Webhooks de entrada

// Autenticação
POST /auth/signup              # Criar conta
POST /auth/login               # Login
POST /auth/logout              # Logout
POST /auth/refresh             # Refresh token
POST /auth/forgot-password     # Solicitar reset
POST /auth/reset-password      # Executar reset
POST /auth/verify-email        # Verificar email
GET  /auth/me                  # Dados do usuário atual
```

### 3.2 Endpoints de Agentes

```typescript
// CRUD de Agentes
GET    /agents                 # Listar agentes
POST   /agents                 # Criar agente
GET    /agents/:id             # Detalhes do agente
PUT    /agents/:id             # Atualizar agente
DELETE /agents/:id             # Deletar agente
POST   /agents/:id/duplicate   # Duplicar agente

// Configurações de Agentes
GET    /agents/:id/config      # Configuração completa
PUT    /agents/:id/config      # Atualizar config
POST   /agents/:id/test        # Testar agente
GET    /agents/:id/logs        # Logs do agente

// Analytics de Agentes
GET    /agents/:id/analytics   # Analytics geral
GET    /agents/:id/metrics     # Métricas detalhadas
GET    /agents/:id/performance # Performance metrics
```

### 3.3 Endpoints de Conversas

```typescript
// Gestão de Conversas
GET    /conversations                    # Listar conversas
POST   /conversations                    # Iniciar conversa
GET    /conversations/:id                # Detalhes da conversa
PUT    /conversations/:id                # Atualizar conversa
DELETE /conversations/:id                # Deletar conversa
POST   /conversations/:id/archive        # Arquivar conversa
POST   /conversations/:id/unarchive      # Desarquivar

// Mensagens
GET    /conversations/:id/messages       # Listar mensagens
POST   /conversations/:id/messages       # Enviar mensagem
PUT    /conversations/:id/messages/:msgId # Editar mensagem
DELETE /conversations/:id/messages/:msgId # Deletar mensagem

// Ações em Conversas
POST   /conversations/:id/assign         # Atribuir a humano
POST   /conversations/:id/transfer       # Transferir conversa
POST   /conversations/:id/close          # Fechar conversa
POST   /conversations/:id/reopen         # Reabrir conversa
POST   /conversations/:id/rate           # Avaliar conversa
```

### 3.4 Endpoints de Conhecimento

```typescript
// Documentos
GET    /knowledge/documents              # Listar documentos
POST   /knowledge/documents/upload       # Upload de arquivo
GET    /knowledge/documents/:id          # Detalhes do documento
DELETE /knowledge/documents/:id          # Deletar documento
POST   /knowledge/documents/:id/process  # Reprocessar documento

// Fontes de Dados
GET    /knowledge/sources                # Listar fontes
POST   /knowledge/sources                # Adicionar fonte
PUT    /knowledge/sources/:id           # Atualizar fonte
DELETE /knowledge/sources/:id           # Remover fonte
POST   /knowledge/sources/:id/sync      # Sincronizar fonte

// MCP Connectors
GET    /knowledge/mcp                    # Listar conectores
POST   /knowledge/mcp/:type/connect     # Conectar serviço
GET    /knowledge/mcp/:id/status        # Status do conector
PUT    /knowledge/mcp/:id/config        # Configurar conector
DELETE /knowledge/mcp/:id               # Desconectar
POST   /knowledge/mcp/:id/test          # Testar conexão
```

### 3.5 Endpoints de AgentStudio

```typescript
// Fluxos
GET    /flows                           # Listar fluxos
POST   /flows                           # Criar fluxo
GET    /flows/:id                       # Detalhes do fluxo
PUT    /flows/:id                       # Atualizar fluxo
DELETE /flows/:id                       # Deletar fluxo
POST   /flows/:id/publish               # Publicar fluxo
POST   /flows/:id/draft                 # Salvar rascunho
GET    /flows/:id/versions              # Histórico de versões
POST   /flows/:id/rollback/:version     # Reverter versão

// Templates
GET    /flows/templates                 # Listar templates
GET    /flows/templates/:category       # Templates por categoria
POST   /flows/templates/:id/use         # Usar template
```

### 3.6 Endpoints de Analytics

```typescript
// Métricas Gerais
GET    /analytics/overview              # Overview geral
GET    /analytics/real-time             # Dados em tempo real
GET    /analytics/historical            # Dados históricos

// Analytics Específicos
GET    /analytics/conversations         # Analytics de conversas
GET    /analytics/agents                # Analytics por agente
GET    /analytics/users                 # Analytics de usuários
GET    /analytics/conversion            # Funil de conversão
GET    /analytics/satisfaction          # Satisfação
GET    /analytics/trends                # Tendências

// Relatórios
POST   /analytics/reports/generate      # Gerar relatório
GET    /analytics/reports/:id           # Baixar relatório
GET    /analytics/reports               # Listar relatórios
```

### 3.7 Endpoints de Integrações

```typescript
// WhatsApp
POST   /integrations/whatsapp/qr        # Gerar QR Code
POST   /integrations/whatsapp/verify    # Verificar conexão
GET    /integrations/whatsapp/status    # Status da conexão
POST   /integrations/whatsapp/send      # Enviar mensagem
POST   /integrations/whatsapp/webhook   # Webhook de entrada

// Webhooks Genéricos
GET    /integrations/webhooks           # Listar webhooks
POST   /integrations/webhooks           # Criar webhook
PUT    /integrations/webhooks/:id       # Atualizar webhook
DELETE /integrations/webhooks/:id       # Deletar webhook
POST   /integrations/webhooks/:id/test  # Testar webhook
```

### 3.8 Endpoints Administrativos

```typescript
// Admin Only
GET    /admin/users                     # Todos os usuários
GET    /admin/organizations             # Todas as organizações
GET    /admin/metrics                   # Métricas do sistema
POST   /admin/broadcast                 # Enviar comunicado
PUT    /admin/config                    # Configuração global
POST   /admin/maintenance               # Modo manutenção
GET    /admin/logs                      # Logs do sistema
POST   /admin/cache/clear               # Limpar cache
```

## 4. Rotas de Widgets e Embeds

```typescript
// Chat Widget (chat.agentesdeconversao.ai)
/widget/:agentId                        # Widget de chat
/widget/:agentId/bubble                 # Versão bubble
/widget/:agentId/fullscreen             # Versão tela cheia
/widget/:agentId/inline                 # Versão inline

// Embed Scripts
/embed/js/:agentId                      # JavaScript do widget
/embed/css/:agentId                     # CSS customizado
```

## 5. Rotas de Documentação

```typescript
// Docs (docs.agentesdeconversao.ai)
/                                       # Home da documentação
/quickstart                             # Guia rápido
/tutorials                              # Tutoriais
/tutorials/[slug]                       # Tutorial específico
/api-reference                          # Referência da API
/api-reference/[endpoint]               # Endpoint específico
/sdks                                   # SDKs disponíveis
/sdks/[language]                        # SDK específico
/guides                                 # Guias avançados
/guides/[topic]                         # Guia específico
/changelog                              # Histórico de mudanças
/support                                # Suporte
```

## 6. Rotas Especiais e Utilitárias

```typescript
// Error Pages
/404                                    # Página não encontrada
/500                                    # Erro do servidor
/maintenance                            # Modo manutenção

// Legal/Compliance
/privacy                                # Política de privacidade
/terms                                  # Termos de serviço
/cookies                                # Política de cookies
/gdpr                                   # GDPR compliance
/security                               # Segurança

// Marketing
/affiliate                              # Programa de afiliados
/partners                               # Parceiros
/press                                  # Imprensa
/careers                                # Carreiras
```

## 7. Estrutura de Pastas Next.js (App Router)

```typescript
app/
├── (public)/                          # Grupo de rotas públicas
│   ├── page.tsx                       # Landing page
│   ├── sobre/page.tsx
│   ├── precos/page.tsx
│   └── contato/page.tsx
├── (auth)/                            # Grupo de rotas de autenticação
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)/                       # Grupo de rotas protegidas
│   ├── layout.tsx                     # Layout com sidebar
│   ├── page.tsx                       # Dashboard home
│   ├── agents/
│   │   ├── page.tsx                   # Lista de agentes
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       └── analytics/page.tsx
│   ├── conversations/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── agent-studio/
│   │   ├── page.tsx
│   │   └── [agentId]/
│   │       ├── page.tsx
│   │       ├── flow/page.tsx
│   │       └── prompts/page.tsx
│   └── analytics/
│       ├── page.tsx
│       └── [type]/page.tsx
├── admin/                             # Rotas administrativas
│   ├── layout.tsx                     # Layout admin
│   └── [...páginas admin]
└── api/                               # API routes (se necessário)
└── [...endpoints]
```

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: FUNDAÇÃO SÓLIDA (40% Completo)
- [x] Estrutura de pastas enterprise
- [x] Frontend Next.js 15 base configurado
- [x] Backend FastAPI estrutura criada
- [x] Pydantic V2 models definidos
- [ ] Database Supabase totalmente integrado

### FASE 2: CORE FEATURES (20% Completo)
- [x] Layout de autenticação criado
- [x] Dashboard principal com mock data
- [ ] CRUD de agentes funcional
- [ ] API REST implementada e testada
- [ ] Subdomínios em produção

### FASE 3: FEATURES AVANÇADAS (0% Completo)
- [ ] AgentStudio (editor visual)
- [ ] Sistema de conversas real-time
- [ ] Analytics dashboard funcional
- [ ] Vector search + knowledge base
- [ ] Integrações (WhatsApp, Telegram)

### FASE 4: ENTERPRISE READY (0% Completo)
- [ ] Monitoramento completo
- [ ] CI/CD pipeline configurado
- [ ] Deploy automatizado funcionando
- [ ] Performance optimization
- [ ] Security audit completo

## ⚡ STACK TECHNOLOGY ENTERPRISE

### Frontend (dash.agentesdeconversao.ai)
- **Next.js 15** - App Router, Server Components
- **shadcn/ui** - Design system profissional
- **TypeScript** - Type safety total
- **Tailwind CSS** - Styling system
- **Framer Motion** - Animations premium

### Backend (api.agentesdeconversao.ai)
- **FastAPI** - API moderna e rápida
- **Pydantic V2** - Validation robusta
- **SQLAlchemy** - ORM enterprise
- **Redis** - Cache e sessions
- **Celery** - Background tasks

### Database & Infrastructure
- **Supabase** - PostgreSQL + Auth + Realtime
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **Cloudflare** - CDN + Security
- **DataDog** - Monitoring enterprise

## 🏆 DIFERENCIAIS ENTERPRISE

### Performance
- ⚡ Loading < 2s (otimizado)
- 📱 Desktop-first responsive
- 🔄 Real-time updates
- 💾 Smart caching strategy

### Security
- 🔐 JWT authentication
- 🛡️ Row Level Security (RLS)
- 🔒 API rate limiting
- 🚨 Security monitoring

### Scalability
- 📈 Auto-scaling infrastructure
- 🔄 Load balancing
- 📊 Performance monitoring
- 💪 99.9% uptime SLA

### Developer Experience
- 📖 API documentation automática
- 🧪 Test coverage > 90%
- 🔧 CI/CD pipeline
- 📝 Code standards enforced

---

**Status:** 🚧 EM DESENVOLVIMENTO - FASE INICIAL
**Progresso Geral:** ~25% do MVP completo
**Próximo Marco:** Implementar funcionalidades core do backend