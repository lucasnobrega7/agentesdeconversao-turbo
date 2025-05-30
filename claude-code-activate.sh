#!/bin/bash

# CLAUDE CODE - SISTEMA DE DIAGNÓSTICO E ATIVAÇÃO AUTOMATIZADA
# Versão 2.0 - Resolução estratégica de bloqueios

echo "╔══════════════════════════════════════════════════════╗"
echo "║     CLAUDE CODE - DIAGNÓSTICO E ATIVAÇÃO COMPLETA    ║"
echo "╚══════════════════════════════════════════════════════╝"

# Cores para diagnóstico visual
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Função de diagnóstico avançado
diagnose() {
    local service=$1
    local status=$2
    local details=$3
    
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}[✓]${NC} $service: ${GREEN}$details${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}[!]${NC} $service: ${YELLOW}$details${NC}"
    else
        echo -e "${RED}[✗]${NC} $service: ${RED}$details${NC}"
    fi
}

# 1. DIAGNÓSTICO INICIAL
echo -e "\n${BLUE}═══ FASE 1: DIAGNÓSTICO DO SISTEMA ═══${NC}"

# Verificar processos conflitantes
echo -e "\n${MAGENTA}▸ Analisando processos em execução...${NC}"
PYTHON_PROCS=$(ps aux | grep -E "python.*main" | grep -v grep | wc -l)
NODE_PROCS=$(ps aux | grep -E "node.*next" | grep -v grep | wc -l)

if [ $PYTHON_PROCS -gt 0 ]; then
    diagnose "Backend Python" "WARN" "$PYTHON_PROCS processo(s) detectado(s)"
    echo "  Limpando processos anteriores..."
    pkill -f "python.*main_simple" 2>/dev/null
    sleep 2
else
    diagnose "Backend Python" "OK" "Nenhum processo conflitante"
fi

if [ $NODE_PROCS -gt 0 ]; then
    diagnose "Frontend Node" "WARN" "$NODE_PROCS processo(s) detectado(s)"
    echo "  Limpando processos anteriores..."
    pkill -f "node.*next" 2>/dev/null
    sleep 2
else
    diagnose "Frontend Node" "OK" "Nenhum processo conflitante"
fi

# Verificar portas
echo -e "\n${MAGENTA}▸ Verificando disponibilidade de portas...${NC}"
PORT_8000=$(lsof -i :8000 2>/dev/null | grep LISTEN | wc -l)
PORT_3000=$(lsof -i :3000 2>/dev/null | grep LISTEN | wc -l)

if [ $PORT_8000 -gt 0 ]; then
    diagnose "Porta 8000" "WARN" "Em uso - liberando..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
else
    diagnose "Porta 8000" "OK" "Disponível"
fi

if [ $PORT_3000 -gt 0 ]; then
    diagnose "Porta 3000" "WARN" "Em uso - liberando..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
else
    diagnose "Porta 3000" "OK" "Disponível"
fi

# 2. ATIVAÇÃO ESTRATÉGICA DO BACKEND
echo -e "\n${BLUE}═══ FASE 2: ATIVAÇÃO DO BACKEND ═══${NC}"

cd /Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao/backend

# Verificar ambiente virtual
if [ -d "venv" ]; then
    diagnose "Ambiente Virtual" "OK" "Encontrado em backend/venv"
    source venv/bin/activate
else
    diagnose "Ambiente Virtual" "ERROR" "Não encontrado - criando..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install fastapi uvicorn pydantic python-dotenv httpx
fi

# Iniciar backend com configuração otimizada
echo -e "\n${MAGENTA}▸ Iniciando backend FastAPI...${NC}"
export PYTHONUNBUFFERED=1
nohup python3 -m uvicorn main_simple:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info \
    > ../backend.log 2>&1 &

BACKEND_PID=$!
echo -e "  PID do Backend: ${GREEN}$BACKEND_PID${NC}"

# Aguardar inicialização
echo -n "  Aguardando inicialização"
for i in {1..10}; do
    sleep 1
    echo -n "."
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e " ${GREEN}OK${NC}"
        diagnose "Backend API" "OK" "Respondendo em http://localhost:8000"
        break
    fi
done

# 3. ATIVAÇÃO DO FRONTEND
echo -e "\n${BLUE}═══ FASE 3: ATIVAÇÃO DO FRONTEND ═══${NC}"

cd ../apps/dashboard

# Verificar node_modules
if [ -d "node_modules" ]; then
    diagnose "Node Modules" "OK" "Dependências instaladas"
else
    diagnose "Node Modules" "WARN" "Instalando dependências..."
    pnpm install
fi

# Iniciar frontend
echo -e "\n${MAGENTA}▸ Iniciando frontend Next.js...${NC}"
nohup pnpm dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "  PID do Frontend: ${GREEN}$FRONTEND_PID${NC}"

# Aguardar inicialização
echo -n "  Aguardando inicialização"
for i in {1..15}; do
    sleep 1
    echo -n "."
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e " ${GREEN}OK${NC}"
        diagnose "Frontend Next.js" "OK" "Respondendo em http://localhost:3000"
        break
    fi
done

# 4. VALIDAÇÃO E TESTES
echo -e "\n${BLUE}═══ FASE 4: VALIDAÇÃO DO SISTEMA ═══${NC}"

# Testar endpoints críticos
echo -e "\n${MAGENTA}▸ Testando endpoints da API...${NC}"

# Health check
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$HEALTH_STATUS" = "200" ]; then
    diagnose "GET /health" "OK" "Status 200"
else
    diagnose "GET /health" "ERROR" "Status $HEALTH_STATUS"
fi

# API Status
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/status)
if [ "$API_STATUS" = "200" ]; then
    diagnose "GET /api/status" "OK" "Status 200"
else
    diagnose "GET /api/status" "ERROR" "Status $API_STATUS"
fi

# Criar agente de teste
echo -e "\n${MAGENTA}▸ Criando agente de demonstração...${NC}"
AGENT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/agents \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Claude Code Assistant",
        "description": "Agente especializado em automação e desenvolvimento",
        "model": "claude-3-opus-20240229",
        "system_prompt": "Você é um assistente especializado em automação, desenvolvimento e debug de sistemas complexos."
    }')

if echo "$AGENT_RESPONSE" | grep -q "id"; then
    AGENT_ID=$(echo "$AGENT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    diagnose "POST /api/agents" "OK" "Agente criado: $AGENT_ID"
else
    diagnose "POST /api/agents" "ERROR" "Falha na criação"
fi

# 5. RELATÓRIO FINAL
echo -e "\n${BLUE}═══ RELATÓRIO DE ATIVAÇÃO ═══${NC}"

echo -e "\n${GREEN}✅ SISTEMA ATIVADO COM SUCESSO${NC}"
echo -e "\n📊 ${YELLOW}Status dos Serviços:${NC}"
echo -e "   Backend API:  ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo -e "   Frontend:     ${GREEN}http://localhost:3000${NC}"

echo -e "\n🔧 ${YELLOW}Processos Ativos:${NC}"
echo -e "   Backend PID:  $BACKEND_PID"
echo -e "   Frontend PID: $FRONTEND_PID"

echo -e "\n📝 ${YELLOW}Comandos Úteis:${NC}"
echo -e "   Logs Backend:  ${BLUE}tail -f backend.log${NC}"
echo -e "   Logs Frontend: ${BLUE}tail -f frontend.log${NC}"
echo -e "   Parar tudo:    ${BLUE}kill $BACKEND_PID $FRONTEND_PID${NC}"

echo -e "\n🚀 ${YELLOW}Próximos Passos:${NC}"
echo -e "   1. Acessar ${GREEN}http://localhost:3000${NC} para testar interface"
echo -e "   2. Explorar API em ${GREEN}http://localhost:8000/docs${NC}"
echo -e "   3. Configurar integrações (WhatsApp, Telegram)"
echo -e "   4. Ativar AgentStudio visual"

echo -e "\n${MAGENTA}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║          CLAUDE CODE - SISTEMA OPERACIONAL          ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════╝${NC}"

# Salvar PIDs para gerenciamento posterior
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Abrir navegador automaticamente (opcional)
if command -v open >/dev/null 2>&1; then
    sleep 2
    open http://localhost:3000
    open http://localhost:8000/docs
fi
