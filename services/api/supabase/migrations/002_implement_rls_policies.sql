-- =============================================================================
-- POLÍTICAS RLS PARA SISTEMA MULTI-TENANT
-- Sistema: Agentes de Conversão
-- Versão: 1.0
-- Data: 2025-01-29
-- =============================================================================

-- Primeiro, criar tabela de auditoria se não existir
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  organization_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID,
  operation TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- Habilitar RLS em todas as tabelas principais do schema Prisma
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datastores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS PARA ORGANIZATIONS
-- =============================================================================

-- Usuários podem ver apenas organizações onde são membros
DROP POLICY IF EXISTS "organizations_select_policy" ON public.organizations;
CREATE POLICY "organizations_select_policy" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
    )
  );

-- Apenas owners podem atualizar organizações
DROP POLICY IF EXISTS "organizations_update_policy" ON public.organizations;
CREATE POLICY "organizations_update_policy" ON public.organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
        AND m.role = 'OWNER'
    )
  );

-- Usuários autenticados podem criar organizações (se tornarão owners)
DROP POLICY IF EXISTS "organizations_insert_policy" ON public.organizations;
CREATE POLICY "organizations_insert_policy" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Apenas owners podem deletar organizações
DROP POLICY IF EXISTS "organizations_delete_policy" ON public.organizations;
CREATE POLICY "organizations_delete_policy" ON public.organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
        AND m.role = 'OWNER'
    )
  );

-- =============================================================================
-- POLÍTICAS PARA MEMBERSHIPS
-- =============================================================================

-- Usuários podem ver memberships da própria organização
DROP POLICY IF EXISTS "memberships_select_policy" ON public.memberships;
CREATE POLICY "memberships_select_policy" ON public.memberships
  FOR SELECT USING (
    -- Ver própria membership
    memberships.user_id = auth.uid()
    OR
    -- Admins podem ver todas as memberships da organização
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Apenas admins podem criar memberships (convites)
DROP POLICY IF EXISTS "memberships_insert_policy" ON public.memberships;
CREATE POLICY "memberships_insert_policy" ON public.memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Usuários podem atualizar própria membership, admins podem atualizar qualquer uma
DROP POLICY IF EXISTS "memberships_update_policy" ON public.memberships;
CREATE POLICY "memberships_update_policy" ON public.memberships
  FOR UPDATE USING (
    -- Própria membership (para aceitar convites)
    memberships.user_id = auth.uid()
    OR
    -- Admins podem atualizar qualquer membership da organização
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Usuários podem deletar própria membership, admins podem deletar qualquer uma
DROP POLICY IF EXISTS "memberships_delete_policy" ON public.memberships;
CREATE POLICY "memberships_delete_policy" ON public.memberships
  FOR DELETE USING (
    -- Própria membership (sair da organização)
    memberships.user_id = auth.uid()
    OR
    -- Admins podem remover qualquer membership da organização
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- =============================================================================
-- POLÍTICAS PARA USERS
-- =============================================================================

-- Usuários podem ver próprios dados + dados de membros da mesma organização
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT USING (
    -- Próprios dados
    users.id = auth.uid()
    OR
    -- Dados de usuários da mesma organização
    EXISTS (
      SELECT 1 FROM public.memberships m1, public.memberships m2
      WHERE m1.user_id = auth.uid()
        AND m2.user_id = users.id
        AND m1.organization_id = m2.organization_id
    )
  );

-- Usuários podem atualizar apenas próprios dados
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE USING (users.id = auth.uid());

-- Não permitir inserção direta (deve ser feita via auth)
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT WITH CHECK (false);

-- Usuários não podem deletar própria conta diretamente
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE USING (false);

-- =============================================================================
-- POLÍTICAS PARA AGENTS
-- =============================================================================

-- Usuários podem ver agentes da própria organização
DROP POLICY IF EXISTS "agents_select_policy" ON public.agents;
CREATE POLICY "agents_select_policy" ON public.agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = agents.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Membros podem criar agentes na própria organização
DROP POLICY IF EXISTS "agents_insert_policy" ON public.agents;
CREATE POLICY "agents_insert_policy" ON public.agents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = agents.organization_id
        AND m.user_id = auth.uid()
    )
    AND auth.check_usage_limits('agent_creation')
  );

-- Membros podem atualizar agentes da própria organização
DROP POLICY IF EXISTS "agents_update_policy" ON public.agents;
CREATE POLICY "agents_update_policy" ON public.agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = agents.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Admins podem deletar agentes da própria organização
DROP POLICY IF EXISTS "agents_delete_policy" ON public.agents;
CREATE POLICY "agents_delete_policy" ON public.agents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = agents.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- =============================================================================
-- POLÍTICAS PARA CONVERSATIONS
-- =============================================================================

-- Usuários podem ver conversas de agentes da própria organização
DROP POLICY IF EXISTS "conversations_select_policy" ON public.conversations;
CREATE POLICY "conversations_select_policy" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents a, public.memberships m
      WHERE a.id = conversations.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Usuários podem criar conversas com agentes da própria organização
DROP POLICY IF EXISTS "conversations_insert_policy" ON public.conversations;
CREATE POLICY "conversations_insert_policy" ON public.conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents a, public.memberships m
      WHERE a.id = conversations.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
    )
    AND conversations.user_id = auth.uid()
    AND auth.check_usage_limits('conversation_creation')
  );

-- Usuários podem atualizar próprias conversas
DROP POLICY IF EXISTS "conversations_update_policy" ON public.conversations;
CREATE POLICY "conversations_update_policy" ON public.conversations
  FOR UPDATE USING (
    conversations.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.agents a, public.memberships m
      WHERE a.id = conversations.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Usuários podem deletar próprias conversas
DROP POLICY IF EXISTS "conversations_delete_policy" ON public.conversations;
CREATE POLICY "conversations_delete_policy" ON public.conversations
  FOR DELETE USING (
    conversations.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.agents a, public.memberships m
      WHERE a.id = conversations.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- =============================================================================
-- POLÍTICAS PARA MESSAGES
-- =============================================================================

-- Usuários podem ver mensagens de conversas que têm acesso
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
CREATE POLICY "messages_select_policy" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c, public.agents a, public.memberships m
      WHERE c.id = messages.conversation_id
        AND a.id = c.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Usuários podem criar mensagens em conversas que têm acesso
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c, public.agents a, public.memberships m
      WHERE c.id = messages.conversation_id
        AND a.id = c.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Mensagens não podem ser atualizadas após criação
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
CREATE POLICY "messages_update_policy" ON public.messages
  FOR UPDATE USING (false);

-- Usuários podem deletar mensagens de próprias conversas
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;
CREATE POLICY "messages_delete_policy" ON public.messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c, public.agents a, public.memberships m
      WHERE c.id = messages.conversation_id
        AND a.id = c.agent_id
        AND m.organization_id = a.organization_id
        AND m.user_id = auth.uid()
        AND c.user_id = auth.uid()
    )
  );

-- =============================================================================
-- POLÍTICAS PARA DATASTORES
-- =============================================================================

-- Usuários podem ver datastores da própria organização
DROP POLICY IF EXISTS "datastores_select_policy" ON public.datastores;
CREATE POLICY "datastores_select_policy" ON public.datastores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = datastores.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Membros podem criar datastores na própria organização
DROP POLICY IF EXISTS "datastores_insert_policy" ON public.datastores;
CREATE POLICY "datastores_insert_policy" ON public.datastores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = datastores.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Membros podem atualizar datastores da própria organização
DROP POLICY IF EXISTS "datastores_update_policy" ON public.datastores;
CREATE POLICY "datastores_update_policy" ON public.datastores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = datastores.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Admins podem deletar datastores da própria organização
DROP POLICY IF EXISTS "datastores_delete_policy" ON public.datastores;
CREATE POLICY "datastores_delete_policy" ON public.datastores
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = datastores.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- =============================================================================
-- POLÍTICAS PARA DATASOURCES
-- =============================================================================

-- Usuários podem ver datasources de datastores da própria organização
DROP POLICY IF EXISTS "datasources_select_policy" ON public.datasources;
CREATE POLICY "datasources_select_policy" ON public.datasources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.datastores ds, public.memberships m
      WHERE ds.id = datasources.datastore_id
        AND m.organization_id = ds.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Membros podem criar datasources em datastores da própria organização
DROP POLICY IF EXISTS "datasources_insert_policy" ON public.datasources;
CREATE POLICY "datasources_insert_policy" ON public.datasources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.datastores ds, public.memberships m
      WHERE ds.id = datasources.datastore_id
        AND m.organization_id = ds.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Membros podem atualizar datasources de datastores da própria organização
DROP POLICY IF EXISTS "datasources_update_policy" ON public.datasources;
CREATE POLICY "datasources_update_policy" ON public.datasources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.datastores ds, public.memberships m
      WHERE ds.id = datasources.datastore_id
        AND m.organization_id = ds.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- Membros podem deletar datasources de datastores da própria organização
DROP POLICY IF EXISTS "datasources_delete_policy" ON public.datasources;
CREATE POLICY "datasources_delete_policy" ON public.datasources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.datastores ds, public.memberships m
      WHERE ds.id = datasources.datastore_id
        AND m.organization_id = ds.organization_id
        AND m.user_id = auth.uid()
    )
  );

-- =============================================================================
-- POLÍTICAS PARA API_KEYS
-- =============================================================================

-- Usuários podem ver API keys da própria organização
DROP POLICY IF EXISTS "api_keys_select_policy" ON public.api_keys;
CREATE POLICY "api_keys_select_policy" ON public.api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = api_keys.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Apenas admins podem criar API keys
DROP POLICY IF EXISTS "api_keys_insert_policy" ON public.api_keys;
CREATE POLICY "api_keys_insert_policy" ON public.api_keys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = api_keys.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Apenas admins podem atualizar API keys
DROP POLICY IF EXISTS "api_keys_update_policy" ON public.api_keys;
CREATE POLICY "api_keys_update_policy" ON public.api_keys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = api_keys.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Apenas admins podem deletar API keys
DROP POLICY IF EXISTS "api_keys_delete_policy" ON public.api_keys;
CREATE POLICY "api_keys_delete_policy" ON public.api_keys
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = api_keys.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- =============================================================================
-- POLÍTICAS PARA USAGE
-- =============================================================================

-- Usuários podem ver usage da própria organização (admins) ou próprio usage
DROP POLICY IF EXISTS "usage_select_policy" ON public.usage;
CREATE POLICY "usage_select_policy" ON public.usage
  FOR SELECT USING (
    -- Próprio usage
    usage.user_id = auth.uid()
    OR
    -- Usage da organização (apenas admins)
    (usage.organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = usage.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    ))
  );

-- Sistema pode criar/atualizar usage
DROP POLICY IF EXISTS "usage_insert_policy" ON public.usage;
CREATE POLICY "usage_insert_policy" ON public.usage
  FOR INSERT WITH CHECK (
    -- Próprio usage
    usage.user_id = auth.uid()
    OR
    -- Usage da organização (apenas admins)
    (usage.organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = usage.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    ))
  );

DROP POLICY IF EXISTS "usage_update_policy" ON public.usage;
CREATE POLICY "usage_update_policy" ON public.usage
  FOR UPDATE USING (
    -- Próprio usage
    usage.user_id = auth.uid()
    OR
    -- Usage da organização (apenas admins)
    (usage.organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = usage.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    ))
  );

-- =============================================================================
-- POLÍTICAS PARA ANALYTICS
-- =============================================================================

-- Usuários podem ver própria analytics
DROP POLICY IF EXISTS "analytics_select_policy" ON public.analytics;
CREATE POLICY "analytics_select_policy" ON public.analytics
  FOR SELECT USING (analytics.user_id = auth.uid());

-- Sistema pode criar analytics para qualquer usuário
DROP POLICY IF EXISTS "analytics_insert_policy" ON public.analytics;
CREATE POLICY "analytics_insert_policy" ON public.analytics
  FOR INSERT WITH CHECK (true);

-- Analytics não podem ser atualizadas
DROP POLICY IF EXISTS "analytics_update_policy" ON public.analytics;
CREATE POLICY "analytics_update_policy" ON public.analytics
  FOR UPDATE USING (false);

-- Usuários podem deletar própria analytics
DROP POLICY IF EXISTS "analytics_delete_policy" ON public.analytics;
CREATE POLICY "analytics_delete_policy" ON public.analytics
  FOR DELETE USING (analytics.user_id = auth.uid());

-- =============================================================================
-- POLÍTICAS PARA API_USAGE
-- =============================================================================

-- Usuários podem ver próprio api_usage, admins podem ver da organização
DROP POLICY IF EXISTS "api_usage_select_policy" ON public.api_usage;
CREATE POLICY "api_usage_select_policy" ON public.api_usage
  FOR SELECT USING (
    -- Próprio usage
    api_usage.user_id = auth.uid()
    OR
    -- Admins podem ver usage da organização
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Sistema pode criar api_usage
DROP POLICY IF EXISTS "api_usage_insert_policy" ON public.api_usage;
CREATE POLICY "api_usage_insert_policy" ON public.api_usage
  FOR INSERT WITH CHECK (true);

-- API usage não pode ser atualizada
DROP POLICY IF EXISTS "api_usage_update_policy" ON public.api_usage;
CREATE POLICY "api_usage_update_policy" ON public.api_usage
  FOR UPDATE USING (false);

-- API usage não pode ser deletada
DROP POLICY IF EXISTS "api_usage_delete_policy" ON public.api_usage;
CREATE POLICY "api_usage_delete_policy" ON public.api_usage
  FOR DELETE USING (false);

-- =============================================================================
-- POLÍTICAS PARA AUDIT_LOGS
-- =============================================================================

-- Apenas super admins podem ver audit logs
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT USING (auth.is_super_admin());

-- Sistema pode criar audit logs
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Audit logs não podem ser atualizados
DROP POLICY IF EXISTS "audit_logs_update_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_update_policy" ON public.audit_logs
  FOR UPDATE USING (false);

-- Audit logs não podem ser deletados
DROP POLICY IF EXISTS "audit_logs_delete_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_delete_policy" ON public.audit_logs
  FOR DELETE USING (false);

-- =============================================================================
-- TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- =============================================================================

-- Trigger para auditoria de organizações
CREATE OR REPLACE FUNCTION audit_organizations()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auth.log_access_attempt(
    'organizations',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    true
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_organizations_trigger ON public.organizations;
CREATE TRIGGER audit_organizations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION audit_organizations();

-- Trigger para auditoria de agents
CREATE OR REPLACE FUNCTION audit_agents()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auth.log_access_attempt(
    'agents',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    true
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_agents_trigger ON public.agents;
CREATE TRIGGER audit_agents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION audit_agents();

-- =============================================================================
-- GRANTS PARA SERVICE ROLE
-- =============================================================================

-- Permitir que service role execute funções de segurança
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- COMENTÁRIOS FINAIS
-- =============================================================================

COMMENT ON TABLE public.audit_logs IS 'Log de auditoria para todas as operações sensíveis do sistema';
COMMENT ON POLICY "organizations_select_policy" ON public.organizations IS 'Usuários só veem organizações onde são membros';
COMMENT ON POLICY "agents_select_policy" ON public.agents IS 'Usuários só veem agentes da própria organização';
COMMENT ON POLICY "conversations_select_policy" ON public.conversations IS 'Usuários só veem conversas de agentes da própria organização';
COMMENT ON POLICY "api_keys_select_policy" ON public.api_keys IS 'Apenas admins podem ver API keys da organização';