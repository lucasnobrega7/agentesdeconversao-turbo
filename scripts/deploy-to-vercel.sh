#!/bin/bash

echo "🚀 Iniciando deploy do Agentes de Conversão para Vercel..."

# Verificar se está logado
if ! vercel whoami > /dev/null 2>&1; then
    echo "📝 Por favor, faça login no Vercel:"
    vercel login
fi

# Link do projeto
echo "🔗 Linkando projeto ao Vercel..."
vercel link --yes

# Pull das configurações existentes (se houver)
echo "⬇️ Baixando configurações existentes..."
vercel pull --yes

# Deploy para produção
echo "🚀 Fazendo deploy para produção..."
vercel --prod

echo "✅ Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente no dashboard da Vercel"
echo "2. Configure os domínios customizados (agentesdeconversao.ai)"
echo "3. Teste a aplicação no URL fornecido"