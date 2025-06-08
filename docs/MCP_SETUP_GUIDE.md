# Guia de Configuração das MCPs no Claude Code

## MCPs Instaladas

1. **desktop-commander** - Controle do desktop e sistema de arquivos
2. **context7** - Sistema de arquivos com múltiplos diretórios
3. **toolbox** - Conjunto completo de ferramentas MCP
4. **toolbox-global** - Ferramentas globais incluindo busca na web
5. **filesystem** - Acesso ao sistema de arquivos
6. **github** - Integração com GitHub
7. **memory** - Sistema de memória persistente
8. **sequential-thinking** - Pensamento sequencial estruturado

## Como Usar

1. Execute o script de instalação:
   ```bash
   ./init-mcp-servers.sh
   ```

2. Configure as variáveis de ambiente necessárias:
   - `GITHUB_PERSONAL_ACCESS_TOKEN`: Token de acesso do GitHub
   - `BRAVE_API_KEY`: Chave API do Brave Search (opcional)

3. Reinicie o Claude Code para que as MCPs sejam carregadas

## Verificação

Para verificar se as MCPs estão funcionando, use o comando:
```
/mcp
```

## Solução de Problemas

Se alguma MCP falhar:

1. Verifique se todas as dependências foram instaladas:
   ```bash
   npm list -g | grep modelcontextprotocol
   ```

2. Verifique os logs de erro:
   ```bash
   claude --mcp-debug
   ```

3. Certifique-se de que as permissões de arquivo estão corretas
4. Verifique se as variáveis de ambiente estão configuradas corretamente

## 📋 MCP TaskManager

### Configuração
O servidor já está configurado em seu `claude-code-mcp-config.json` usando a configuração oficial:
```json
{
  "mcp-taskmanager": {
    "command": "npx",
    "args": ["-y", "@kazuph/mcp-taskmanager"]
  }
}
```

### Como Usar

O TaskManager suporta duas fases principais de operação:

#### 1. Fase de Planejamento
Aceita uma lista de tarefas (array de strings) do usuário:
```json
{
  "action": "plan",
  "tasks": ["Tarefa 1", "Tarefa 2", "Tarefa 3"]
}
```
- Armazena tarefas internamente como uma fila
- Retorna um plano de execução (visão geral das tarefas, ID da tarefa, status atual da fila)

#### 2. Fase de Execução
Retorna a próxima tarefa da fila quando solicitado:
```json
{
  "action": "execute",
  "getNext": true
}
```

#### 3. Completar Tarefa
Remove tarefas concluídas da fila:
```json
{
  "action": "complete",
  "taskId": "task-123"
}
```

### Parâmetros Disponíveis

- **action**: "plan" | "execute" | "complete"
- **tasks**: Array de strings de tarefas (obrigatório para ação "plan")
- **taskId**: Identificador da tarefa (obrigatório para ação "complete")
- **getNext**: Flag booleano para solicitar próxima tarefa (para ação "execute")

### Fluxo de Trabalho Típico
1. **Planejar**: Envie uma lista de tarefas para o sistema
2. **Executar**: Solicite a próxima tarefa da fila
3. **Trabalhar**: Execute a tarefa retornada
4. **Completar**: Marque a tarefa como concluída
5. **Repetir**: Continue com a próxima tarefa até a fila estar vazia