#!/bin/bash

echo "🔍 VALIDAÇÃO SISTÊMICA - AGENTES DE CONVERSÃO"
echo ""

# Função para testar URL
test_url() {
    local url=$1
    local name=$2
    echo -n "Testing $name ($url)... "
    
    if curl -s --max-time 5 "$url" > /dev/null; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAIL"
        return 1
    fi
}

# Verificar estrutura de arquivos
echo "📁 Verificando estrutura de arquivos..."
required_files=(
    "package.json"
    "pnpm-workspace.yaml"
    "frontend/package.json"
    "backend/main_dev.py"
    "packages/ui-enterprise/package.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
    fi
done

echo ""
echo "🌐 Testando conectividade de serviços..."

# Testar se serviços estão rodando
test_url "http://localhost:8000/health" "Backend Health"
test_url "http://localhost:3000" "Frontend"
test_url "http://localhost:8000/docs" "API Documentation"

echo ""
echo "📊 Verificando processos..."
backend_process=$(pgrep -f "main_dev.py" | head -1)
frontend_process=$(pgrep -f "next-server" | head -1)

if [ -n "$backend_process" ]; then
    echo "  ✅ Backend rodando (PID: $backend_process)"
else
    echo "  ❌ Backend não encontrado"
fi

if [ -n "$frontend_process" ]; then
    echo "  ✅ Frontend rodando (PID: $frontend_process)"
else
    echo "  ❌ Frontend não encontrado"
fi

echo ""
echo "🎯 STATUS GERAL DO SISTEMA:"
if [ -n "$backend_process" ] && [ -n "$frontend_process" ]; then
    echo "  🟢 SISTEMA OPERACIONAL"
else
    echo "  🟡 SISTEMA PARCIALMENTE OPERACIONAL"
    echo "     Execute ./dev-start.sh para iniciar todos os serviços"
fi
