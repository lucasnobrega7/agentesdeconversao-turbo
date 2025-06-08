#!/bin/bash
# Script de inicialização rápida para desenvolvimento

echo "🚀 Iniciando Agentes de Conversão..."

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar dependências
if [[ ! -d "node_modules" ]]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Verificar se portas estão livres
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Porta 3000 em uso. Parando processo..."
    kill -9 $(lsof -ti:3000)
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Porta 8000 em uso. Parando processo..."
    kill -9 $(lsof -ti:8000)
fi

# Iniciar desenvolvimento
echo "🔥 Iniciando servidores de desenvolvimento..."
pnpm dev
