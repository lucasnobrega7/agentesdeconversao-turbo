#!/bin/bash

echo "🚀 Iniciando deploy Turborepo para Vercel..."

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não está instalado. Instalando..."
    npm install -g pnpm@9.0.0
fi

# Limpar cache e builds anteriores
echo "🧹 Limpando cache e builds anteriores..."
rm -rf .turbo
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf apps/*/.next
rm -rf packages/*/node_modules

# Instalar dependências
echo "📦 Instalando dependências com pnpm..."
pnpm install

# Build do projeto
echo "🏗️ Building projeto..."
pnpm build

echo "✅ Build concluído com sucesso!"
echo ""
echo "📋 Próximos passos para deploy no Vercel:"
echo "1. Faça commit e push das alterações"
echo "2. No Vercel, importe o projeto do GitHub"
echo "3. Configure as seguintes opções:"
echo "   - Framework Preset: Next.js"
echo "   - Build Command: turbo run build --filter=web"
echo "   - Output Directory: apps/web/.next"
echo "   - Install Command: pnpm install"
echo "4. Configure as variáveis de ambiente necessárias"
echo "5. Deploy!"