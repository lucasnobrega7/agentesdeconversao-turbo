#!/bin/bash
# Deploy Strategy Script - Porque automação inteligente > trabalho manual

echo "🚀 Iniciando deploy estratégico..."

# 1. Isolamento cirúrgico de dependências
echo "📦 Fase 1: Isolamento de dependências..."
cd apps/web
rm -f package-lock.json .npmrc
echo "node-linker=hoisted" > .npmrc
echo "save-exact=true" >> .npmrc

# 2. Instalação limpa sem contaminação workspace
echo "📥 Fase 2: Instalação limpa..."
npm install --force --legacy-peer-deps --no-workspaces

# 3. Verificação de integridade
echo "🔍 Fase 3: Verificação de integridade..."
if grep -q "workspace:" package-lock.json 2>/dev/null; then
  echo "❌ ERRO: Referências workspace detectadas!"
  exit 1
fi

echo "✅ Build pronto para deploy!"