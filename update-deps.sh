#!/bin/bash

echo "🚀 Iniciando atualização de dependências vulneráveis..."

# Navegar para o diretório do serviço API onde estão as dependências Python
cd services/api

# Verificar se o ambiente virtual existe, senão criar
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip primeiro
echo "🔧 Atualizando pip..."
pip install --upgrade pip

# Atualizar python-jose para corrigir algoritmo confuso com ECDSA
echo "🔧 Atualizando python-jose..."
pip install "python-jose>=3.3.0" --upgrade

# Atualizar python-multipart para corrigir ReDoS no multipart/form-data
echo "🔧 Atualizando python-multipart..."
pip install "python-multipart>=0.0.6" --upgrade

# Atualizar langchain para corrigir várias vulnerabilidades (DoS, Path Traversal, SSRF, SQLi)
echo "🔧 Atualizando langchain..."
pip install "langchain>=0.1.0" --upgrade

# Atualizar black para corrigir vulnerabilidade de ReDoS
echo "🔧 Atualizando black..."
pip install "black>=24.0.0" --upgrade

# Atualizar fastapi para versão mais segura
echo "🔧 Atualizando fastapi..."
pip install "fastapi>=0.110.0" --upgrade

# Atualizar requests para corrigir vulnerabilidades
echo "🔧 Atualizando requests..."
pip install "requests>=2.32.0" --upgrade

# Atualizar pydantic para versão mais segura
echo "🔧 Atualizando pydantic..."
pip install "pydantic>=2.5.0" --upgrade

# Congelar dependências atualizadas no requirements.txt
echo "🔧 Atualizando requirements.txt..."
pip freeze > requirements.txt

# Voltar ao diretório raiz
cd ../..

echo "✅ Dependências atualizadas com sucesso!"
echo "📝 Verificando se há outras vulnerabilidades..."

# Verificar se npm audit encontra problemas no frontend
if [ -f "package.json" ]; then
    echo "🔧 Verificando vulnerabilidades no frontend..."
    npm audit fix --force
fi

echo "🎉 Processo de atualização concluído!"