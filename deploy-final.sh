#!/bin/bash
# Deploy Definitivo - By Claude Code
# Porque repetir erros é para amadores

set -euo pipefail  # Fail fast com estilo

echo "🎯 Deploy Strategy Final - Claude Code Edition"
echo "============================================="

# Configuração de ambiente
PROJECT_NAME="agentesdeconversao"
NODE_VERSION="20.x"

echo "📋 Configurando projeto principal no Vercel..."

# 1. Remove projetos fantasmas
echo "🧹 Limpando projetos duplicados..."
vercel remove deployment-clean --yes 2>/dev/null || true

# 2. Garante que estamos no projeto correto
cd /Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao
rm -rf .vercel

# 3. Link com o projeto principal
echo "🔗 Linkando ao projeto principal..."
vercel link --project=$PROJECT_NAME --yes

# 4. Configura o projeto via API (porque GUI é para mortais)
echo "⚙️ Configurando projeto no Vercel..."
vercel env add NODE_VERSION $NODE_VERSION --yes production 2>/dev/null || true

# 5. Deploy direto do root com configurações corretas
echo "🚀 Executando deploy estratégico..."
vercel --prod \
  --build-env NODE_VERSION=$NODE_VERSION \
  --env NODE_VERSION=$NODE_VERSION \
  --force

echo "✅ Deploy completo!"
echo "💡 Próximo passo: Configure Root Directory para 'apps/web' no Dashboard"
echo "🔗 https://vercel.com/agentesdeconversao/agentesdeconversao/settings"