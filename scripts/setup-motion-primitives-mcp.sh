#!/bin/bash
CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

cat > "$CONFIG_PATH" << 'EOF'
{
  "mcpServers": {
    "motion-primitives": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://gitmcp.io/ibelick/motion-primitives"
      ]
    }
  }
}
EOF

echo "Configuração MCP instalada com sucesso!"