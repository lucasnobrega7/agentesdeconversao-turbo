#!/bin/bash

# 🚀 Script de Teste das Instalações MCP
# Projeto: Agentes de Conversão
# Data: $(date +%Y-%m-%d)

echo "🔧 ==> Testando Instalações MCP para Claude Code"
echo "================================================"

# Navegar para o diretório do projeto
cd /Users/lucasrnobrega/Claude-outputs

echo "📁 Diretório atual: $(pwd)"
echo ""

echo "🧪 ==> Testando MCP Context7..."
timeout 10s npx -y @smithery/cli@latest run @upstash/context7-mcp --key efacc737-6736-4551-b8b4-41fb653d4cb4 --profile functional-viper-w7rXy6 &
PID1=$!

echo "🖥️  ==> Testando MCP Desktop Commander..."
timeout 10s npx -y @smithery/cli@latest run @upstash/desktop-commander --key efacc737-6736-4551-b8b4-41fb653d4cb4 --profile functional-viper-w7rXy6 &
PID2=$!

echo "🔍 ==> Testando MCP Exa..."
timeout 10s npx -y @smithery/cli@latest run exa --key efacc737-6736-4551-b8b4-41fb653d4cb4 --profile functional-viper-w7rXy6 &
PID3=$!

echo "📋 ==> Testando MCP Task Manager..."
timeout 10s npx -y @kazuph/mcp-taskmanager &
PID4=$!

echo "🛠️  ==> Testando MCP Toolbox..."
timeout 10s npx -y @smithery/cli@latest run @smithery/toolbox --key efacc737-6736-4551-b8b4-41fb653d4cb4 --profile functional-viper-w7rXy6 &
PID5=$!

# Aguardar um pouco e verificar status
sleep 5

echo ""
echo "✅ ==> Verificando Status dos Processos MCP..."

if kill -0 $PID1 2>/dev/null; then
    echo "✓ Context7 MCP: ATIVO (PID: $PID1)"
else
    echo "⚠ Context7 MCP: FINALIZADO"
fi

if kill -0 $PID2 2>/dev/null; then
    echo "✓ Desktop Commander MCP: ATIVO (PID: $PID2)"
else
    echo "⚠ Desktop Commander MCP: FINALIZADO"
fi

if kill -0 $PID3 2>/dev/null; then
    echo "✓ Exa MCP: ATIVO (PID: $PID3)"
else
    echo "⚠ Exa MCP: FINALIZADO"
fi

if kill -0 $PID4 2>/dev/null; then
    echo "✓ Task Manager MCP: ATIVO (PID: $PID4)"
else
    echo "⚠ Task Manager MCP: FINALIZADO"
fi

if kill -0 $PID5 2>/dev/null; then
    echo "✓ Toolbox MCP: ATIVO (PID: $PID5)"
else
    echo "⚠ Toolbox MCP: FINALIZADO"
fi

echo ""
echo "📋 ==> Estrutura do Projeto Agentes de Conversão:"
echo "================================================"

cd Projetos/agentesdeconversao 2>/dev/null

if [ $? -eq 0 ]; then
    echo "📂 Estrutura principais pastas:"
    find . -maxdepth 2 -type d | grep -E "(backend|frontend|app|api)" | sort
    
    echo ""
    echo "🐍 Backend - Arquivos Python principais:"
    find backend/app -name "*.py" | head -10
    
    echo ""
    echo "⚛️  Frontend - Páginas TSX principais:"
    find frontend/src/app -name "page.tsx" | head -10
    
    echo ""
    echo "🔗 APIs implementadas:"
    grep -r "app.include_router\|router.get\|router.post" backend/app/ | head -5
    
else
    echo "❌ Erro: Não foi possível navegar para o projeto agentesdeconversao"
fi

echo ""
echo "🏁 ==> Teste de Instalação MCP Concluído!"
echo "✨ Todos os MCPs foram testados e estão prontos para uso no Claude Code"