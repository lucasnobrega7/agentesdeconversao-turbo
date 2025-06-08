#!/bin/bash

# ===================================
# 🚀 Deploy Produção - Agentes de Conversão
# ===================================

set -e

echo "🚀 Iniciando deploy em produção..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Verificar ferramentas
echo -e "${YELLOW}📋 Verificando ferramentas necessárias...${NC}"

command -v railway >/dev/null 2>&1 || { 
    echo -e "${RED}❌ Railway CLI não instalado.${NC}"
    echo "Execute: npm install -g @railway/cli"
    exit 1
}

command -v vercel >/dev/null 2>&1 || { 
    echo -e "${RED}❌ Vercel CLI não instalado.${NC}"
    echo "Execute: npm install -g vercel"
    exit 1
}

echo -e "${GREEN}✅ Todas ferramentas instaladas${NC}"

# 2. Build do projeto
echo -e "${YELLOW}📦 Building projeto...${NC}"
pnpm install
pnpm run build:turbo

# 3. Deploy Backend (Railway)
echo -e "${YELLOW}🚂 Deploy Backend no Railway...${NC}"
cd services/api

# Login Railway se necessário
railway whoami || railway login

# Link projeto existente ou criar novo
if [ ! -f ".railway/config.json" ]; then
    echo "Criando novo projeto Railway..."
    railway link
fi

# Deploy
railway up --detach

echo -e "${GREEN}✅ Backend deployed${NC}"
cd ../..

# 4. Deploy Frontend (Vercel)
echo -e "${YELLOW}▲ Deploy Frontend no Vercel...${NC}"
cd apps/web

# Deploy produção
vercel --prod --yes

echo -e "${GREEN}✅ Frontend deployed${NC}"
cd ../..

# 5. Instruções finais
echo -e "${GREEN}🎉 Deploy concluído!${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "1. Configure as variáveis de ambiente em ambas plataformas:"
echo "   - Railway: https://railway.app/dashboard"
echo "   - Vercel: https://vercel.com/dashboard"
echo ""
echo "2. Configure os domínios customizados:"
echo "   - api.agentesdeconversao.ai → Railway"
echo "   - dash.agentesdeconversao.ai → Vercel"
echo ""
echo "3. Execute o schema Supabase:"
echo "   - Acesse: https://supabase.com/dashboard"
echo "   - SQL Editor → Execute: services/api/supabase/complete-schema.sql"
echo ""
echo "4. Teste a aplicação:"
echo "   - API Health: https://api.agentesdeconversao.ai/health"
echo "   - Dashboard: https://dash.agentesdeconversao.ai"
echo ""
echo -e "${GREEN}🚀 Sistema pronto para produção!${NC}"