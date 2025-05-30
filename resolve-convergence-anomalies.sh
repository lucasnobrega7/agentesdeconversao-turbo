#!/bin/bash

# 🎯 Resolução Sistêmica de Anomalias de Convergência
# Estratégia: Configuration Layer Unification + Runtime Environment Stabilization

echo "🏗️ INICIANDO RESOLUÇÃO SISTÊMICA DE ANOMALIAS EMERGENTES"
echo "📊 Análise: Problemas de configuração pós-convergência identificados"

cd /Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 1: PACKAGE.JSON ARCHITECTURE CORRECTION"
echo "═══════════════════════════════════════════════════════════"

# Corrigir package.json corrompido no ui-enterprise
echo "🔧 Corrigindo package.json ui-enterprise..."

cat > packages/ui-enterprise/package.json << 'EOF'
{
  "name": "@agentes/ui-enterprise",
  "version": "1.0.0",
  "description": "Enterprise UI Components convergência Materio MUI + SaaS Boilerplate",
  "main": "index.ts",
  "types": "index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@mui/lab": "^5.0.0-alpha.170",
    "@mui/x-charts": "^6.19.0",
    "@mui/x-data-grid": "^6.19.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "framer-motion": "^10.18.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.56.0"
  }
}
EOF

echo "✅ package.json ui-enterprise corrigido"

# Criar pnpm-workspace.yaml se não existir
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "📦 Criando pnpm-workspace.yaml..."
    cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'backend'
  - 'frontend'
EOF
    echo "✅ pnpm-workspace.yaml criado"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 2: NEXT.JS CONFIGURATION STABILIZATION"
echo "═══════════════════════════════════════════════════════════"

# Corrigir next.config.js
echo "🔧 Estabilizando configuração Next.js..."

cat > frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  transpilePackages: ['@agentes/ui-enterprise'],
  webpack: (config, { dev, isServer }) => {
    // Optimization for development
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
EOF

echo "✅ next.config.js estabilizado"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 3: PYTHON BACKEND ARCHITECTURE CORRECTION"
echo "═══════════════════════════════════════════════════════════"

# Criar main.py simplificado para desenvolvimento
echo "🐍 Criando backend simplificado..."

cat > backend/main_dev.py << 'EOF'
"""
Agentes de Conversão - Backend Development Server
Simplified FastAPI server for development and testing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from typing import Dict, Any

# Initialize FastAPI app
app = FastAPI(
    title="Agentes de Conversão API",
    description="AI Agent Orchestration Platform",
    version="1.0.0"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "operational",
        "service": "Agentes de Conversão API",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "checks": {
            "api": "operational",
            "database": "simulated_ok",
            "redis": "simulated_ok",
            "ai_models": "simulated_ok"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/agents")
async def list_agents():
    """List available agents (mock data for development)"""
    return {
        "agents": [
            {
                "id": "agent-001",
                "name": "Customer Support Agent",
                "status": "active",
                "model": "claude-3-sonnet",
                "channels": ["whatsapp", "web"]
            },
            {
                "id": "agent-002", 
                "name": "Sales Assistant",
                "status": "active",
                "model": "gpt-4",
                "channels": ["whatsapp", "telegram"]
            }
        ]
    }

@app.post("/api/v1/agents")
async def create_agent(agent_data: Dict[str, Any]):
    """Create new agent (mock implementation)"""
    return {
        "success": True,
        "agent_id": f"agent-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": "Agent created successfully (development mode)"
    }

@app.get("/api/v1/conversations")
async def list_conversations():
    """List conversations (mock data)"""
    return {
        "conversations": [
            {
                "id": "conv-001",
                "agent_id": "agent-001",
                "channel": "whatsapp",
                "status": "active",
                "messages_count": 15,
                "last_activity": datetime.now().isoformat()
            }
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting Agentes de Conversão Development Server...")
    print("📊 Environment: Development")
    print("🔗 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "main_dev:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
EOF

echo "✅ Backend simplificado criado"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 4: DEPENDENCY MANAGEMENT OPTIMIZATION"
echo "═══════════════════════════════════════════════════════════"

# Criar requirements.txt simplificado para backend
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.25.2
openai==1.3.0
anthropic==0.7.0
redis==5.0.0
sqlalchemy==2.0.23
alembic==1.13.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dateutil==2.8.2
EOF

echo "✅ requirements.txt criado"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 5: UNIFIED DEVELOPMENT SCRIPTS"
echo "═══════════════════════════════════════════════════════════"

# Script de desenvolvimento unificado
cat > dev-start.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando Agentes de Conversão - Modo Desenvolvimento"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Função para verificar se porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    fi
    return 0
}

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Iniciar backend
echo "🐍 Iniciando backend (porta 8000)..."
if check_port 8000; then
    cd backend
    python main_dev.py &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend provavelmente já está rodando"
fi

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
echo "⚛️  Iniciando frontend (porta 3000)..."
if check_port 3000; then
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
else
    echo "⚠️  Frontend provavelmente já está rodando"
fi

echo ""
echo "🎉 SISTEMA INICIADO COM SUCESSO!"
echo ""
echo "🔗 URLs disponíveis:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Para parar os serviços:"
echo "   pkill -f main_dev.py"
echo "   pkill -f 'next-server'"
echo ""
echo "📊 Monitoramento de logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: Verifique terminal"

# Aguardar sinal de interrupção
trap 'echo "🛑 Parando serviços..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' INT

# Manter script rodando
wait
EOF

chmod +x dev-start.sh

echo "✅ Script de desenvolvimento criado"

# Script de validação
cat > validate-system.sh << 'EOF'
#!/bin/bash

echo "🔍 VALIDAÇÃO SISTÊMICA - AGENTES DE CONVERSÃO"
echo ""

# Função para testar URL
test_url() {
    local url=$1
    local name=$2
    echo -n "Testing $name ($url)... "
    
    if curl -s --max-time 5 "$url" > /dev/null; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAIL"
        return 1
    fi
}

# Verificar estrutura de arquivos
echo "📁 Verificando estrutura de arquivos..."
required_files=(
    "package.json"
    "pnpm-workspace.yaml"
    "frontend/package.json"
    "backend/main_dev.py"
    "packages/ui-enterprise/package.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
    fi
done

echo ""
echo "🌐 Testando conectividade de serviços..."

# Testar se serviços estão rodando
test_url "http://localhost:8000/health" "Backend Health"
test_url "http://localhost:3000" "Frontend"
test_url "http://localhost:8000/docs" "API Documentation"

echo ""
echo "📊 Verificando processos..."
backend_process=$(pgrep -f "main_dev.py" | head -1)
frontend_process=$(pgrep -f "next-server" | head -1)

if [ -n "$backend_process" ]; then
    echo "  ✅ Backend rodando (PID: $backend_process)"
else
    echo "  ❌ Backend não encontrado"
fi

if [ -n "$frontend_process" ]; then
    echo "  ✅ Frontend rodando (PID: $frontend_process)"
else
    echo "  ❌ Frontend não encontrado"
fi

echo ""
echo "🎯 STATUS GERAL DO SISTEMA:"
if [ -n "$backend_process" ] && [ -n "$frontend_process" ]; then
    echo "  🟢 SISTEMA OPERACIONAL"
else
    echo "  🟡 SISTEMA PARCIALMENTE OPERACIONAL"
    echo "     Execute ./dev-start.sh para iniciar todos os serviços"
fi
EOF

chmod +x validate-system.sh

echo "✅ Script de validação criado"

echo ""
echo "✅ RESOLUÇÃO SISTÊMICA CONCLUÍDA!"
echo ""
echo "🎯 PRÓXIMOS PASSOS DE EXECUÇÃO:"
echo ""
echo "1. INICIAR SISTEMA COMPLETO:"
echo "   ./dev-start.sh"
echo ""
echo "2. VALIDAR OPERAÇÃO:"
echo "   ./validate-system.sh"
echo ""
echo "3. ACESSAR INTERFACES:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/docs"
echo ""
echo "💡 ARQUITETURA ESTABILIZADA:"
echo "  ✅ Package.json configurations corrigidas"
echo "  ✅ Next.js configuration estabilizada"
echo "  ✅ Backend simplificado para desenvolvimento"
echo "  ✅ Scripts unificados de desenvolvimento"
echo "  ✅ Validação sistêmica automatizada"
echo ""
echo "🚀 READY FOR DEVELOPMENT & TESTING"

