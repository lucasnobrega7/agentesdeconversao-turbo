# 🚀 Configuração de Deploy MVP - Agentes de Conversão

## 📋 Checklist Pré-Deploy

### 1. Supabase (Banco de Dados)
- [ ] Criar projeto no Supabase (https://supabase.com)
- [ ] Executar schema SQL: `services/api/supabase/complete-schema.sql`
- [ ] Copiar credenciais:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Railway (Backend)
- [ ] Criar projeto no Railway (https://railway.app)
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Deploy do serviço API

### 3. Vercel (Frontend)
- [ ] Criar projeto no Vercel (https://vercel.com)
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Deploy do Next.js

## 🔧 Variáveis de Ambiente

### Backend (Railway)
```env
# Supabase
SUPABASE_URL=https://faccixlabriqwxkxqprw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.faccixlabriqwxkxqprw.supabase.co:5432/postgres

# API
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=["https://dash.agentesdeconversao.ai"]

# AI Providers (mínimo para MVP)
OPENROUTER_API_KEY=your_openrouter_key
```

### Frontend (Vercel)
```env
# Public
NEXT_PUBLIC_SUPABASE_URL=https://faccixlabriqwxkxqprw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://api.agentesdeconversao.ai

# Private
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Comandos de Deploy

### 1. Preparar Projeto
```bash
# Instalar dependências
pnpm install

# Build completo
pnpm run build:turbo

# Testar localmente
pnpm dev
```

### 2. Deploy Backend (Railway)
```bash
cd services/api
railway login
railway link
railway up
```

### 3. Deploy Frontend (Vercel)
```bash
cd apps/web
vercel
vercel --prod
```

## 🌐 Configuração de Domínios

### Railway (Backend)
1. Dashboard Railway > Settings > Domains
2. Adicionar domínio customizado: `api.agentesdeconversao.ai`
3. Configurar DNS (CNAME)

### Vercel (Frontend)
1. Dashboard Vercel > Settings > Domains
2. Adicionar domínio customizado: `dash.agentesdeconversao.ai`
3. Configurar DNS (A/CNAME)

## ✅ Testes Pós-Deploy

1. **API Health Check**: https://api.agentesdeconversao.ai/health
2. **Frontend**: https://dash.agentesdeconversao.ai
3. **Autenticação**: Testar login/signup
4. **CRUD Agentes**: Criar e listar agentes
5. **Integração**: Verificar comunicação front-back

## 🎯 MVP Features Incluídas

- ✅ Autenticação com Supabase
- ✅ Dashboard principal
- ✅ CRUD de agentes
- ✅ API documentada
- ✅ Multi-tenant básico
- ✅ UI responsiva

## 🔜 Próximas Fases

1. **Fase 2**: Knowledge base + Qdrant
2. **Fase 3**: WhatsApp via Evolution API
3. **Fase 4**: AgentStudio visual
4. **Fase 5**: Billing com Stripe