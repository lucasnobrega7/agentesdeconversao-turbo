# 🚀 Guia de Configuração MCP - Claude Desktop

## ✅ MCPs Configurados

### 1. **Filesystem** 📁
- **Função**: Acesso e manipulação de arquivos
- **Diretórios configurados**:
  - `/Users/lucasrnobrega/Desktop`
  - `/Users/lucasrnobrega/Downloads`
  - `/Users/lucasrnobrega/Documents`
  - `/Users/lucasrnobrega/Claude-outputs`
  - `/Users/lucasrnobrega/superagent-project`

### 2. **GitHub** 🐙
- **Função**: Integração com repositórios GitHub
- **Token**: Configurado com Personal Access Token
- **Capacidades**: Criar/editar arquivos, issues, PRs, buscar código

### 3. **Supabase** 🗄️
- **Função**: Gerenciamento de banco de dados
- **Projeto**: `jiasbwazaicmcckmehtn`
- **URL**: `https://jiasbwazaicmcckmehtn.supabase.co`

### 4. **Railway** 🚂
- **Função**: Deploy e gerenciamento de aplicações
- **Token**: Configurado com API Token

### 5. **PostgreSQL** 🐘
- **Função**: Conexão direta com banco local
- **Database**: `agentesdeconversao`
- **Host**: `localhost`

### 6. **Desktop Commander** 🖥️
- **Função**: Gerenciamento avançado de arquivos e sistema
- **Provider**: Smithery

### 7. **Toolbox** 🛠️
- **Função**: Utilitários de desenvolvimento
- **Provider**: Smithery
- **Profile**: `functional-viper-w7rXy6`

### 8. **Context7** 📚
- **Função**: Documentação de bibliotecas e frameworks
- **Provider**: Upstash via Smithery

### 9. **Sequential Thinking** 🧠
- **Função**: Raciocínio sequencial e resolução de problemas
- **Provider**: Model Context Protocol

### 10. **21st.dev Magic** ✨
- **Função**: Componentes UI e design
- **API Key**: Configurada

### 11. **Notion** 📝
- **Função**: Integração com workspace Notion
- **Provider**: NotionHQ

### 12. **Playwright** 🎭
- **Função**: Automação de navegador
- **Provider**: Microsoft

### 13. **Puppeteer** 🎪
- **Função**: Automação de navegador alternativa
- **Provider**: Google

### 14. **Figma** 🎨
- **Função**: Integração com designs Figma
- **Provider**: Figma

### 15. **Graphlit** 📊
- **Função**: Processamento de grafos e dados
- **Provider**: Graphlit

### 16. **Omnisearch** 🔍
- **Função**: Busca universal
- **Provider**: Omnisearch

### 17. **OpenAI** 🤖
- **Função**: Integração com APIs OpenAI
- **Provider**: OpenAI

### 18. **Mastra** 📖
- **Função**: Servidor de documentação
- **Provider**: Mastra

### 19. **Everything** 🌐
- **Função**: Utilitários diversos
- **Provider**: Model Context Protocol

## 🔧 Como usar

### Reiniciar Claude Desktop
Após modificar o arquivo `.claude.json`, você deve reiniciar o Claude Desktop:
1. Feche completamente o Claude Desktop
2. Abra novamente o aplicativo
3. Os MCPs serão carregados automaticamente

### Verificar MCPs ativos
No Claude Desktop, você pode verificar os MCPs ativos usando:
- Comando: `/mcp` ou `/permissions`

### Adicionar novos MCPs
```bash
# Via CLI
claude mcp add

# Via JSON
claude mcp add-json <nome> <configuração-json>
```

### Remover MCPs
```bash
claude mcp remove <nome>
```

## 🛡️ Segurança

### Tokens e Chaves
- **GitHub PAT**: Armazenado de forma segura
- **Railway Token**: Protegido no ambiente
- **Supabase Keys**: Anon key configurada
- **API Keys**: Todas as chaves sensíveis estão no ambiente

### Boas Práticas
1. Nunca compartilhe o arquivo `.claude.json` publicamente
2. Faça backup antes de modificações
3. Use tokens com escopo mínimo necessário
4. Rotacione tokens periodicamente

## 📋 Troubleshooting

### MCP não carrega
1. Verifique se o nome do pacote npm está correto
2. Confirme que o Claude Desktop foi reiniciado
3. Verifique logs em: `~/Library/Logs/Claude/`

### Erro de permissão
1. Aceite as permissões quando solicitado
2. Use `/permissions` para gerenciar permissões
3. Verifique se os diretórios têm acesso adequado

### Token inválido
1. Verifique se o token não expirou
2. Confirme que tem as permissões necessárias
3. Gere um novo token se necessário

## 🚀 Comandos Úteis

```bash
# Backup da configuração
cp ~/.claude.json ~/.claude.json.backup

# Verificar configuração
cat ~/.claude.json | jq .mcpServers

# Listar MCPs configurados
cat ~/.claude.json | jq '.mcpServers | keys[]'

# Contar MCPs ativos
cat ~/.claude.json | jq '.mcpServers | length'
```

## 📚 Recursos Adicionais

- [MCP Documentation](https://modelcontextprotocol.org)
- [Claude Desktop Docs](https://docs.anthropic.com/claude-desktop)
- [Smithery Registry](https://smithery.ai)

---

**Última atualização**: Janeiro 2025
**Total de MCPs configurados**: 19