#!/bin/bash
# Deploy Script para Vercel - Porque às vezes você precisa fazer o trabalho do CI/CD você mesmo

echo "🚀 Iniciando deploy isolado para Vercel..."

# Limpa qualquer sujeira anterior
rm -rf /tmp/agentes-deploy

# Cria estrutura isolada
mkdir -p /tmp/agentes-deploy
cp -r apps/web/* /tmp/agentes-deploy/
cp vercel.json /tmp/agentes-deploy/

# Remove qualquer referência ao workspace
find /tmp/agentes-deploy -name "package-lock.json" -delete
find /tmp/agentes-deploy -name ".npmrc" -delete

# Deploy direto do diretório isolado
cd /tmp/agentes-deploy
vercel --prod --yes

# Limpa após deploy
cd -
rm -rf /tmp/agentes-deploy

echo "✅ Deploy concluído (ou falhou espetacularmente - verifique acima)"