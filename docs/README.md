# Agentes de Conversão - Documentation

## Project Overview

Enterprise-grade conversational AI agents platform built with modern technologies and best practices.

## Architecture

- **Frontend**: Next.js 15 + TypeScript (Deployed on Vercel)
- **Backend**: FastAPI + Python (Deployed on Railway)
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **UI**: shadcn/ui + Tailwind CSS + Motion Primitives
- **Monorepo**: Turborepo with pnpm workspaces

## Project Structure

```
├── apps/
│   └── web/                 # Next.js frontend application
├── services/
│   └── api/                 # FastAPI backend service  
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Shared utilities
│   ├── config/              # Environment configurations
│   └── eslint-config/       # Shared ESLint configuration
├── scripts/                 # Deployment and setup scripts
├── docs/                    # Project documentation
└── .claude/                 # Claude Code configurations
```

## Getting Started

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development setup instructions.

## Deployment

- **Frontend**: Automatically deployed to Vercel on push to main
- **Backend**: Automatically deployed to Railway on push to main

## Links

- **Production**: https://agentesdeconversao.ai
- **API**: https://api.agentesdeconversao.ai
- **Repository**: https://github.com/lucasnobrega7/agentesdeconversao-turbo