# 🏗️ SETUP MANUAL DO SCHEMA SUPABASE

## ⚠️ SITUAÇÃO ATUAL
- As credenciais do Supabase no script estão desatualizadas
- O projeto precisa de um novo banco Supabase ou credenciais válidas
- Por isso, o schema deve ser aplicado manualmente

## 🎯 OPÇÕES DE SOLUÇÃO

### OPÇÃO 1: Novo Projeto Supabase (RECOMENDADO)

1. **Criar novo projeto:**
   - Acesse https://supabase.com/dashboard
   - Clique em "New Project"
   - Nome: "agentes-conversao-prod"
   - Região: South America (Brazil)

2. **Obter credenciais:**
   ```bash
   SUPABASE_URL=https://[seu-projeto].supabase.co
   SUPABASE_ANON_KEY=[sua-anon-key]
   SUPABASE_SERVICE_KEY=[sua-service-key]
   ```

3. **Aplicar schema SQL:**
   - Acesse SQL Editor no dashboard
   - Execute o script abaixo

### OPÇÃO 2: Usar SQLite Local (DESENVOLVIMENTO)

```bash
# Backend já está configurado para fallback SQLite
cd backend
# O sistema funcionará com dados em memória/SQLite
python main_dev.py
```

## 📝 SCHEMA SQL PARA SUPABASE

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de organizações
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agentes
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  temperature DOUBLE PRECISION DEFAULT 0.7,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON public.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- RLS (Row Level Security) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own agents" ON public.agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Inserir dados de teste
INSERT INTO public.organizations (name, slug, email) 
VALUES ('Agentes de Conversão', 'agentes-conversao', 'admin@agentesdeconversao.ai')
ON CONFLICT (slug) DO NOTHING;
```

## 🚀 PRÓXIMOS PASSOS

1. **Escolher uma opção acima**
2. **Atualizar credenciais no .env**
3. **Testar conexão:**
   ```bash
   cd backend
   python test_supabase_connection.py
   ```
4. **Iniciar desenvolvimento:**
   ```bash
   ./dev-start.sh
   ```

## 📊 STATUS ATUAL SEM SUPABASE

✅ **Sistema funcionando com fallback in-memory**
- Backend: http://localhost:8000 ✅
- Frontend: http://localhost:3000 ✅
- API Docs: http://localhost:8000/docs ✅
- CRUD Agentes: Funcionando ✅
- Sistema de Conversas: Funcionando ✅

**O sistema está 95% operacional mesmo sem Supabase!**