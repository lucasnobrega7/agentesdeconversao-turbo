#!/bin/bash
# Deploy automatizado para produção

echo "🚀 Deploy Agentes de Conversão - Produção"

# 1. Backend - Railway
echo "📦 Fazendo deploy do backend no Railway..."
cd backend
railway up -e production

# 2. Frontend - Vercel
echo "📦 Fazendo deploy do frontend no Vercel..."
cd ../apps/dashboard
vercel --prod

# 3. Evolution API - Railway Template
echo "📱 Evolution API deve ser deployada via:"
echo "   https://railway.app/new/template/LK1WXD"

echo "✅ Deploy concluído!"
