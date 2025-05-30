#!/bin/bash

echo "🚀 Iniciando Agentes de Conversão - Modo Desenvolvimento"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Função para verificar se porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    fi
    return 0
}

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Iniciar backend
echo "🐍 Iniciando backend (porta 8000)..."
if check_port 8000; then
    cd backend
    python main_dev.py &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend provavelmente já está rodando"
fi

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
echo "⚛️  Iniciando frontend (porta 3000)..."
if check_port 3000; then
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
else
    echo "⚠️  Frontend provavelmente já está rodando"
fi

echo ""
echo "🎉 SISTEMA INICIADO COM SUCESSO!"
echo ""
echo "🔗 URLs disponíveis:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Para parar os serviços:"
echo "   pkill -f main_dev.py"
echo "   pkill -f 'next-server'"
echo ""
echo "📊 Monitoramento de logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: Verifique terminal"

# Aguardar sinal de interrupção
trap 'echo "🛑 Parando serviços..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' INT

# Manter script rodando
wait
