#!/bin/bash

# 🚀 Script de inicialização do ambiente com LiteLLM

echo "🚀 Iniciando Agentes de Conversão com LiteLLM Gateway..."

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando .env.example..."
    cp .env.example .env
    echo "📝 Por favor, configure as chaves de API no arquivo .env"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado"
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p config
mkdir -p data/{postgres,redis,qdrant}

# Verificar se config do LiteLLM existe
if [ ! -f config/litellm_config.yaml ]; then
    echo "❌ Arquivo config/litellm_config.yaml não encontrado"
    echo "📝 Criando configuração padrão..."
    
    # Copiar do serviço se existir
    if [ -f services/litellm/config.yaml ]; then
        cp services/litellm/config.yaml config/litellm_config.yaml
    else
        echo "❌ Configuração do LiteLLM não encontrada"
        exit 1
    fi
fi

# Parar serviços existentes
echo "🛑 Parando serviços existentes..."
docker-compose down

# Limpar volumes antigos (opcional)
read -p "🗑️  Deseja limpar volumes de dados? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "✅ Volumes removidos"
fi

# Build dos serviços
echo "🔨 Construindo serviços..."
docker-compose build

# Iniciar serviços base
echo "🚀 Iniciando serviços base (Redis, Postgres, Qdrant)..."
docker-compose up -d redis supabase-db qdrant

# Aguardar serviços base
echo "⏳ Aguardando serviços base..."
sleep 10

# Iniciar LiteLLM
echo "🤖 Iniciando LiteLLM Gateway..."
docker-compose up -d litellm

# Aguardar LiteLLM
echo "⏳ Aguardando LiteLLM..."
sleep 5

# Verificar health do LiteLLM
echo "🔍 Verificando LiteLLM..."
LITELLM_HEALTH=$(curl -s http://localhost:4000/health || echo "failed")

if [[ $LITELLM_HEALTH == *"healthy"* ]]; then
    echo "✅ LiteLLM está funcionando!"
else
    echo "❌ LiteLLM não está respondendo"
    echo "📋 Logs do LiteLLM:"
    docker-compose logs --tail=20 litellm
    exit 1
fi

# Iniciar backend
echo "🚀 Iniciando Backend API..."
docker-compose up -d backend

# Iniciar gateway
echo "🚀 Iniciando API Gateway..."
docker-compose up -d gateway

# Iniciar workers
echo "👷 Iniciando Celery Workers..."
docker-compose up -d celery-worker celery-beat jarvis-worker

# Iniciar frontend
echo "🎨 Iniciando Frontend..."
docker-compose up -d frontend

# Aguardar todos os serviços
echo "⏳ Aguardando todos os serviços..."
sleep 10

# Status final
echo ""
echo "📊 Status dos Serviços:"
docker-compose ps

echo ""
echo "✅ Ambiente iniciado com sucesso!"
echo ""
echo "🌐 URLs de acesso:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Gateway: http://localhost:8080"
echo "   - Backend API: http://localhost:8000"
echo "   - LiteLLM: http://localhost:4000"
echo "   - Flower (Celery): http://localhost:5555"
echo ""
echo "📚 Documentação:"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - LiteLLM Docs: http://localhost:4000/docs"
echo ""
echo "🧪 Para testar o LiteLLM:"
echo "   python scripts/test_litellm.py"
echo ""
echo "📋 Para ver logs:"
echo "   docker-compose logs -f [serviço]"
echo ""
echo "🛑 Para parar tudo:"
echo "   docker-compose down"
