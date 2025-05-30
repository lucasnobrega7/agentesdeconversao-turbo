# 🚀 AGENTES DE CONVERSÃO
## A plataforma que vai DOMINAR o mercado de IA conversacional

### 🎯 SETUP RÁPIDO (5 minutos)

```bash
# 1. Clone e instale
git clone [seu-repo]
cd agentesdeconversao
pnpm install

# 2. Configure banco
docker-compose up -d
cp .env.example .env
# Edite o .env com suas chaves

# 3. Configure Prisma
pnpm db:generate
pnpm db:push

# 4. RODE TUDO
pnpm dev
```

### 🏗️ ARQUITETURA
- **Backend**: FastAPI + TypeORM + BullMQ
- **Frontend**: Next.js 15 + ShadCN/UI + React Flow
- **Database**: PostgreSQL + pgvector + Redis
- **AI**: OpenRouter (multi-model)
- **Channels**: WhatsApp + Instagram + Evolution API

### 📦 ESTRUTURA
```
apps/
├── dashboard/     # Interface principal
├── landing/       # Landing page que converte
├── docs/          # Documentação
└── api/           # API Gateway

packages/
├── server/        # Backend engine
├── ui/            # Componentes UI
├── components/    # Sistema de nodes (26 categorias!)
├── integrations/  # Conectores multi-canal
├── prisma/        # Schema de dados
└── lib/           # Utilities compartilhadas
```

### 🎯 COMANDOS ESSENCIAIS
- `pnpm dev` - Desenvolvimento
- `pnpm build` - Build produção
- `pnpm db:studio` - Interface do banco
- `pnpm extract:update` - Atualizar da fonte

### ⚡ PRÓXIMOS PASSOS
1. Configure suas chaves de API no .env
2. Rode `pnpm dev`
3. Acesse http://localhost:3000
4. DOMINE o mercado
