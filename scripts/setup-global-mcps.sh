#!/bin/bash

# =============================================================================
# Setup Global de MCPs com Auto-inicialização
# Autor: Sistema Agentes de Conversão
# =============================================================================

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Setup Global de MCPs - OneMCP          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Diretório global para MCPs
GLOBAL_MCP_DIR="/Users/lucasrnobrega/.mcp"
GLOBAL_MCP_SERVERS="$GLOBAL_MCP_DIR/servers"
GLOBAL_MCP_LOGS="$GLOBAL_MCP_DIR/logs"
GLOBAL_MCP_CONFIG="$GLOBAL_MCP_DIR/config"

# Criar estrutura de diretórios
echo -e "${YELLOW}📁 Criando estrutura de diretórios...${NC}"
mkdir -p "$GLOBAL_MCP_SERVERS"
mkdir -p "$GLOBAL_MCP_LOGS"
mkdir -p "$GLOBAL_MCP_CONFIG"

# =============================================================================
# 1. Criar script de gerenciamento global
# =============================================================================
echo -e "${YELLOW}📝 Criando script de gerenciamento global...${NC}"

cat > "$GLOBAL_MCP_DIR/mcp-manager.sh" << 'EOF'
#!/bin/bash

# MCP Manager - Gerenciador Global de MCPs
GLOBAL_MCP_DIR="/Users/lucasrnobrega/.mcp"
GLOBAL_MCP_SERVERS="$GLOBAL_MCP_DIR/servers"
GLOBAL_MCP_LOGS="$GLOBAL_MCP_DIR/logs"
GLOBAL_MCP_CONFIG="$GLOBAL_MCP_DIR/config"
PID_FILE="$GLOBAL_MCP_DIR/.pids"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções auxiliares
is_running() {
    local pid=$1
    [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1
}

start_mcp() {
    local name=$1
    local config_file="$GLOBAL_MCP_CONFIG/${name}.json"
    
    if [ ! -f "$config_file" ]; then
        echo -e "${RED}❌ Configuração não encontrada: $config_file${NC}"
        return 1
    fi
    
    # Ler configuração
    local command=$(jq -r '.command' "$config_file")
    local args=$(jq -r '.args[]' "$config_file" 2>/dev/null | tr '\n' ' ')
    local cwd=$(jq -r '.cwd // "."' "$config_file")
    local port=$(jq -r '.port // ""' "$config_file")
    
    echo -n "  • Iniciando $name..."
    
    # Verificar se já está rodando
    if [ -f "$PID_FILE.$name" ]; then
        local old_pid=$(cat "$PID_FILE.$name")
        if is_running "$old_pid"; then
            echo -e " ${YELLOW}[JÁ RODANDO]${NC} (PID: $old_pid)"
            return 0
        fi
    fi
    
    # Iniciar serviço
    local log_file="$GLOBAL_MCP_LOGS/${name}.log"
    cd "$cwd" && nohup $command $args > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE.$name"
    
    sleep 2
    
    if is_running "$pid"; then
        echo -e " ${GREEN}[OK]${NC} (PID: $pid)"
        [ -n "$port" ] && echo -e "    ${BLUE}→ Porta: $port${NC}"
        return 0
    else
        echo -e " ${RED}[ERRO]${NC}"
        tail -5 "$log_file"
        return 1
    fi
}

stop_mcp() {
    local name=$1
    local pid_file="$PID_FILE.$name"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        echo -n "  • Parando $name (PID: $pid)..."
        
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            sleep 1
            
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid"
            fi
            
            echo -e " ${GREEN}[PARADO]${NC}"
        else
            echo -e " ${YELLOW}[NÃO ESTAVA RODANDO]${NC}"
        fi
        
        rm -f "$pid_file"
    else
        echo -e "  • $name: ${YELLOW}não estava rodando${NC}"
    fi
}

status_mcp() {
    local name=$1
    local pid_file="$PID_FILE.$name"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if is_running "$pid"; then
            local config_file="$GLOBAL_MCP_CONFIG/${name}.json"
            local port=$(jq -r '.port // ""' "$config_file" 2>/dev/null)
            echo -e "  ✅ $name: ${GREEN}RODANDO${NC} (PID: $pid)"
            [ -n "$port" ] && echo -e "     → Porta: $port"
        else
            echo -e "  ❌ $name: ${RED}PARADO${NC}"
        fi
    else
        echo -e "  ⚪ $name: ${YELLOW}não inicializado${NC}"
    fi
}

# Comandos principais
case "$1" in
    start)
        if [ -z "$2" ]; then
            echo -e "${GREEN}🚀 Iniciando todos os MCPs...${NC}"
            for config in "$GLOBAL_MCP_CONFIG"/*.json; do
                [ -f "$config" ] && start_mcp "$(basename "$config" .json)"
            done
        else
            start_mcp "$2"
        fi
        ;;
        
    stop)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}🛑 Parando todos os MCPs...${NC}"
            for pid_file in $PID_FILE.*; do
                [ -f "$pid_file" ] && stop_mcp "$(basename "$pid_file" | cut -d'.' -f2)"
            done
        else
            stop_mcp "$2"
        fi
        ;;
        
    restart)
        $0 stop "$2"
        sleep 1
        $0 start "$2"
        ;;
        
    status)
        echo -e "${BLUE}📊 Status dos MCPs:${NC}"
        echo "─────────────────────────────────"
        if [ -z "$2" ]; then
            for config in "$GLOBAL_MCP_CONFIG"/*.json; do
                [ -f "$config" ] && status_mcp "$(basename "$config" .json)"
            done
        else
            status_mcp "$2"
        fi
        ;;
        
    logs)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}📄 Logs disponíveis:${NC}"
            ls -la "$GLOBAL_MCP_LOGS"
        else
            if [ -f "$GLOBAL_MCP_LOGS/$2.log" ]; then
                tail -f "$GLOBAL_MCP_LOGS/$2.log"
            else
                echo -e "${RED}Log não encontrado: $2${NC}"
            fi
        fi
        ;;
        
    list)
        echo -e "${BLUE}📋 MCPs configurados:${NC}"
        for config in "$GLOBAL_MCP_CONFIG"/*.json; do
            if [ -f "$config" ]; then
                local name=$(basename "$config" .json)
                local desc=$(jq -r '.description // "Sem descrição"' "$config")
                echo -e "  • ${GREEN}$name${NC}: $desc"
            fi
        done
        ;;
        
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|list} [nome-mcp]"
        echo ""
        echo "Comandos:"
        echo "  start [nome]    - Inicia MCP(s)"
        echo "  stop [nome]     - Para MCP(s)"
        echo "  restart [nome]  - Reinicia MCP(s)"
        echo "  status [nome]   - Mostra status"
        echo "  logs [nome]     - Mostra logs"
        echo "  list            - Lista MCPs configurados"
        exit 1
        ;;
esac
EOF

chmod +x "$GLOBAL_MCP_DIR/mcp-manager.sh"

# =============================================================================
# 2. Criar configurações para MCPs existentes
# =============================================================================
echo -e "${YELLOW}📋 Criando configurações para MCPs...${NC}"

# Graphiti MCP
if [ -d "/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/scripts/mcps/graphiti-mcp" ]; then
    cat > "$GLOBAL_MCP_CONFIG/graphiti.json" << EOF
{
  "name": "graphiti",
  "description": "Graphiti Knowledge Graph MCP",
  "command": "python",
  "args": ["graphiti_mcp_server.py"],
  "cwd": "/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/scripts/mcps/graphiti-mcp",
  "port": 8000,
  "transport": "sse",
  "url": "http://localhost:8000/sse"
}
EOF
    echo -e "  ✅ Graphiti MCP configurado"
fi

# Figma MCP
if [ -d "/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/scripts/mcps/figma-mcp" ]; then
    cat > "$GLOBAL_MCP_CONFIG/figma.json" << EOF
{
  "name": "figma",
  "description": "Figma Design Integration MCP",
  "command": "node",
  "args": ["dist/index.js"],
  "cwd": "/Users/lucasrnobrega/Claude-outputs/agentesdeconversao/scripts/mcps/figma-mcp",
  "port": 3001,
  "transport": "stdio"
}
EOF
    echo -e "  ✅ Figma MCP configurado"
fi

# =============================================================================
# 3. Criar aliases globais
# =============================================================================
echo -e "${YELLOW}🔧 Criando aliases globais...${NC}"

# Criar ou atualizar arquivo de aliases
cat > "/Users/lucasrnobrega/.mcp-aliases" << 'EOF'
# MCP Global Aliases
alias mcp="/Users/lucasrnobrega/.mcp/mcp-manager.sh"
alias mcp-start="/Users/lucasrnobrega/.mcp/mcp-manager.sh start"
alias mcp-stop="/Users/lucasrnobrega/.mcp/mcp-manager.sh stop"
alias mcp-restart="/Users/lucasrnobrega/.mcp/mcp-manager.sh restart"
alias mcp-status="/Users/lucasrnobrega/.mcp/mcp-manager.sh status"
alias mcp-logs="/Users/lucasrnobrega/.mcp/mcp-manager.sh logs"
alias mcp-list="/Users/lucasrnobrega/.mcp/mcp-manager.sh list"

# Funções auxiliares
mcp-add() {
    local name=$1
    local config_file="/Users/lucasrnobrega/.mcp/config/${name}.json"
    
    if [ -z "$name" ]; then
        echo "Uso: mcp-add <nome>"
        return 1
    fi
    
    echo "Criando configuração para $name..."
    echo "Digite o comando para executar:"
    read command
    echo "Digite o diretório de trabalho:"
    read cwd
    echo "Digite a porta (opcional):"
    read port
    echo "Digite uma descrição:"
    read description
    
    cat > "$config_file" << EOF
{
  "name": "$name",
  "description": "$description",
  "command": "$command",
  "args": [],
  "cwd": "$cwd",
  "port": "$port"
}
EOF
    
    echo "✅ MCP $name adicionado!"
}

mcp-remove() {
    local name=$1
    
    if [ -z "$name" ]; then
        echo "Uso: mcp-remove <nome>"
        return 1
    fi
    
    mcp stop "$name"
    rm -f "/Users/lucasrnobrega/.mcp/config/${name}.json"
    echo "✅ MCP $name removido!"
}

mcp-edit() {
    local name=$1
    local config_file="/Users/lucasrnobrega/.mcp/config/${name}.json"
    
    if [ -z "$name" ]; then
        echo "Uso: mcp-edit <nome>"
        return 1
    fi
    
    if [ -f "$config_file" ]; then
        ${EDITOR:-nano} "$config_file"
    else
        echo "❌ MCP $name não encontrado!"
    fi
}
EOF

# =============================================================================
# 4. Adicionar ao .zshrc para auto-inicialização
# =============================================================================
echo -e "${YELLOW}🔄 Configurando auto-inicialização...${NC}"

# Criar script de auto-start
cat > "$GLOBAL_MCP_DIR/auto-start.sh" << 'EOF'
#!/bin/bash
# Auto-start MCPs configurados com autostart=true

GLOBAL_MCP_CONFIG="/Users/lucasrnobrega/.mcp/config"

for config in "$GLOBAL_MCP_CONFIG"/*.json; do
    if [ -f "$config" ]; then
        autostart=$(jq -r '.autostart // false' "$config")
        if [ "$autostart" = "true" ]; then
            name=$(basename "$config" .json)
            /Users/lucasrnobrega/.mcp/mcp-manager.sh start "$name" >/dev/null 2>&1
        fi
    fi
done
EOF

chmod +x "$GLOBAL_MCP_DIR/auto-start.sh"

# Adicionar ao .zshrc
echo -e "${YELLOW}📝 Atualizando .zshrc...${NC}"

# Verificar se já existe configuração MCP
if ! grep -q "# MCP Global Configuration" "/Users/lucasrnobrega/.zshrc"; then
    cat >> "/Users/lucasrnobrega/.zshrc" << 'EOF'

# =============================================================================
# MCP Global Configuration
# =============================================================================
# Carregar aliases MCP
[ -f "/Users/lucasrnobrega/.mcp-aliases" ] && source "/Users/lucasrnobrega/.mcp-aliases"

# Auto-iniciar MCPs configurados
if [ -f "/Users/lucasrnobrega/.mcp/auto-start.sh" ]; then
    /Users/lucasrnobrega/.mcp/auto-start.sh &
fi

# Mostrar status dos MCPs ao iniciar terminal
if command -v mcp >/dev/null 2>&1; then
    echo ""
    mcp status
    echo ""
fi
EOF
    echo -e "  ✅ .zshrc atualizado"
else
    echo -e "  ⚠️  .zshrc já contém configuração MCP"
fi

# =============================================================================
# 5. Configurar MCPs para auto-start
# =============================================================================
echo -e "${YELLOW}🚀 Configurando MCPs para auto-start...${NC}"

# Adicionar flag autostart nas configurações
for config in "$GLOBAL_MCP_CONFIG"/*.json; do
    if [ -f "$config" ]; then
        # Adicionar autostart=true se não existir
        jq '. + {autostart: true}' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    fi
done

# =============================================================================
# 6. Instruções finais
# =============================================================================
echo ""
echo -e "${GREEN}✅ Setup Global de MCPs concluído!${NC}"
echo ""
echo -e "${BLUE}📋 Comandos disponíveis:${NC}"
echo "  mcp start         - Inicia todos os MCPs"
echo "  mcp stop          - Para todos os MCPs"
echo "  mcp status        - Mostra status dos MCPs"
echo "  mcp logs <nome>   - Mostra logs de um MCP"
echo "  mcp list          - Lista MCPs configurados"
echo ""
echo "  mcp-add <nome>    - Adiciona novo MCP"
echo "  mcp-remove <nome> - Remove um MCP"
echo "  mcp-edit <nome>   - Edita configuração de MCP"
echo ""
echo -e "${YELLOW}⚡ Para ativar agora:${NC}"
echo "  source ~/.zshrc"
echo ""
echo -e "${GREEN}🎉 Os MCPs serão iniciados automaticamente"
echo "   ao abrir um novo terminal!${NC}"