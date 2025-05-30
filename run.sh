#!/bin/bash
# Roda backend e frontend simultaneamente
echo "🚀 Iniciando Agentes de Conversão..."
trap 'kill $(jobs -p)' EXIT

# Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload &
BACKEND_PID=$!

# Frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Backend rodando em: http://localhost:8000"
echo "✅ Frontend rodando em: http://localhost:3000"
echo "📖 API Docs em: http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para parar..."

wait
