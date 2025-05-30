-- =============================================================================
-- TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE MEMBERSHIP AO CRIAR ORGANIZAÇÃO
-- Sistema: Agentes de Conversão
-- Versão: 1.0
-- Data: 2025-01-29
-- =============================================================================

-- Função para criar membership automática quando uma organização é criada
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar membership como OWNER para o usuário que criou a organização
  INSERT INTO public.memberships (
    organization_id,
    user_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    auth.uid(),
    'OWNER',
    NOW(),
    NOW()
  );
  
  -- Log da criação automática
  PERFORM auth.log_access_attempt(
    'memberships',
    (SELECT id FROM public.memberships WHERE organization_id = NEW.id AND user_id = auth.uid()),
    'INSERT_AUTO',
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar após inserção na tabela organizations
DROP TRIGGER IF EXISTS auto_create_organization_membership ON public.organizations;
CREATE TRIGGER auto_create_organization_membership
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- Função para verificar se o usuário tem pelo menos uma membership ativa
CREATE OR REPLACE FUNCTION public.ensure_user_has_organization()
RETURNS TRIGGER AS $$
DECLARE
  membership_count INTEGER;
  default_org_id UUID;
BEGIN
  -- Contar memberships do usuário
  SELECT COUNT(*) INTO membership_count
  FROM public.memberships
  WHERE user_id = NEW.id;
  
  -- Se não tem nenhuma membership, criar organização pessoal
  IF membership_count = 0 THEN
    -- Criar organização pessoal
    INSERT INTO public.organizations (name, created_at, updated_at)
    VALUES (
      COALESCE(NEW.name, 'Organização de ' || NEW.email),
      NOW(),
      NOW()
    ) RETURNING id INTO default_org_id;
    
    -- Criar membership como OWNER
    INSERT INTO public.memberships (
      organization_id,
      user_id,
      role,
      created_at,
      updated_at
    ) VALUES (
      default_org_id,
      NEW.id,
      'OWNER',
      NOW(),
      NOW()
    );
    
    -- Log da criação automática
    PERFORM auth.log_access_attempt(
      'organizations',
      default_org_id,
      'INSERT_AUTO_PERSONAL',
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar após inserção na tabela users
DROP TRIGGER IF EXISTS auto_create_user_organization ON public.users;
CREATE TRIGGER auto_create_user_organization
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_has_organization();

-- Função para validar deleção de membership
CREATE OR REPLACE FUNCTION public.validate_membership_deletion()
RETURNS TRIGGER AS $$
DECLARE
  owner_count INTEGER;
  user_membership_count INTEGER;
BEGIN
  -- Verificar se é a última membership do usuário
  SELECT COUNT(*) INTO user_membership_count
  FROM public.memberships
  WHERE user_id = OLD.user_id;
  
  -- Se for a última membership, impedir deleção
  IF user_membership_count = 1 THEN
    RAISE EXCEPTION 'Cannot delete last membership for user. User must belong to at least one organization.';
  END IF;
  
  -- Se for OWNER, verificar se há outros owners na organização
  IF OLD.role = 'OWNER' THEN
    SELECT COUNT(*) INTO owner_count
    FROM public.memberships
    WHERE organization_id = OLD.organization_id
      AND role = 'OWNER'
      AND id != OLD.id;
    
    -- Se for o último owner, impedir deleção
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot delete last owner from organization. Organization must have at least one owner.';
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para validar deleção de membership
DROP TRIGGER IF EXISTS validate_membership_deletion_trigger ON public.memberships;
CREATE TRIGGER validate_membership_deletion_trigger
  BEFORE DELETE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.validate_membership_deletion();

-- Função para validar atualização de role
CREATE OR REPLACE FUNCTION public.validate_membership_role_update()
RETURNS TRIGGER AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Se está removendo role de OWNER, verificar se há outros owners
  IF OLD.role = 'OWNER' AND NEW.role != 'OWNER' THEN
    SELECT COUNT(*) INTO owner_count
    FROM public.memberships
    WHERE organization_id = OLD.organization_id
      AND role = 'OWNER'
      AND id != OLD.id;
    
    -- Se for o último owner, impedir atualização
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove last owner from organization. Organization must have at least one owner.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para validar atualização de role
DROP TRIGGER IF EXISTS validate_membership_role_update_trigger ON public.memberships;
CREATE TRIGGER validate_membership_role_update_trigger
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.validate_membership_role_update();

-- Atualizar função de current_organization_id para lidar com múltiplas organizações
CREATE OR REPLACE FUNCTION auth.current_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Buscar a primeira organização onde o usuário é OWNER
  SELECT m.organization_id INTO org_id
  FROM public.memberships m
  WHERE m.user_id = auth.uid()
    AND m.role = 'OWNER'
  ORDER BY m.created_at ASC
  LIMIT 1;
  
  -- Se não é owner de nenhuma, pegar a primeira organização como ADMIN
  IF org_id IS NULL THEN
    SELECT m.organization_id INTO org_id
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'ADMIN'
    ORDER BY m.created_at ASC
    LIMIT 1;
  END IF;
  
  -- Se não é admin de nenhuma, pegar a primeira organização como MEMBER
  IF org_id IS NULL THEN
    SELECT m.organization_id INTO org_id
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
    ORDER BY m.created_at ASC
    LIMIT 1;
  END IF;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para trocar de organização ativa (para usuários com múltiplas memberships)
CREATE OR REPLACE FUNCTION auth.switch_organization(target_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Verificar se o usuário tem acesso à organização
  SELECT auth.has_org_access(target_org_id) INTO has_access;
  
  IF NOT has_access THEN
    RETURN false;
  END IF;
  
  -- Atualizar timestamp da membership para torná-la "mais recente"
  UPDATE public.memberships
  SET updated_at = NOW()
  WHERE user_id = auth.uid()
    AND organization_id = target_org_id;
  
  -- Log da troca de organização
  PERFORM auth.log_access_attempt(
    'memberships',
    target_org_id,
    'SWITCH_ORG',
    true
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter informações completas da organização atual
CREATE OR REPLACE FUNCTION auth.current_organization_info()
RETURNS TABLE(
  organization_id UUID,
  organization_name TEXT,
  user_role TEXT,
  member_since TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    m.role,
    m.created_at
  FROM public.organizations o
  JOIN public.memberships m ON o.id = m.organization_id
  WHERE m.user_id = auth.uid()
    AND o.id = auth.current_organization_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Comentários sobre as funções
COMMENT ON FUNCTION public.handle_new_organization() IS 'Cria membership automática como OWNER ao criar organização';
COMMENT ON FUNCTION public.ensure_user_has_organization() IS 'Garante que novo usuário tenha pelo menos uma organização';
COMMENT ON FUNCTION public.validate_membership_deletion() IS 'Impede deleção da última membership ou último owner';
COMMENT ON FUNCTION public.validate_membership_role_update() IS 'Impede remoção do último owner da organização';
COMMENT ON FUNCTION auth.switch_organization(UUID) IS 'Permite trocar organização ativa para usuários multi-org';
COMMENT ON FUNCTION auth.current_organization_info() IS 'Retorna informações completas da organização atual';

-- Política atualizada para permitir criação de organizações
DROP POLICY IF EXISTS "organizations_insert_policy" ON public.organizations;
CREATE POLICY "organizations_insert_policy" ON public.organizations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Política atualizada para memberships - permitir auto-criação
DROP POLICY IF EXISTS "memberships_insert_policy" ON public.memberships;
CREATE POLICY "memberships_insert_policy" ON public.memberships
  FOR INSERT WITH CHECK (
    -- Auto-criação pelo sistema
    auth.uid() IS NULL
    OR
    -- Admins podem convidar
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OWNER')
    )
    OR
    -- Aceitar convite próprio
    memberships.user_id = auth.uid()
  );