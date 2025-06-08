# Agentes de Conversão

> Plataforma SaaS para criação de agentes AI capazes de realizar atendimentos e vendas humanizadas via WhatsApp.

[![Deploy](https://github.com/[user]/agentesdeconversao/actions/workflows/deploy.yml/badge.svg)](https://github.com/[user]/agentesdeconversao/actions/workflows/deploy.yml)
[![CI](https://github.com/[user]/agentesdeconversao/actions/workflows/ci.yml/badge.svg)](https://github.com/[user]/agentesdeconversao/actions/workflows/ci.yml)

## 🚀 Quick Start

```bash
# Clone o repositório
git clone https://github.com/[user]/agentesdeconversao.git
cd agentesdeconversao

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o desenvolvimento
pnpm dev
```

## 📦 Stack Tecnológica

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11, Pydantic v2
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: LiteLLM Gateway (OpenAI, Anthropic, Google)
- **Infra**: Docker, Railway, Vercel, GitHub Actions

## 🏗️ Arquitetura

```
agentesdeconversao/
├── apps/
│   └── web/          # Frontend Next.js
├── services/
│   └── api/          # Backend FastAPI
├── packages/         # Pacotes compartilhados
└── config/          # Configurações globais
```

## 🚀 Deploy

### Automático (CI/CD)

Commits na branch `main` disparam deploy automático via GitHub Actions.

### Manual

```bash
# Deploy completo
./deploy-production.sh

# Ou individualmente:
# Backend (Railway)
cd services/api && railway up

# Frontend (Vercel)
cd apps/web && vercel --prod
```

## 📚 Documentação

- [Arquitetura](./ARQUITETURA.md)
- [Guia de Deploy](./DEPLOY_CONFIG.md)
- [Desenvolvimento](./CLAUDE.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário e confidencial.