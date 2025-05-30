#\!/bin/bash

# 🔥 EXTRACTION MASTER - Script de Dominação UI
echo "🚀 EXTRACTION MASTER - INICIANDO DOMINAÇÃO UI"
echo "=============================================="

PROJECT_DIR="/Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao"
TEMPLATES_DIR="/Users/lucasrnobrega/Claude-outputs/Projetos"

cd "$PROJECT_DIR"

echo "🎯 ==> FASE 1: IDENTIFICAÇÃO DOS ASSETS DE VALOR"
echo "================================================"

# Encontrar templates disponíveis
MATERIO_DIR=$(find "$TEMPLATES_DIR" -name "*materio*" -type d 2>/dev/null | head -1)
SAAS_DIR="$TEMPLATES_DIR/saas-boilerplate-main"

if [ -n "$MATERIO_DIR" ]; then
    echo "✅ Materio MUI encontrado: $MATERIO_DIR"
else
    echo "⚠️ Materio MUI não encontrado"
fi

if [ -d "$SAAS_DIR" ]; then
    echo "✅ SaaS Boilerplate encontrado: $SAAS_DIR"
else
    echo "⚠️ SaaS Boilerplate não encontrado"
fi

echo ""
echo "💎 ==> FASE 2: EXTRAÇÃO CIRÚRGICA DE COMPONENTES"
echo "================================================"

# Criar estrutura enterprise
mkdir -p frontend/src/components/ui-enterprise
mkdir -p frontend/src/themes/material-converged
mkdir -p frontend/src/layouts/dashboard-enterprise
mkdir -p frontend/src/hooks/ui-performance

echo "✓ Estrutura enterprise preparada"

# Extrair Theme System do Materio (se disponível)
if [ -n "$MATERIO_DIR" ]; then
    echo "🎨 Extraindo sistema de tema Materio..."
    
    # Procurar arquivos de tema
    find "$MATERIO_DIR" -name "*theme*" -o -name "*mui*" | while read file; do
        if [[ $file == *.ts ]] || [[ $file == *.tsx ]]; then
            cp "$file" "frontend/src/themes/material-converged/" 2>/dev/null
        fi
    done
    
    # Extrair componentes de dashboard
    echo "📊 Extraindo componentes de dashboard..."
    find "$MATERIO_DIR" -path "*/components/*" -name "*.tsx" | head -20 | while read component; do
        component_name=$(basename "$component")
        cp "$component" "frontend/src/components/ui-enterprise/" 2>/dev/null
        echo "  ✓ $component_name"
    done
fi

# Extrair Auth System do SaaS (se disponível)
if [ -d "$SAAS_DIR" ]; then
    echo "🔐 Extraindo sistema de autenticação SaaS..."
    
    # Procurar componentes de auth
    find "$SAAS_DIR" -name "*auth*" -o -name "*login*" -o -name "*signup*" | head -10 | while read auth_file; do
        if [[ $auth_file == *.tsx ]] || [[ $auth_file == *.ts ]]; then
            auth_name=$(basename "$auth_file")
            cp "$auth_file" "frontend/src/components/ui-enterprise/" 2>/dev/null
            echo "  ✓ $auth_name"
        fi
    done
    
    # Extrair landing pages
    echo "🎯 Extraindo landing pages..."
    find "$SAAS_DIR" -name "*landing*" -o -name "*homepage*" | head -5 | while read landing; do
        if [[ $landing == *.tsx ]] || [[ $landing == *.ts ]]; then
            landing_name=$(basename "$landing")
            cp "$landing" "frontend/src/components/ui-enterprise/" 2>/dev/null
            echo "  ✓ $landing_name"
        fi
    done
fi

echo ""
echo "✅ PRÓXIMOS PASSOS AUTOMÁTICOS:"
echo "1. execute-now.sh - Configuração final"
echo "2. Instalação de dependências otimizada"
echo "3. Build e teste do sistema convergido"

echo ""
echo "🚀 EXTRACTION MASTER CONCLUÍDO COM SUCESSO\!"
SCRIPT_END < /dev/null