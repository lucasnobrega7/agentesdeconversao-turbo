#!/bin/bash
# Setup MCPs para Claude Code - Agentes de Conversão

echo "🚀 Configurando MCPs..."

# Encontrar config
CONFIG="$HOME/.claude.json"
[ -f "$HOME/.claude-code/config.json" ] && CONFIG="$HOME/.claude-code/config.json"

# Backup
[ -f "$CONFIG" ] && cp "$CONFIG" "${CONFIG}.bak"

# Nova configuração
cat > "$CONFIG" << 'EOF'
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "@smithery/desktop-commander", "--key", "efacc737-6736-4551-b8b4-41fb653d4cb4"]
    },
    "toolbox": {
      "command": "npx", 
      "args": ["-y", "@smithery/cli@latest", "run", "@smithery/toolbox", "--key", "efacc737-6736-4551-b8b4-41fb653d4cb4", "--profile", "functional-viper-w7rXy6"]
    },
    "context7-mcp": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "@upstash/context7-mcp", "--key", "efacc737-6736-4551-b8b4-41fb653d4cb4"]
    }
  }
}
EOF
echo "✅ 3 MCPs configurados:"
echo "  • desktop-commander (sistema)"
echo "  • toolbox (docs)"  
echo "  • context7-mcp (contexto)"
echo ""
echo "🔄 Reinicie Claude Code para aplicar"
echo "📍 Config: $CONFIG"