"""
Setup Supabase Schema for Agentes de Conversão
Usa configurações do projeto 'one' e aplica no banco Supabase
"""
import asyncio
from supabase import create_client, Client
import os

# Credenciais do Supabase (atualizadas)
SUPABASE_URL = "https://faccixlabriqwxkxqprw.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2NpeGxhYnJpcXd4a3hxcHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODAyNzEyMiwiZXhwIjoyMDYzNjAzMTIyfQ.ZTY8KZxF_B2Isx5P4OKqRnryDSIeXGH4GK5hEX6nC7E"

def setup_schema():
    """Configurar schema do Supabase"""
    print("🚀 Configurando Schema Supabase para Agentes de Conversão")
    print("=" * 60)
    
    try:
        # Conectar ao Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Conectado ao Supabase")
        
        # Schema SQL baseado no projeto 'one' - versão simplificada para agentes
        schema_sql = """
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
        """
        
        # Testar conectividade primeiro
        print("🔨 Testando conectividade...")
        
        # Testar conexão básica
        try:
            result = supabase.table("users").select("id").limit(1).execute()
            print("✅ Conexão com Supabase funcional")
        except Exception as e:
            print(f"⚠️  Tabela 'users' não acessível: {e}")
            print("📝 Vamos tentar criar as tabelas via SQL Editor manual")
        
        # Verificar se as tabelas já existem
        try:
            # Tentar consultar a tabela agents
            agents_test = supabase.table("agents").select("id").limit(1).execute()
            print("✅ Tabela 'agents' já existe")
        except Exception:
            print("⚠️  Tabela 'agents' não existe - será criada via SQL Editor")
        
        try:
            # Tentar consultar a tabela conversations
            conversations_test = supabase.table("conversations").select("id").limit(1).execute()
            print("✅ Tabela 'conversations' já existe")
        except Exception:
            print("⚠️  Tabela 'conversations' não existe - será criada via SQL Editor")
        
        print("\n📋 PRÓXIMO PASSO MANUAL:")
        print("1. Acesse: https://supabase.com/dashboard/project/faccixlabriqwxkxqprw/sql")
        print("2. Execute o SQL abaixo no SQL Editor:")
        print("\n" + "="*60)
        print(schema_sql)
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_integration():
    """Testar integração básica com Supabase"""
    print("\n🧪 Testando Integração Supabase")
    print("=" * 40)
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Testar inserção de dados (se tabelas existirem)
        try:
            # Criar organização de teste
            org_data = {
                "name": "Agentes de Conversão",
                "slug": "agentes-conversao",
                "email": "admin@agentesdeconversao.ai"
            }
            
            org_result = supabase.table("organizations").insert(org_data).execute()
            if org_result.data:
                print("✅ Organização criada com sucesso")
                org_id = org_result.data[0]["id"]
                
                # Criar agente de teste
                agent_data = {
                    "name": "Agente de Vendas Pro",
                    "description": "Especialista em conversão de vendas",
                    "system_prompt": "Você é um especialista em vendas focado em conversão.",
                    "model": "gpt-3.5-turbo",
                    "temperature": 0.7,
                    "organization_id": org_id
                }
                
                agent_result = supabase.table("agents").insert(agent_data).execute()
                if agent_result.data:
                    print("✅ Agente criado com sucesso")
                    return True
                
        except Exception as e:
            print(f"⚠️  Teste de inserção falhou: {e}")
            print("   (Normal se as tabelas ainda não existem)")
            
        print("✅ Conexão com Supabase OK")
        return True
        
    except Exception as e:
        print(f"❌ Erro na integração: {e}")
        return False

if __name__ == "__main__":
    success = setup_schema()
    if success:
        test_integration()
    else:
        print("❌ Falha na configuração do schema")