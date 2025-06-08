# 🚀 Exemplos de Configuração de MCPs

## Estrutura de Configuração

Cada MCP é configurado através de um arquivo JSON em `~/.mcp/config/`:

```json
{
  "name": "nome-do-mcp",
  "description": "Descrição do MCP",
  "command": "comando-para-executar",
  "args": ["arg1", "arg2"],
  "cwd": "/caminho/de/trabalho",
  "port": 3000,
  "transport": "stdio|sse|websocket",
  "url": "http://localhost:3000",
  "autostart": true,
  "env": {
    "VAR1": "valor1",
    "VAR2": "valor2"
  }
}
```

## Exemplos de MCPs

### 1. OpenAI MCP
```json
{
  "name": "openai",
  "description": "OpenAI API Integration",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-openai"],
  "autostart": true,
  "env": {
    "OPENAI_API_KEY": "sua-chave-aqui"
  }
}
```

### 2. GitHub MCP
```json
{
  "name": "github",
  "description": "GitHub Integration",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "autostart": true,
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "seu-token-aqui"
  }
}
```

### 3. PostgreSQL MCP
```json
{
  "name": "postgres",
  "description": "PostgreSQL Database",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "autostart": false,
  "env": {
    "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost/db"
  }
}
```

### 4. Custom Python MCP
```json
{
  "name": "custom-python",
  "description": "Custom Python MCP Server",
  "command": "python",
  "args": ["server.py"],
  "cwd": "/Users/lucasrnobrega/mcp-servers/custom",
  "port": 8080,
  "transport": "sse",
  "url": "http://localhost:8080/sse",
  "autostart": true
}
```

### 5. Node.js MCP com TypeScript
```json
{
  "name": "custom-node",
  "description": "Custom Node.js MCP",
  "command": "npm",
  "args": ["run", "start:mcp"],
  "cwd": "/Users/lucasrnobrega/projects/my-mcp",
  "port": 3005,
  "autostart": true,
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Como Adicionar um Novo MCP

### Método 1: Usando o comando interativo
```bash
mcp-add meu-novo-mcp
```

### Método 2: Criando arquivo JSON manualmente
```bash
# Criar arquivo de configuração
cat > ~/.mcp/config/meu-mcp.json << EOF
{
  "name": "meu-mcp",
  "description": "Meu MCP personalizado",
  "command": "node",
  "args": ["index.js"],
  "cwd": "/caminho/para/meu-mcp",
  "autostart": true
}
EOF

# Iniciar o MCP
mcp start meu-mcp
```

### Método 3: Copiando template
```bash
# Copiar template existente
cp ~/.mcp/config/graphiti.json ~/.mcp/config/novo-mcp.json

# Editar configuração
mcp-edit novo-mcp
```

## Gerenciamento de MCPs

### Comandos Básicos
```bash
# Listar todos os MCPs
mcp list

# Ver status
mcp status

# Iniciar específico
mcp start graphiti

# Parar todos
mcp stop

# Ver logs em tempo real
mcp logs figma

# Reiniciar
mcp restart graphiti
```

### Configurar Auto-start
```bash
# Editar configuração
mcp-edit nome-do-mcp

# Adicionar "autostart": true ao JSON
```

### Remover MCP
```bash
mcp-remove nome-do-mcp
```

## Troubleshooting

### MCP não inicia
1. Verificar logs: `mcp logs nome-do-mcp`
2. Verificar configuração: `cat ~/.mcp/config/nome-do-mcp.json`
3. Testar comando manualmente: `cd /path && comando args`

### Porta já em uso
1. Verificar processos: `lsof -i :porta`
2. Matar processo: `kill -9 PID`
3. Ou mudar porta na configuração

### Permissões negadas
```bash
chmod +x /caminho/para/executavel
```

## Integração com Claude Desktop

Após configurar MCPs globalmente, atualize `~/.claude.json`:

```json
{
  "mcpServers": {
    "graphiti": {
      "transport": "sse",
      "url": "http://localhost:8000/sse"
    },
    "figma": {
      "command": "mcp",
      "args": ["start", "figma"]
    }
  }
}
```