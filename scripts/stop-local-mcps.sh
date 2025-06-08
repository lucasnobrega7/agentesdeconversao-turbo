#!/bin/bash

# =============================================================================
# Script para Parar MCPs Locais
# Autor: Sistema Agentes de Conversão
# =============================================================================

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Arquivo de PID
PID_FILE="$HOME/.mcp-pids"

echo -e "${YELLOW}🛑 Parando MCPs locais...${NC}"

# Função para parar serviço
stop_service() {
    local pid_file=$1
    local service_name=$(basename "$pid_file" | cut -d'.' -f2)
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        echo -n "  • Parando $service_name (PID: $pid)..."
        
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            sleep 1
            
            # Forçar parada se necessário
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid"
            fi
            
            echo -e " ${GREEN}[PARADO]${NC}"
        else
            echo -e " ${YELLOW}[NÃO ESTAVA RODANDO]${NC}"
        fi
        
        rm -f "$pid_file"
    fi
}

# Parar todos os serviços
for pid_file in $PID_FILE.*; do
    if [ -f "$pid_file" ]; then
        stop_service "$pid_file"
    fi
done

echo ""
echo -e "${GREEN}✅ Todos os MCPs foram parados.${NC}"