#!/bin/bash

echo "🔧 Verificando configuração do Vercel..."

# Verificar se está no diretório correto
if [ ! -f "turbo.json" ]; then
    echo "❌ Erro: turbo.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

echo "📋 Configurações atuais do Vercel:"
cat vercel.json | grep -E "(buildCommand|outputDirectory|installCommand)"

echo ""
echo "🚀 Para fazer deploy manual no Vercel:"
echo ""
echo "1. Execute: vercel"
echo "2. Quando perguntado sobre as configurações, use:"
echo "   - Build Command: turbo run build --filter=web"
echo "   - Output Directory: apps/web/.next"
echo "   - Install Command: pnpm install"
echo ""
echo "3. Configure as variáveis de ambiente se necessário"
echo ""
echo "4. Ou faça deploy direto com:"
echo "   vercel --prod"
echo ""
echo "📦 Certificando que pnpm está instalado..."
pnpm --version || npm install -g pnpm@latest

echo ""
echo "✅ Pronto para deploy!"