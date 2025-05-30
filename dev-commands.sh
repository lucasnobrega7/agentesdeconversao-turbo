#!/bin/bash

# 🚀 Scripts de Desenvolvimento - Agentes de Conversão
# Automatização de tarefas comuns do projeto

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Agentes de Conversão - Dev Commands${NC}"
echo "=========================================="

# Função para iniciar desenvolvimento
start_dev() {
    echo -e "${YELLOW}📦 Iniciando ambiente de desenvolvimento...${NC}"
    
    # Backend
    echo -e "${BLUE}🔧 Iniciando Backend (FastAPI)...${NC}"
    cd backend && source venv_clean/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Frontend  
    echo -e "${BLUE}🎨 Iniciando Frontend (Next.js)...${NC}"
    cd ../frontend && npm run dev &
    FRONTEND_PID=$!
    
    echo -e "${GREEN}✅ Serviços iniciados:${NC}"
    echo -e "   Backend:  http://localhost:8000"
    echo -e "   Frontend: http://localhost:3000"
    echo -e "   API Docs: http://localhost:8000/docs"
    
    # Salvar PIDs para cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
}

# Função para parar serviços
stop_dev() {
    echo -e "${YELLOW}⏹️  Parando serviços...${NC}"
    
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null  
        rm .frontend.pid
    fi
    
    echo -e "${GREEN}✅ Serviços parados${NC}"
}

# Função para build completo
build_all() {
    echo -e "${YELLOW}🔨 Build completo do projeto...${NC}"
    
    # Lint e type check frontend
    echo -e "${BLUE}🔍 Lint e type check frontend...${NC}"
    cd frontend && npm run lint && npm run type-check
    
    # Build frontend
    echo -e "${BLUE}📦 Build frontend...${NC}"
    npm run build
    
    # Test backend
    echo -e "${BLUE}🧪 Test backend...${NC}"
    cd ../backend && python -m pytest -v
    
    echo -e "${GREEN}✅ Build completo finalizado${NC}"
}

# Função para análise do projeto
analyze_project() {
    echo -e "${YELLOW}📊 Análise do projeto...${NC}"
    
    echo -e "${BLUE}📁 Estrutura de diretórios:${NC}"
    find . -type d -name "node_modules" -prune -o -type d -print | head -20
    
    echo -e "\n${BLUE}📄 Arquivos por tipo:${NC}"
    echo "TSX: $(find . -name '*.tsx' | wc -l)"
    echo "Python: $(find . -name '*.py' -not -path './backend/venv*' | wc -l)"
    echo "TypeScript: $(find . -name '*.ts' | wc -l)"
    
    echo -e "\n${BLUE}🔌 Endpoints API:${NC}"
    grep -r "@app\." backend/app/ | grep -E "(get|post|put|delete)" | head -10
}

# Função para limpeza
clean_project() {
    echo -e "${YELLOW}🧹 Limpando projeto...${NC}"
    
    # Limpar node_modules e builds
    cd frontend && rm -rf node_modules .next
    
    # Limpar __pycache__
    cd ../backend && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
    
    echo -e "${GREEN}✅ Projeto limpo${NC}"
}

# Menu principal
case "$1" in
    "start")
        start_dev
        ;;
    "stop") 
        stop_dev
        ;;
    "build")
        build_all
        ;;
    "analyze")
        analyze_project
        ;;
    "clean")
        clean_project
        ;;
    *)
        echo -e "${BLUE}Comandos disponíveis:${NC}"
        echo "  start   - Inicia ambiente de desenvolvimento"
        echo "  stop    - Para todos os serviços"
        echo "  build   - Build completo com testes"
        echo "  analyze - Análise da estrutura do projeto"
        echo "  clean   - Limpa cache e builds"
        echo ""
        echo -e "${YELLOW}Exemplo: ./dev-commands.sh start${NC}"
        ;;
esac