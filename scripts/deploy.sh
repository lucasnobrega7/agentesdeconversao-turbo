#!/bin/bash

set -e

echo "🚀 Deploy Agentes de Conversão"
echo "=============================="

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Menu de opções
echo -e "${YELLOW}Escolha o que deseja fazer:${NC}"
echo "1) Deploy completo (Frontend + Backend)"
echo "2) Deploy apenas Frontend (Vercel)"
echo "3) Deploy apenas Backend (Railway)"
echo "4) Build local"
read -p "Opção: " option

case $option in
  1)
    echo -e "${YELLOW}Iniciando deploy completo...${NC}"
    
    # Build
    pnpm install
    pnpm run build
    
    # Backend
    cd services/api
    railway up --detach
    cd ../..
    
    # Frontend
    cd apps/web
    vercel --prod
    cd ../..
    
    echo -e "${GREEN}✅ Deploy completo realizado!${NC}"
    ;;
    
  2)
    echo -e "${YELLOW}Deploy do Frontend...${NC}"
    cd apps/web
    vercel --prod
    cd ../..
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
    ;;
    
  3)
    echo -e "${YELLOW}Deploy do Backend...${NC}"
    cd services/api
    railway up --detach
    cd ../..
    echo -e "${GREEN}✅ Backend deployed!${NC}"
    ;;
    
  4)
    echo -e "${YELLOW}Build local...${NC}"
    pnpm install
    pnpm run build
    echo -e "${GREEN}✅ Build concluído!${NC}"
    ;;
    
  *)
    echo "Opção inválida"
    exit 1
    ;;
esac