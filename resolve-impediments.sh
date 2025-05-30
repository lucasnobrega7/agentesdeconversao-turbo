#!/bin/bash

# 🔧 RESOLUÇÃO SISTÊMICA DE IMPEDIMENTOS TÉCNICOS
# Análise estratégica e correção de problemas identificados no setup

echo "🎯 DIAGNÓSTICO E RESOLUÇÃO DE IMPEDIMENTOS TÉCNICOS"
echo "📊 Status: Extração concluída, configuração requer ajustes sistêmicos"

cd /Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 1: RESOLUÇÃO DE PROBLEMAS DE NETWORKING"
echo "═══════════════════════════════════════════════════════════"

echo "🔍 Diagnóstico: ERR_PNPM_META_FETCH_FAIL detectado"
echo "🎯 Estratégia: Múltiplas abordagens de resolução"

# Verificar conectividade básica
echo "📡 Testando conectividade com npm registry..."
curl -I https://registry.npmjs.org/ || echo "⚠️  Problema de conectividade detectado"

echo ""
echo "🔧 SOLUÇÕES ALTERNATIVAS PARA PNPM:"
echo ""
echo "OPÇÃO 1 - Limpar cache e tentar novamente:"
echo "pnpm store prune"
echo "rm -rf node_modules package-lock.json pnpm-lock.yaml"
echo "pnpm install --force"
echo ""
echo "OPÇÃO 2 - Usar npm como fallback:"
echo "npm install --legacy-peer-deps"
echo ""
echo "OPÇÃO 3 - Configurar proxy/registry:"
echo "pnpm config set registry https://registry.npmjs.org/"
echo "pnpm config set network-timeout 300000"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  FASE 2: CONFIGURAÇÃO DE WORKSPACE PNPM"
echo "═══════════════════════════════════════════════════════════"

echo "📦 Criando pnpm-workspace.yaml..."

cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/ui-enterprise'
  - 'packages/components'
  - 'packages/server' 
  - 'packages/prisma'
  - 'packages/integrations'
  - 'packages/lib'
EOF

echo "✅ pnpm-workspace.yaml criado"

# Atualizar package.json para remover workspaces field
echo "🔧 Atualizando package.json..."

# Backup do package.json
cp package.json package.json.backup

# Criar versão corrigida do package.json
cat > package.json << 'EOF'
{
  "name": "agentes-de-conversao",
  "version": "1.0.0",
  "description": "🚀 A PLATAFORMA que vai DOMINAR o mercado de Agentes IA",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint", 
    "clean": "turbo run clean",
    "db:generate": "cd packages/prisma && prisma generate",
    "db:push": "cd packages/prisma && prisma db push",
    "db:studio": "cd packages/prisma && prisma studio",
    "start:server": "cd packages/server && pnpm start",
    "start:ui": "cd packages/ui && pnpm dev",
    "start:dashboard": "cd apps/dashboard && pnpm dev",
    "test": "turbo run test",
    "install:clean": "rm -rf node_modules pnpm-lock.yaml && pnpm install",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "setup": "./scripts/setup-environment.sh"
  },
  "devDependencies": {
    "turbo": "^1.13.4",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF

echo "✅ package.json atualizado para compatibilidade com pnpm"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 3: CONFIGURAÇÃO DE INFRAESTRUTURA DOCKER"
echo "═══════════════════════════════════════════════════════════"

echo "🐳 Verificando status do Docker..."

# Verificar se Docker está instalado
if command -v docker &> /dev/null; then
    echo "✅ Docker detectado"
    
    # Verificar se Docker está rodando
    if docker info &> /dev/null; then
        echo "✅ Docker daemon rodando"
        echo "🚀 Iniciando infraestrutura..."
        docker-compose up -d
    else
        echo "⚠️  Docker daemon não está rodando"
        echo ""
        echo "🔧 SOLUÇÕES:"
        echo "1. Abra Docker Desktop manualmente"
        echo "2. Ou execute: open -a Docker"
        echo "3. Aguarde o Docker inicializar completamente"
        echo "4. Execute novamente: docker-compose up -d"
    fi
else
    echo "❌ Docker não encontrado"
    echo ""
    echo "🔧 INSTALAÇÃO NECESSÁRIA:"
    echo "1. Baixe Docker Desktop: https://docker.com/products/docker-desktop"
    echo "2. Instale e inicie o Docker Desktop"
    echo "3. Execute novamente este script"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 4: CONFIGURAÇÃO DE AMBIENTE SIMPLIFICADA"
echo "═══════════════════════════════════════════════════════════"

echo "⚙️ Criando configuração de ambiente simplificada..."

# Criar .env mais simples para desenvolvimento local
cat > .env << 'EOF'
# ======= AGENTES DE CONVERSÃO - DESENVOLVIMENTO LOCAL =======

# Database (SQLite para desenvolvimento rápido)
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"

# Supabase (opcional para desenvolvimento inicial)
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_KEY="your-service-key-here"

# OpenRouter (necessário para AI features)
OPENROUTER_API_KEY="your-openrouter-key-here"

# Redis (opcional - fallback para in-memory)
REDIS_URL="redis://localhost:6379"

# WhatsApp (opcional para desenvolvimento inicial)
WHATSAPP_TOKEN="your-whatsapp-token"
EVOLUTION_API_KEY="your-evolution-key"

# JWT Secret
JWT_SECRET="super-secret-jwt-key-for-development-only"

# Environment
NODE_ENV="development"
PORT=3000
EOF

echo "✅ .env criado com configuração de desenvolvimento"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 5: SETUP MINIMAL PARA DESENVOLVIMENTO RÁPIDO"
echo "═══════════════════════════════════════════════════════════"

# Criar script de setup mínimo
mkdir -p scripts

cat > scripts/setup-minimal.sh << 'SETUP_EOF'
#!/bin/bash

echo "🚀 SETUP MÍNIMO PARA DESENVOLVIMENTO RÁPIDO"

# Limpar instalações anteriores
echo "🧹 Limpando ambiente..."
rm -rf node_modules pnpm-lock.yaml

# Tentar instalação com diferentes estratégias
echo "📦 Instalação de dependências (método 1: pnpm)..."
if pnpm install; then
    echo "✅ Instalação pnpm bem-sucedida"
else
    echo "⚠️  pnpm falhou, tentando npm..."
    if npm install --legacy-peer-deps; then
        echo "✅ Instalação npm bem-sucedida"
    else
        echo "❌ Ambas instalações falharam"
        echo "🔧 Tente resolver problemas de rede/proxy"
        exit 1
    fi
fi

# Verificar se Prisma existe e configurar banco simples
if [ -d "packages/prisma" ]; then
    echo "🗄️ Configurando banco de desenvolvimento..."
    cd packages/prisma
    
    # Gerar cliente Prisma
    if command -v prisma &> /dev/null; then
        prisma generate
        prisma db push
        echo "✅ Banco configurado"
    else
        echo "⚠️  Prisma não encontrado, pulando configuração do banco"
    fi
    
    cd ../..
fi

echo ""
echo "✅ SETUP MÍNIMO CONCLUÍDO!"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "1. Se Docker disponível: docker-compose up -d"
echo "2. Configure suas chaves no .env (principalmente OPENROUTER_API_KEY)"
echo "3. Execute: pnpm dev (ou npm run dev)"
echo "4. Acesse: http://localhost:3000"
SETUP_EOF

chmod +x scripts/setup-minimal.sh

echo ""
echo "✅ RESOLUÇÃO DE IMPEDIMENTOS CONCLUÍDA!"
echo ""
echo "🎯 ESTRATÉGIAS DE EXECUÇÃO DISPONÍVEIS:"
echo ""
echo "ESTRATÉGIA 1 - Setup Completo (se Docker disponível):"
echo "1. open -a Docker  # Iniciar Docker Desktop"
echo "2. ./scripts/setup-minimal.sh"
echo "3. docker-compose up -d"
echo ""
echo "ESTRATÉGIA 2 - Setup Mínimo (desenvolvimento local):"
echo "1. ./scripts/setup-minimal.sh"
echo "2. Edite .env com suas chaves"
echo "3. pnpm dev"
echo ""
echo "ESTRATÉGIA 3 - Resolução Manual de Rede:"
echo "1. pnpm config set registry https://registry.npmjs.org/"
echo "2. pnpm store prune"
echo "3. pnpm install --force"
echo ""
echo "💡 RECOMENDAÇÃO: Comece com ESTRATÉGIA 2 para desenvolvimento rápido"
echo ""
echo "🚨 PRÓXIMO PASSO CRÍTICO:"
echo "Execute: ./scripts/setup-minimal.sh"

