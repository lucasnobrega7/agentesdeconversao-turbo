#!/bin/bash

# Script de configuração automática dos MCPs para Claude Code
# Agentes de Conversão - Projeto One

echo "🚀 Configurando MCPs para Claude Code..."
echo "=========================================="

# Verificar se Claude Code está rodando
if pgrep -f "claude-code" > /dev/null; then
    echo "⚠️  Claude Code está rodando. Parando processo..."
    pkill -f "claude-code"
    sleep 2
fi

# Localizar arquivo de configuração Claude Code
CONFIG_PATHS=(
    "$HOME/.claude-code/config.json"
    "$HOME/.config/claude-code/config.json"
    "$HOME/Library/Application Support/Claude Code/config.json"
    "$HOME/.claude.json"
    "$HOME/claude-code-mcp-config.json"
)

CONFIG_FILE=""
for path in "${CONFIG_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CONFIG_FILE="$path"
        echo "✅ Encontrado arquivo de configuração: $CONFIG_FILE"
        break
    fi
done

if [ -z "$CONFIG_FILE" ]; then
    echo "❌ Arquivo de configuração não encontrado. Criando novo..."
    CONFIG_FILE="$HOME/.claude.json"
fi

# Backup da configuração existente
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📂 Backup criado: ${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Criar nova configuração com todos os MCPs
cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@smithery/desktop-commander",
        "--key",
        "efacc737-6736-4551-b8b4-41fb653d4cb4"
      ]
    },
    "toolbox": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@smithery/toolbox",
        "--key",
        "efacc737-6736-4551-b8b4-41fb653d4cb4",
        "--profile",
        "functional-viper-w7rXy6"
      ]
    },
    "context7-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@upstash/context7-mcp",
        "--key",
        "efacc737-6736-4551-b8b4-41fb653d4cb4"
      ]
    }
  }
}
EOF

echo "✅ Configuração atualizada com 3 MCPs:"
echo "   - desktop-commander (sistema)"
echo "   - toolbox (documentações)"
echo "   - context7-mcp (contexto)"

# Verificar se npx está disponível
if ! command -v npx &> /dev/null; then
    echo "❌ npx não encontrado. Instalando Node.js..."
    if command -v brew &> /dev/null; then
        brew install node
    elif command -v curl &> /dev/null; then
        curl -fsSL https://fnm.vercel.app/install | bash
        source ~/.bashrc
        fnm install --lts
        fnm use lts-latest
    else
        echo "❌ Por favor, instale Node.js manualmente"
        exit 1
    fi
fi

# Pré-instalar dependências MCP
echo "📦 Pré-instalando dependências MCP..."
npx -y @smithery/cli@latest > /dev/null 2>&1 &

# Aguardar um pouco para instalação
sleep 3

echo ""
echo "🎉 Configuração completa!"
echo "=========================================="
echo "📍 Arquivo de configuração: $CONFIG_FILE"
echo ""
echo "🔄 Para aplicar as mudanças:"
echo "1. Feche esta sessão do Claude Code"
echo "2. Reinicie o Claude Code"
echo "3. Os 3 MCPs estarão disponíveis"
echo ""
echo "🛠️  MCPs configurados:"
echo "   • desktop-commander - Operações de sistema"
echo "   • toolbox - Documentações das ferramentas"
echo "   • context7-mcp - Gerenciamento de contexto"
echo ""
echo "✨ Pronto para continuar o projeto Agentes de Conversão!"