#!/bin/bash

# 🚀 Script de Inicialização - Agentes de Conversão
# Arquitetura: FastAPI + Celery + LiteLLM + Supabase + Qdrant

set -e

echo "🤖 Iniciando Agentes de Conversão - Arquitetura Definitiva"
echo "======================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado. Por favor, instale o Docker Compose.${NC}"
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Criando arquivo .env a partir do exemplo...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Por favor, edite o arquivo .env com suas chaves de API!${NC}"
    echo "   Principais variáveis necessárias:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY" 
    echo "   - GOOGLE_API_KEY"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    read -p "Pressione Enter após configurar o .env..."
fi

# Criar diretórios necessários
echo -e "${GREEN}📁 Criando estrutura de diretórios...${NC}"
mkdir -p services/api/app/{api,core,models,services,workers,tasks}
mkdir -p services/gateway/app
mkdir -p apps/web/src/{app,components,lib}
mkdir -p config
mkdir -p data/{postgres,redis,qdrant}

# Verificar arquivos de configuração
if [ ! -f config/litellm_config.yaml ]; then
    echo -e "${RED}❌ config/litellm_config.yaml não encontrado!${NC}"
    exit 1
fi

# Limpar containers antigos
echo -e "${YELLOW}🧹 Limpando containers antigos...${NC}"
docker-compose down

# Função para aguardar serviço
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Aguardando $service na porta $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ $service está pronto!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ Timeout esperando $service${NC}"
    return 1
}

# Build das imagens
echo -e "${GREEN}🔨 Construindo imagens Docker...${NC}"
docker-compose build

# Iniciar serviços base
echo -e "${GREEN}🚀 Iniciando serviços base...${NC}"
docker-compose up -d redis supabase-db qdrant

# Aguardar serviços base
wait_for_service "Redis" 6379
wait_for_service "PostgreSQL" 5432
wait_for_service "Qdrant" 6333

# Iniciar LiteLLM
echo -e "${GREEN}🤖 Iniciando LiteLLM Gateway...${NC}"
docker-compose up -d litellm
wait_for_service "LiteLLM" 4000

# Iniciar Backend e Workers
echo -e "${GREEN}⚙️ Iniciando Backend e Workers...${NC}"
docker-compose up -d backend celery-worker celery-beat jarvis-worker
wait_for_service "Backend API" 8000

# Iniciar Gateway
echo -e "${GREEN}🚪 Iniciando API Gateway...${NC}"
docker-compose up -d gateway
wait_for_service "Gateway" 8080

# Iniciar Frontend
echo -e "${GREEN}🎨 Iniciando Frontend...${NC}"
docker-compose up -d frontend

# Iniciar Evolution API (WhatsApp)
echo -e "${GREEN}📱 Iniciando Evolution API...${NC}"
docker-compose up -d evolution

# Iniciar Flower (Celery Dashboard)
echo -e "${GREEN}🌸 Iniciando Flower Dashboard...${NC}"
docker-compose up -d flower

# Verificar status
echo ""
echo -e "${GREEN}📋 Status dos Serviços:${NC}"
echo "========================"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Sistema iniciado com sucesso!${NC}"
echo ""
echo -e "${GREEN}🌐 URLs de Acesso:${NC}"
echo "=================="
echo "📱 Frontend (Dashboard): http://localhost:3000"
echo "🚪 API Gateway: http://localhost:8080"
echo "⚙️ Backend API (direto): http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🤖 LiteLLM Gateway: http://localhost:4000"
echo "🌸 Celery Dashboard: http://localhost:5555"
echo "📱 Evolution API: http://localhost:8085"
echo "🧠 Qdrant Dashboard: http://localhost:6333/dashboard"
echo ""
echo -e "${GREEN}🔍 Monitoramento Gateway:${NC}"
echo "========================="
echo "📊 Gateway Stats: http://localhost:8080/_gateway/stats"
echo "🏥 Gateway Health: http://localhost:8080/_gateway/health"
echo "📈 Gateway Metrics: http://localhost:8080/metrics"
echo ""
echo -e "${YELLOW}📝 Próximos Passos:${NC}"
echo "==================="
echo "1. Configure o Evolution API em http://localhost:8085"
echo "2. Crie uma instância e escaneie o QR Code"
echo "3. Configure webhook para: http://backend:8000/webhooks/evolution"
echo "4. Acesse o Dashboard em http://localhost:3000"
echo "5. Configure suas integrações (Instagram, Google Drive)"
echo ""
echo -e "${GREEN}💡 Comandos Úteis:${NC}"
echo "=================="
echo "Ver logs: docker-compose logs -f [serviço]"
echo "Parar tudo: docker-compose down"
echo "Resetar dados: docker-compose down -v"
echo "Ver filas Celery: http://localhost:5555 (admin/admin)"
echo ""
echo -e "${GREEN}🚀 Arquitetura pronta para desenvolvimento!${NC}"
