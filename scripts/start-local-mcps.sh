#!/bin/bash

# =============================================================================
# Script de Inicialização Automática de MCPs Locais
# Autor: Sistema Agentes de Conversão
# =============================================================================

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório de logs
LOG_DIR="$HOME/.mcp-logs"
mkdir -p "$LOG_DIR"

# Arquivo de PID para controle
PID_FILE="$HOME/.mcp-pids"

echo -e "${GREEN}🚀 Iniciando MCPs locais...${NC}"

# Função para verificar se processo está rodando
is_running() {
    local pid=$1
    if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Função para iniciar serviço
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local log_file="$LOG_DIR/${name}.log"
    
    echo -n "  • Iniciando $name..."
    
    # Verificar se já está rodando
    if [ -f "$PID_FILE.$name" ]; then
        local old_pid=$(cat "$PID_FILE.$name")
        if is_running "$old_pid"; then
            echo -e " ${YELLOW}[JÁ RODANDO]${NC} (PID: $old_pid)"
            return
        fi
    fi
    
    # Iniciar serviço em background
    nohup $command > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE.$name"
    
    # Aguardar inicialização
    sleep 2
    
    if is_running "$pid"; then
        echo -e " ${GREEN}[OK]${NC} (PID: $pid)"
    else
        echo -e " ${RED}[ERRO]${NC}"
        cat "$log_file" | tail -5
    fi
}

# =============================================================================
# 1. Graphiti MCP Server (se existir)
# =============================================================================
GRAPHITI_PATH="/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/scripts/mcps/graphiti-mcp"
if [ -d "$GRAPHITI_PATH" ]; then
    start_service "graphiti-mcp" "cd $GRAPHITI_PATH && python graphiti_mcp_server.py" 8000
fi

# =============================================================================
# 2. Figma MCP Server (se existir)
# =============================================================================
FIGMA_PATH="/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/scripts/mcps/figma-mcp"
if [ -d "$FIGMA_PATH" ] && [ -f "$FIGMA_PATH/package.json" ]; then
    start_service "figma-mcp" "cd $FIGMA_PATH && npm start" 3001
fi

# =============================================================================
# 3. Motion Primitives MCP (se existir)
# =============================================================================
MOTION_PATH="/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/apps/web/src/components/motion-primitives"
if [ -d "$MOTION_PATH" ] && [ -f "$MOTION_PATH/mcp-server.js" ]; then
    start_service "motion-mcp" "cd $MOTION_PATH && node mcp-server.js" 3002
fi

# =============================================================================
# 4. Custom MCP Servers (adicione aqui outros MCPs)
# =============================================================================
# Exemplo:
# start_service "custom-mcp" "cd /path/to/mcp && npm start" 3003

# =============================================================================
# Status Final
# =============================================================================
echo ""
echo -e "${GREEN}📊 Status dos MCPs:${NC}"
echo "─────────────────────────────────────"

# Listar todos os serviços rodando
for pid_file in $PID_FILE.*; do
    if [ -f "$pid_file" ]; then
        service_name=$(basename "$pid_file" | cut -d'.' -f2)
        pid=$(cat "$pid_file")
        if is_running "$pid"; then
            echo -e "  ✅ $service_name: ${GREEN}RODANDO${NC} (PID: $pid)"
        else
            echo -e "  ❌ $service_name: ${RED}PARADO${NC}"
        fi
    fi
done

echo ""
echo -e "${YELLOW}📁 Logs em: $LOG_DIR${NC}"
echo -e "${YELLOW}📌 PIDs em: $HOME/.mcp-pids.*${NC}"