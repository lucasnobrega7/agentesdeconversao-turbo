#!/bin/bash

# ===================================
# DEPLOY MVP - Agentes de Conversão
# ===================================

set -e

echo "🚀 Iniciando deploy do MVP..."

# Verificar se as ferramentas necessárias estão instaladas
command -v railway >/dev/null 2>&1 || { echo "❌ Railway CLI não instalado. Execute: npm install -g @railway/cli"; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI não instalado. Execute: npm install -g vercel"; exit 1; }

# 1. Build do projeto
echo "📦 Building projeto com Turbo..."
pnpm install
pnpm run build:turbo

# 2. Deploy do Backend no Railway
echo "🚂 Deploying Backend no Railway..."
cd services/api

# Criar Dockerfile otimizado se não existir
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run with optimized settings
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EOF
fi

# Deploy no Railway
railway up --detach

cd ../..

# 3. Deploy do Frontend no Vercel
echo "▲ Deploying Frontend no Vercel..."
cd apps/web

# Deploy com Vercel
vercel --prod

cd ../..

# 4. Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."
echo "Por favor, configure as seguintes variáveis em:"
echo "- Railway: https://railway.app/project/[seu-projeto]/settings/variables"
echo "- Vercel: https://vercel.com/[seu-time]/[seu-projeto]/settings/environment-variables"
echo ""
echo "Copie as variáveis de .env.production"

# 5. Verificar deploys
echo "✅ Deploy concluído!"
echo ""
echo "📍 URLs:"
echo "- Frontend: https://dash.agentesdeconversao.ai (configure no Vercel)"
echo "- Backend: https://api.agentesdeconversao.ai (configure no Railway)"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente em ambas plataformas"
echo "2. Configure os domínios customizados"
echo "3. Execute as migrations do Supabase"
echo "4. Teste a integração completa"