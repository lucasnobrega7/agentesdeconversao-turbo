#!/bin/bash

# 🚀 Script de Inicialização - Agentes de Conversão
# Arquitetura Real: Evolution API + LangChain + MCP + Jarvis

set -e

echo "🤖 Iniciando Agentes de Conversão - Arquitetura Real"
echo "=================================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do exemplo..."
    cp .env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas chaves de API!"
    echo "   Principais variáveis necessárias:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - GOOGLE_API_KEY"
    echo "   - EVOLUTION_API_URL"
    echo "   - EVOLUTION_API_KEY"
    read -p "Pressione Enter após configurar o .env..."
fi

# Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p services/api/app/{api,core,models,services,workers}
mkdir -p services/jarvis/app
mkdir -p apps/web/src/{app,components,lib}
mkdir -p config
mkdir -p data/{postgres,redis,qdrant}

# Verificar se os arquivos de configuração existem
if [ ! -f config/litellm_config.yaml ]; then
    echo "❌ Arquivo config/litellm_config.yaml não encontrado!"
    echo "   Este arquivo é essencial para o funcionamento do LiteLLM."
    exit 1
fi

if [ ! -f config/mcp_config.json ]; then
    echo "❌ Arquivo config/mcp_config.json não encontrado!"
    echo "   Este arquivo é essencial para as integrações MCP."
    exit 1
fi

# Escolher arquivo docker-compose
if [ -f docker-compose.real.yml ]; then
    COMPOSE_FILE="docker-compose.real.yml"
    echo "✅ Usando docker-compose.real.yml (Arquitetura Real)"
else
    COMPOSE_FILE="docker-compose.yml"
    echo "📌 Usando docker-compose.yml padrão"
fi

# Função para aguardar serviço ficar healthy
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Aguardando $service ficar disponível..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            echo "✅ $service está pronto!"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Timeout esperando $service"
    return 1
}

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f $COMPOSE_FILE down

# Construir imagens
echo "🔨 Construindo imagens Docker..."
docker-compose -f $COMPOSE_FILE build

# Iniciar serviços base
echo "🚀 Iniciando serviços base..."
docker-compose -f $COMPOSE_FILE up -d postgres redis

# Aguardar PostgreSQL
wait_for_service "PostgreSQL" 5432

# Aguardar Redis
wait_for_service "Redis" 6379

# Iniciar LiteLLM
echo "🤖 Iniciando LiteLLM Gateway..."
docker-compose -f $COMPOSE_FILE up -d litellm

# Aguardar LiteLLM
wait_for_service "LiteLLM" 4000

# Iniciar Qdrant
echo "🧠 Iniciando Qdrant Vector Database..."
docker-compose -f $COMPOSE_FILE up -d qdrant

# Aguardar Qdrant
wait_for_service "Qdrant" 6333

# Iniciar Backend e Worker
echo "⚙️ Iniciando Backend e Worker..."
docker-compose -f $COMPOSE_FILE up -d backend worker

# Aguardar Backend
wait_for_service "Backend API" 8000

# Iniciar Frontend
echo "🎨 Iniciando Frontend..."
docker-compose -f $COMPOSE_FILE up -d frontend

# Iniciar Evolution API
echo "📱 Iniciando Evolution API..."
docker-compose -f $COMPOSE_FILE up -d evolution

# Iniciar Jarvis
echo "🤖 Iniciando Jarvis AI Manager..."
docker-compose -f $COMPOSE_FILE up -d jarvis

# Iniciar BullBoard
echo "📊 Iniciando BullBoard (Queue Dashboard)..."
docker-compose -f $COMPOSE_FILE up -d bullboard

# Verificar status de todos os serviços
echo ""
echo "📋 Status dos Serviços:"
echo "======================"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "🌐 URLs de Acesso:"
echo "=================="
echo "📱 Frontend (Dashboard): http://localhost:3000"
echo "⚙️ Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🤖 LiteLLM Gateway: http://localhost:4000"
echo "📊 Queue Dashboard: http://localhost:3010"
echo "📱 Evolution API: http://localhost:8080"
echo "🧠 Qdrant UI: http://localhost:6333/dashboard"
echo ""
echo "📝 Próximos Passos:"
echo "==================="
echo "1. Acesse o Evolution API em http://localhost:8080"
echo "2. Crie uma nova instância"
echo "3. Escaneie o QR Code com seu WhatsApp"
echo "4. Configure o webhook para: http://backend:8000/webhooks/evolution"
echo "5. Acesse o Dashboard em http://localhost:3000"
echo ""
echo "💡 Dicas:"
echo "========="
echo "- Ver logs: docker-compose -f $COMPOSE_FILE logs -f [serviço]"
echo "- Parar tudo: docker-compose -f $COMPOSE_FILE down"
echo "- Resetar dados: docker-compose -f $COMPOSE_FILE down -v"
echo ""
echo "🚀 Bom desenvolvimento!"
