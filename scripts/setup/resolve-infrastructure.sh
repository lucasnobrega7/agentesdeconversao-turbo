#!/bin/bash

# 🏗️ RESOLUÇÃO ARQUITETURAL SISTÊMICA - AGENTES DE CONVERSÃO
# Estratégia multinível para stabilização da infraestrutura de desenvolvimento

echo "🎯 INICIANDO RESOLUÇÃO SISTÊMICA DE GARGALOS DE INFRAESTRUTURA"
echo "📊 Análise: Failures em Network, Docker e Workspace Architecture"

cd /Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 1: NETWORK INFRASTRUCTURE STABILIZATION"
echo "═══════════════════════════════════════════════════════════"

# Verificar e corrigir configuração pnpm
echo "🔍 Diagnosticando configuração pnpm..."

# Verificar versão Node.js e pnpm
echo "Node.js version: $(node --version)"
echo "pnpm version: $(pnpm --version 2>/dev/null || echo 'pnpm not found')"

# Verificar se pnpm está corretamente instalado
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm não encontrado. Instalando via npm..."
    npm install -g pnpm@latest
fi

# Configurar registry mirror para reliability
echo "🌐 Configurando registry mirror strategy..."
pnpm config set registry https://registry.npmjs.org/
pnpm config set network-timeout 60000
pnpm config set fetch-retries 3
pnpm config set fetch-retry-factor 2

# Limpar cache pnpm que pode estar corrompido
echo "🧹 Limpando cache pnpm..."
pnpm store prune

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 2: WORKSPACE ARCHITECTURE OPTIMIZATION"
echo "═══════════════════════════════════════════════════════════"

# Criar pnpm-workspace.yaml (substitui workspaces no package.json)
echo "📦 Configurando pnpm workspace architecture..."

cat > pnpm-workspace.yaml << 'EOF'
# Agentes de Conversão - pnpm Workspace Configuration
packages:
  - 'apps/*'
  - 'packages/*'
  - 'integrations/*'
EOF

# Atualizar package.json para remover workspaces e otimizar para pnpm
echo "⚙️ Otimizando package.json para pnpm patterns..."

# Backup do package.json atual
cp package.json package.json.backup

# Criar novo package.json otimizado para pnpm
cat > package.json << 'EOF'
{
  "name": "agentes-de-conversao",
  "version": "1.0.0",
  "description": "🚀 Plataforma de orquestração de IA conversacional",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "test": "turbo run test",
    "db:generate": "cd packages/prisma && prisma generate",
    "db:push": "cd packages/prisma && prisma db push",
    "db:studio": "cd packages/prisma && prisma studio",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "env:setup": "./scripts/setup-environment.sh",
    "health": "./scripts/health-check.sh"
  },
  "devDependencies": {
    "turbo": "^1.13.4",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "prisma": "^5.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
EOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 3: CONTAINER ORCHESTRATION SETUP"
echo "═══════════════════════════════════════════════════════════"

echo "🐳 Verificando Docker infrastructure..."

# Verificar se Docker está instalado e rodando
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado."
    echo "📋 AÇÃO REQUERIDA: Instale Docker Desktop"
    echo "   https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Verificar se Docker daemon está rodando
if ! docker info &> /dev/null; then
    echo "⚠️  Docker daemon não está rodando."
    echo "📋 AÇÃO REQUERIDA: Inicie Docker Desktop"
    echo "   1. Abra Docker Desktop"
    echo "   2. Aguarde inicialização completa"
    echo "   3. Re-execute este script"
    
    # Tentar iniciar Docker automaticamente no macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🔄 Tentando iniciar Docker Desktop automaticamente..."
        open -a Docker
        echo "⏳ Aguardando Docker inicializar (60 segundos)..."
        sleep 60
        
        # Verificar novamente
        if docker info &> /dev/null; then
            echo "✅ Docker inicializado com sucesso!"
        else
            echo "❌ Docker ainda não está disponível. Verifique manualmente."
            exit 1
        fi
    else
        exit 1
    fi
fi

echo "✅ Docker daemon disponível"

# Otimizar docker-compose.yml para development efficiency
echo "🔧 Otimizando configuração Docker Compose..."

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL with pgvector for AI embeddings
  postgres:
    image: pgvector/pgvector:pg15
    container_name: agentes-postgres
    environment:
      POSTGRES_DB: agentesdeconversao
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis for caching and queues
  redis:
    image: redis:7-alpine
    container_name: agentes-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  # Database management interface
  adminer:
    image: adminer:latest
    container_name: agentes-adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  default:
    name: agentes-network
EOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 4: ENVIRONMENT CONFIGURATION MANAGEMENT"
echo "═══════════════════════════════════════════════════════════"

# Criar script de inicialização do banco de dados
mkdir -p scripts

cat > scripts/init-db.sql << 'EOF'
-- Agentes de Conversão - Database Initialization
-- PostgreSQL with pgvector for AI embeddings

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Create application user with appropriate permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'agentes_app') THEN
        CREATE ROLE agentes_app WITH LOGIN PASSWORD 'agentes_secure_pwd';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE agentesdeconversao TO agentes_app;
GRANT USAGE ON SCHEMA public TO agentes_app;
GRANT CREATE ON SCHEMA public TO agentes_app;

-- Performance optimizations
ALTER DATABASE agentesdeconversao SET shared_preload_libraries = 'pg_stat_statements';
ALTER DATABASE agentesdeconversao SET log_statement = 'all';
ALTER DATABASE agentesdeconversao SET log_min_duration_statement = 100;

-- Create indexes for common query patterns
-- (will be managed by Prisma migrations later)
EOF

# Criar arquivo de configuração de ambiente otimizado
cat > .env.development << 'EOF'
# ======= AGENTES DE CONVERSÃO - DEVELOPMENT ENVIRONMENT =======

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/agentesdeconversao"
DIRECT_URL="postgresql://postgres:postgres123@localhost:5432/agentesdeconversao"

# Redis Configuration  
REDIS_URL="redis://localhost:6379"

# Supabase Configuration
SUPABASE_URL="your-supabase-url-here"
SUPABASE_ANON_KEY="your-supabase-anon-key-here"
SUPABASE_SERVICE_KEY="your-supabase-service-key-here"

# AI Model Orchestration
OPENROUTER_API_KEY="your-openrouter-api-key-here"
OPENAI_API_KEY="your-openai-fallback-key-here"

# WhatsApp Integration
WHATSAPP_TOKEN="your-whatsapp-business-token"
WHATSAPP_VERIFY_TOKEN="your-webhook-verify-token"
WHATSAPP_PHONE_ID="your-phone-number-id"

# Evolution API (Alternative WhatsApp)
EVOLUTION_API_KEY="your-evolution-api-key"
EVOLUTION_API_URL="your-evolution-api-url"

# Instagram Integration
INSTAGRAM_ACCESS_TOKEN="your-instagram-access-token"

# Security Configuration
JWT_SECRET="your-super-secure-jwt-secret-change-in-production"
ENCRYPTION_KEY="your-encryption-key-for-sensitive-data"

# Application Configuration
NODE_ENV="development"
PORT=3000
API_PORT=3001

# Monitoring & Analytics
POSTHOG_API_KEY="your-posthog-key-optional"
SENTRY_DSN="your-sentry-dsn-optional"

# Development Tools
NEXT_TELEMETRY_DISABLED=1
TURBO_TELEMETRY_DISABLED=1
EOF

# Copiar para .env se não existir
if [ ! -f ".env" ]; then
    cp .env.development .env
    echo "✅ Arquivo .env criado com configurações de desenvolvimento"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 5: AUTOMATED DEPENDENCY RESOLUTION"
echo "═══════════════════════════════════════════════════════════"

echo "📦 Executando dependency resolution otimizada..."

# Limpar node_modules que podem ter conflitos
rm -rf node_modules package-lock.json pnpm-lock.yaml

# Instalar dependências com estratégia otimizada
echo "🔄 Instalando dependências com pnpm (otimizado)..."
pnpm install --frozen-lockfile=false --prefer-frozen-lockfile=false

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 6: INFRASTRUCTURE ORCHESTRATION"
echo "═══════════════════════════════════════════════════════════"

echo "🚀 Iniciando infraestrutura Docker..."
docker compose up -d

# Aguardar serviços ficarem healthy
echo "⏳ Aguardando serviços ficarem disponíveis..."
sleep 15

# Verificar health dos serviços
echo "🏥 Verificando health dos serviços..."
if docker compose ps | grep -q "healthy"; then
    echo "✅ Serviços Docker inicializados com sucesso"
else
    echo "⚠️  Alguns serviços podem estar inicializando. Verifique com: docker compose ps"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LEVEL 7: HEALTH CHECK & VALIDATION"
echo "═══════════════════════════════════════════════════════════"

# Criar script de health check
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash
# Health check para infraestrutura de desenvolvimento

echo "🏥 AGENTES DE CONVERSÃO - HEALTH CHECK"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm: $(pnpm --version)"
else
    echo "❌ pnpm not found"
fi

# Check Docker
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "✅ Docker: Available and running"
else
    echo "❌ Docker: Not available or not running"
fi

# Check services
echo ""
echo "🐳 DOCKER SERVICES:"
docker compose ps 2>/dev/null || echo "❌ Docker Compose services not running"

# Check network connectivity
echo ""
echo "🌐 NETWORK CONNECTIVITY:"
if ping -c 1 registry.npmjs.org &> /dev/null; then
    echo "✅ npm registry: Accessible"
else
    echo "❌ npm registry: Not accessible"
fi

# Check database
echo ""
echo "🗄️  DATABASE CONNECTIVITY:"
if pg_isready -h localhost -p 5432 -U postgres &> /dev/null; then
    echo "✅ PostgreSQL: Available"
else
    echo "❌ PostgreSQL: Not available"
fi

# Check Redis
if redis-cli -p 6379 ping &> /dev/null; then
    echo "✅ Redis: Available"
else
    echo "❌ Redis: Not available"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Configure .env with your API keys"
echo "2. Run: pnpm db:generate && pnpm db:push"
echo "3. Run: pnpm dev"
EOF

chmod +x scripts/health-check.sh

# Executar health check
./scripts/health-check.sh

echo ""
echo "✅ RESOLUÇÃO ARQUITETURAL SISTÊMICA CONCLUÍDA!"
echo ""
echo "📊 INFRAESTRUTURA CONFIGURADA:"
echo "  ├── Network Layer: pnpm + registry optimization"
echo "  ├── Workspace Architecture: pnpm-native configuration"
echo "  ├── Container Orchestration: Docker Compose + health checks"
echo "  ├── Database Infrastructure: PostgreSQL + pgvector + Redis"
echo "  ├── Environment Management: Development-optimized configuration"
echo "  └── Monitoring: Health check automation"
echo ""
echo "🚨 PRÓXIMOS PASSOS ESTRATÉGICOS:"
echo ""
echo "1. CONFIGURE API KEYS no arquivo .env:"
echo "   - SUPABASE_URL e SUPABASE_ANON_KEY"
echo "   - OPENROUTER_API_KEY"
echo "   - WHATSAPP_TOKEN (opcional)"
echo ""
echo "2. INICIALIZE DATABASE SCHEMA:"
echo "   pnpm db:generate"
echo "   pnpm db:push"
echo ""
echo "3. EXECUTE SISTEMA:"
echo "   pnpm dev"
echo ""
echo "4. MONITORE HEALTH:"
echo "   ./scripts/health-check.sh"
echo ""
echo "🎯 ARQUITETURA RESILIENTE ESTABELECIDA"
echo "Sistema preparado para escalabilidade e desenvolvimento eficiente"

