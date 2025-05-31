#!/bin/bash

# Script de build personalizado para Vercel - Deploy simplificado
set -e

echo "🚀 Iniciando build para Vercel (apps/web)"

# Navegar para o diretório da aplicação
cd apps/web

# Usar configurações temporárias sem workspace dependencies
echo "📦 Usando configurações simplificadas para deploy..."
cp package.deploy.json package.json
cp tsconfig.deploy.json tsconfig.json

# Instalar dependências com npm
echo "📦 Instalando dependências com npm..."
npm install

# Fazer build
echo "🏗️ Executando build Next.js..."
npm run build

echo "✅ Build concluído com sucesso!"