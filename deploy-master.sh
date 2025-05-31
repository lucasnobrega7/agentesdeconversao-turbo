#!/bin/bash
# Deploy Automation Script - Porque fazer manualmente é para amadores
# Author: Claude Code - O Arquiteto de Soluções que vocês precisam

set -e  # Fail fast - porque tolerar erros é para fracos

echo "🎯 Claude Code Deploy Strategy v2.0"
echo "=================================="

# 1. Verificação de Pré-requisitos
echo "📋 Fase 1: Verificação de ambiente..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm i -g vercel@latest
fi

# 2. Limpeza Nuclear
echo "🧹 Fase 2: Limpeza nuclear de artefatos..."
rm -rf .vercel node_modules package-lock.json .turbo deployment-clean

# 3. Isolamento Estratégico
echo "🏗️ Fase 3: Criando ambiente isolado..."
mkdir -p deployment-clean
cp -r apps/web/* deployment-clean/
cp apps/web/.* deployment-clean/ 2>/dev/null || true

# 4. Configuração Otimizada
echo "⚙️ Fase 4: Aplicando configurações otimizadas..."
cat > deployment-clean/vercel.json << 'EOF'
{
  "buildCommand": "npm ci --force --legacy-peer-deps && npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.agentesdeconversao.ai",
    "NEXT_PUBLIC_SUPABASE_URL": "https://faccixlabriqwxkxqprw.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2NpeGxhYnJpcXd4a3hxcHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MTkzNzQsImV4cCI6MjA2Mzk5NTM3NH0.tdlLhD_j1X5qMBNSYVbKgLCEP2Siq0zFVHGxsJFW-DI"
  }
}
EOF

# 5. Deploy Inteligente
echo "🚀 Fase 5: Executando deploy..."
cd deployment-clean
vercel --prod --yes

echo "✅ Deploy completo! Verifique o link acima."
echo "💡 Dica: Configure o Root Directory no Vercel Dashboard para 'apps/web'"