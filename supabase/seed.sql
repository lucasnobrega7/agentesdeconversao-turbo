-- Dados de seed para desenvolvimento
INSERT INTO public.organizations (id, name, slug, email) 
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Agentes de Conversão', 
  'agentes-conversao', 
  'admin@agentesdeconversao.ai'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.users (id, name, email) 
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Admin User',
  'admin@agentesdeconversao.ai'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.agents (id, name, description, system_prompt, model, organization_id, user_id) 
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Agente de Vendas Pro',
  'Especialista em conversão de vendas e atendimento',
  'Você é um especialista em vendas focado em conversão. Seja helpful, direto e persuasivo.',
  'gpt-3.5-turbo',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
)
ON CONFLICT (id) DO NOTHING;