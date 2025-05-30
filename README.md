# Agentes de Conversão

Uma plataforma empresarial de inteligência artificial conversacional para comunicação omnichannel e automação de processos de negócio.

## Visão Geral

O Agentes de Conversão é uma solução enterprise que integra múltiplos modelos de IA, canais de comunicação e ferramentas de automação em uma plataforma unificada. Desenvolvido com arquitetura monorepo escalável, oferece capacidades de nível empresarial para organizações que buscam transformar suas operações de atendimento ao cliente e automação de processos.

## Recursos Principais

### Plataforma de IA Multi-Modelo
- Suporte nativo para 7 modelos de IA incluindo GPT-4, Claude-3 e GPT-4o
- Sistema de agentes conversacionais configuráveis
- Processamento de linguagem natural avançado
- Integração com bases de conhecimento vetorial

### Comunicação Omnichannel
- WhatsApp Business API
- Telegram Bot Framework
- Integração Slack
- Sistema de email marketing
- Chat ao vivo (Crisp)

### Automação de Processos
- Construtor visual de workflows
- Sistema de aprovações multi-nível
- Tarefas agendadas (cron jobs)
- Rastreamento de eventos em tempo real

### CRM e Gestão de Leads
- Gestão completa de contatos
- Construtor de formulários
- Pipeline de vendas
- Analytics e relatórios

### Ferramentas de IA
- Extração inteligente de conteúdo web
- Análise de conteúdo do YouTube
- Automação de navegador
- Processamento de documentos

## Arquitetura Técnica

### Frontend
- Next.js 15 com App Router
- Material-UI e shadcn/ui
- TypeScript com tipagem completa
- Design responsivo desktop-first

### Backend
- FastAPI com Pydantic V2
- Conexão direta PostgreSQL
- Autenticação JWT
- Documentação OpenAPI automática

### Banco de Dados
- Supabase com schema enterprise
- 13 tabelas para multi-tenancy
- Row Level Security (RLS)
- Analytics e tracking de uso

### Integrações
- 120+ endpoints da base Chatvolt
- 26 categorias de componentes Flowise
- Sistema de plugins extensível
- APIs RESTful padronizadas

## Estrutura do Projeto

```
agentesdeconversao/
├── apps/
│   ├── api/              # Backend FastAPI
│   ├── web/              # Frontend Next.js
│   ├── dashboard/        # Interface administrativa
│   ├── docs/             # Documentação
│   └── landing/          # Página inicial
├── packages/
│   ├── types/            # Definições TypeScript
│   ├── ui/               # Componentes compartilhados
│   ├── components/       # Sistema de componentes
│   └── lib/              # Bibliotecas utilitárias
├── scripts/
│   ├── dev/              # Scripts de desenvolvimento
│   ├── deploy/           # Scripts de deployment
│   └── setup/            # Scripts de configuração
├── tests/
│   ├── unit/             # Testes unitários
│   ├── integration/      # Testes de integração
│   └── e2e/              # Testes end-to-end
└── deployment/
    ├── docker/           # Configurações Docker
    ├── k8s/              # Manifests Kubernetes
    └── terraform/        # Infrastructure as Code
```

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- Python 3.9+
- PostgreSQL 14+
- pnpm 8+

### Configuração Local

```bash
# Clonar o repositório
git clone https://github.com/lucasnobrega7/agentesdeconversao.git
cd agentesdeconversao

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar ambiente de desenvolvimento
./scripts/dev/dev-start.sh
```

### Acesso à Aplicação
- Frontend: http://localhost:3000
- API Backend: http://localhost:8000
- Documentação da API: http://localhost:8000/docs

## Comandos de Desenvolvimento

### Scripts de Desenvolvimento
```bash
# Iniciar todos os serviços
./scripts/dev/dev-start.sh

# Validar sistema completo
./scripts/dev/validate-system.sh

# Executar testes de integração
./scripts/dev/execute-now.sh
```

### Scripts de Deploy
```bash
# Deploy para produção
./scripts/deploy/deploy-production.sh
```

### Scripts de Configuração
```bash
# Configuração inicial
./scripts/setup/resolve-impediments.sh

# Organizar arquitetura
./scripts/setup/organize-architecture-enterprise.sh
```

## Configuração de Produção

### Banco de Dados Supabase
- URL: Configure SUPABASE_URL no .env
- Chave do serviço: Configure SUPABASE_SERVICE_KEY no .env
- Schema enterprise com 13 tabelas operacionais

### Variáveis de Ambiente Essenciais
```env
# Supabase
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_KEY=sua_chave_servico

# OpenRouter (IA)
OPENROUTER_API_KEY=sua_chave_openrouter

# Integrações
WHATSAPP_TOKEN=seu_token_whatsapp
TELEGRAM_BOT_TOKEN=seu_token_telegram
SLACK_BOT_TOKEN=seu_token_slack
```

## Testes

### Execução de Testes
```bash
# Testes de integração completos
cd apps/api && python test_full_integration.py

# Validação do sistema
./scripts/dev/validate-system.sh
```

### Cobertura de Testes
- Conectividade com banco de dados
- Todos os endpoints da API
- Isolamento multi-tenant
- Fluxos de autenticação

## Deploy e Infraestrutura

### Ambientes Suportados
- **Desenvolvimento**: Local com Docker Compose
- **Staging**: Railway (backend) + Vercel (frontend)
- **Produção**: Kubernetes com Terraform

### Containerização
```bash
# Build das imagens Docker
docker-compose build

# Execução em ambiente local
docker-compose up -d
```

## Documentação

### Documentação Técnica
- Arquitetura: `docs/architecture/`
- Guias de API: `docs/api/`
- Manuais do usuário: `docs/guides/`

### Relatórios de Status
- Integração Supabase: `docs/SUPABASE_COMPREHENSIVE_ANALYSIS.md`
- Integração Chatvolt: `docs/CHATVOLT_INTEGRATION_REPORT.md`
- Breakthrough Database: `docs/BREAKTHROUGH_REPORT.md`

## Contribuição

### Padrões de Desenvolvimento
- Seguir convenções TypeScript/ESLint
- Commits semânticos (feat:, fix:, docs:)
- Testes obrigatórios para novas funcionalidades
- Revisão de código para todas as mudanças

### Estrutura de Branches
- `main`: Código de produção estável
- `enterprise-integration-complete`: Branch de desenvolvimento
- Feature branches: Novas funcionalidades

## Suporte

### Documentação e Recursos
- Documentação completa em `docs/`
- Issues no GitHub para bugs
- Discussions para perguntas gerais

### Contato Empresarial
- Email: admin@agentesdeconversao.ai
- Website: agentesdeconversao.ai

## Licença

Este projeto está licenciado sob os termos definidos no arquivo LICENSE.

## Status do Projeto

**Versão Atual**: 1.0.0  
**Status**: Produção Empresarial  
**Última Atualização**: Maio 2025  

A plataforma está operacional com capacidades enterprise completas, incluindo integração de banco de dados, sistema omnichannel e arquitetura escalável para organizações de qualquer porte.