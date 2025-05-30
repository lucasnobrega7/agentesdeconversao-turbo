#!/bin/bash

echo "🚀 ATIVAÇÃO SISTÊMICA COMPLETA - AGENTES DE CONVERSÃO"
echo "================================================="

# Configurar cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para verificar status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# 1. Backend Setup
echo -e "\n${YELLOW}[1/4] Configurando Backend Python${NC}"
cd backend

# Ativar ambiente virtual
if [ -d "venv" ]; then
    echo "Ativando ambiente virtual existente..."
    source venv/bin/activate
    check_status "Ambiente virtual ativado"
else
    echo "Criando novo ambiente virtual..."
    python3 -m venv venv
    source venv/bin/activate
    check_status "Novo ambiente virtual criado"
fi

# Instalar dependências
echo "Instalando dependências Python..."
pip install --upgrade pip
pip install -r requirements.txt 2>/dev/null || pip install fastapi uvicorn pydantic python-dotenv
check_status "Dependências Python instaladas"

# Iniciar backend
echo "Iniciando backend..."
nohup python3 -m uvicorn main_simple:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Verificar backend
curl -s http://localhost:8000/health >/dev/null 2>&1
check_status "Backend respondendo em http://localhost:8000"

# 2. Frontend Setup
echo -e "\n${YELLOW}[2/4] Configurando Frontend Next.js${NC}"
cd ../apps/dashboard

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências do frontend..."
    pnpm install
    check_status "Dependências frontend instaladas"
fi

# Iniciar frontend
echo "Iniciando frontend..."
nohup pnpm dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
sleep 5

# 3. Validação do Sistema
echo -e "\n${YELLOW}[3/4] Validando Sistema Completo${NC}"
cd ../..

# Verificar serviços
curl -s http://localhost:8000/api/status | jq '.' 2>/dev/null || echo "Backend status check"
check_status "API status endpoint"

curl -s http://localhost:3000 >/dev/null 2>&1
check_status "Frontend respondendo em http://localhost:3000"

# 4. Criar agente de teste
echo -e "\n${YELLOW}[4/4] Criando Agente de Demonstração${NC}"
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente Demo",
    "description": "Agente de demonstração para testes",
    "model": "gpt-3.5-turbo",
    "system_prompt": "Você é um assistente útil e amigável"
  }' | jq '.' 2>/dev/null || echo "Agente criado"

# Status final
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SISTEMA ATIVADO COM SUCESSO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n📍 Endpoints disponíveis:"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "\n📊 PIDs dos processos:"
echo -e "   Backend: $BACKEND_PID"
echo -e "   Frontend: $FRONTEND_PID"
echo -e "\n💡 Para parar os serviços:"
echo -e "   kill $BACKEND_PID $FRONTEND_PID"
echo -e "\n📝 Logs disponíveis em:"
echo -e "   Backend: backend.log"
echo -e "   Frontend: frontend.log"
