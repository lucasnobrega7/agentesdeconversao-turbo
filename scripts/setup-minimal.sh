#!/bin/bash

echo "🚀 SETUP MÍNIMO PARA DESENVOLVIMENTO RÁPIDO"

# Limpar instalações anteriores
echo "🧹 Limpando ambiente..."
rm -rf node_modules pnpm-lock.yaml

# Tentar instalação com diferentes estratégias
echo "📦 Instalação de dependências (método 1: pnpm)..."
if pnpm install; then
    echo "✅ Instalação pnpm bem-sucedida"
else
    echo "⚠️  pnpm falhou, tentando npm..."
    if npm install --legacy-peer-deps; then
        echo "✅ Instalação npm bem-sucedida"
    else
        echo "❌ Ambas instalações falharam"
        echo "🔧 Tente resolver problemas de rede/proxy"
        exit 1
    fi
fi

# Verificar se Prisma existe e configurar banco simples
if [ -d "packages/prisma" ]; then
    echo "🗄️ Configurando banco de desenvolvimento..."
    cd packages/prisma
    
    # Gerar cliente Prisma
    if command -v prisma &> /dev/null; then
        prisma generate
        prisma db push
        echo "✅ Banco configurado"
    else
        echo "⚠️  Prisma não encontrado, pulando configuração do banco"
    fi
    
    cd ../..
fi

echo ""
echo "✅ SETUP MÍNIMO CONCLUÍDO!"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "1. Se Docker disponível: docker-compose up -d"
echo "2. Configure suas chaves no .env (principalmente OPENROUTER_API_KEY)"
echo "3. Execute: pnpm dev (ou npm run dev)"
echo "4. Acesse: http://localhost:3000"
