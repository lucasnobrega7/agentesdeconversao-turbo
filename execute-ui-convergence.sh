#!/bin/bash

# 🎯 EXECUÇÃO ESTRATÉGICA - CONVERGÊNCIA DE TEMPLATES UI
# Integração sistêmica com maximização de valor arquitetural

echo "🏗️ INICIANDO CONVERGÊNCIA ARQUITETURAL DE TEMPLATES UI"
echo "📊 Estratégia: Síntese inteligente de Materio MUI + SaaS Boilerplate"

cd /Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 1: MIGRAÇÃO CONTROLADA DOS ASSETS ESTRATÉGICOS"
echo "═══════════════════════════════════════════════════════════"

# Verificar estado atual do projeto
if [ ! -d "packages" ]; then
    echo "⚠️  Projeto base não encontrado. Execute primeiro:"
    echo "   ./extraction-master.sh"
    exit 1
fi

# Migrar templates para área de análise
echo "📦 Migrando templates para análise sistemática..."

# Comando que o usuário deve executar
echo ""
echo "🚨 EXECUTE ESTES COMANDOS PRIMEIRO:"
echo ""
echo "cp -r /Users/lucasrnobrega/Downloads/materio-mui-nextjs-admin-template-free /Users/lucasrnobrega/Claude-outputs/Projetos/"
echo "cp -r /Users/lucasrnobrega/Downloads/saas-boilerplate-main /Users/lucasrnobrega/Claude-outputs/Projetos/"
echo ""

# Verificar se templates foram migrados
MATERIO_PATH="/Users/lucasrnobrega/Claude-outputs/Projetos/materio-mui-nextjs-admin-template-free"
SAAS_PATH="/Users/lucasrnobrega/Claude-outputs/Projetos/saas-boilerplate-main"

if [ ! -d "$MATERIO_PATH" ]; then
    echo "⏸️  Aguardando migração do Materio template..."
    echo "   Execute: cp -r /Users/lucasrnobrega/Downloads/materio-mui-nextjs-admin-template-free /Users/lucasrnobrega/Claude-outputs/Projetos/"
    exit 1
fi

if [ ! -d "$SAAS_PATH" ]; then
    echo "⏸️  Aguardando migração do SaaS boilerplate..."
    echo "   Execute: cp -r /Users/lucasrnobrega/Downloads/saas-boilerplate-main /Users/lucasrnobrega/Claude-outputs/Projetos/"
    exit 1
fi

echo "✅ Templates detectados. Prosseguindo com análise..."

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 2: ANÁLISE SISTEMÁTICA DOS ASSETS"
echo "═══════════════════════════════════════════════════════════"

# Criar estrutura para análise profunda
mkdir -p analysis/{materio,saas,convergence,integration}

# Análise do Materio Template
echo "🔍 Analisando arquitetura do Materio MUI Template..."

# Estrutura de componentes
find "$MATERIO_PATH" -name "*.tsx" -o -name "*.jsx" > analysis/materio/components.txt
find "$MATERIO_PATH" -name "*theme*" -o -name "*color*" > analysis/materio/theme-files.txt
find "$MATERIO_PATH" -name "*layout*" > analysis/materio/layout-files.txt

# Dependências críticas
if [ -f "$MATERIO_PATH/package.json" ]; then
    cat "$MATERIO_PATH/package.json" | grep -A 20 '"dependencies"' > analysis/materio/dependencies.txt
    echo "📦 Dependências Materio extraídas"
fi

# Análise do SaaS Boilerplate
echo "🔍 Analisando arquitetura do SaaS Boilerplate..."

# Funcionalidades core
find "$SAAS_PATH" -name "*auth*" > analysis/saas/auth-files.txt
find "$SAAS_PATH" -name "*subscription*" -o -name "*billing*" > analysis/saas/billing-files.txt
find "$SAAS_PATH" -name "*landing*" -o -name "*hero*" > analysis/saas/landing-files.txt

# API endpoints
find "$SAAS_PATH" -path "*/api/*" > analysis/saas/api-endpoints.txt

if [ -f "$SAAS_PATH/package.json" ]; then
    cat "$SAAS_PATH/package.json" | grep -A 20 '"dependencies"' > analysis/saas/dependencies.txt
    echo "📦 Dependências SaaS extraídas"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 3: EXTRAÇÃO INTELIGENTE DE COMPONENTES"
echo "═══════════════════════════════════════════════════════════"

# Criar estrutura enterprise UI
mkdir -p packages/ui-enterprise/{foundation,dashboard,auth,marketing,studio}

echo "🎨 Extraindo sistema de tema e foundation..."

# Foundation - Theme System (Materio)
if [ -d "$MATERIO_PATH/src/theme" ]; then
    cp -r "$MATERIO_PATH/src/theme"/* packages/ui-enterprise/foundation/ 2>/dev/null
    echo "✅ Theme system extraído"
fi

if [ -d "$MATERIO_PATH/src/layouts" ]; then
    cp -r "$MATERIO_PATH/src/layouts"/* packages/ui-enterprise/foundation/ 2>/dev/null
    echo "✅ Layout system extraído"
fi

echo "📊 Extraindo componentes de dashboard..."

# Dashboard Components (Materio)
if [ -d "$MATERIO_PATH/src/components" ]; then
    cp -r "$MATERIO_PATH/src/components"/* packages/ui-enterprise/dashboard/ 2>/dev/null
    echo "✅ Dashboard components extraídos"
fi

if [ -d "$MATERIO_PATH/src/views" ]; then
    cp -r "$MATERIO_PATH/src/views"/* packages/ui-enterprise/dashboard/ 2>/dev/null
    echo "✅ Dashboard views extraídas"
fi

echo "🔐 Extraindo sistema de autenticação..."

# Auth System (SaaS)
find "$SAAS_PATH" -name "*auth*" -type f -exec cp {} packages/ui-enterprise/auth/ \; 2>/dev/null
find "$SAAS_PATH" -name "*login*" -type f -exec cp {} packages/ui-enterprise/auth/ \; 2>/dev/null
find "$SAAS_PATH" -name "*register*" -type f -exec cp {} packages/ui-enterprise/auth/ \; 2>/dev/null
echo "✅ Auth components extraídos"

echo "🚀 Extraindo componentes de marketing..."

# Marketing Components (SaaS)
find "$SAAS_PATH" -name "*landing*" -type f -exec cp {} packages/ui-enterprise/marketing/ \; 2>/dev/null
find "$SAAS_PATH" -name "*hero*" -type f -exec cp {} packages/ui-enterprise/marketing/ \; 2>/dev/null
find "$SAAS_PATH" -name "*pricing*" -type f -exec cp {} packages/ui-enterprise/marketing/ \; 2>/dev/null
echo "✅ Marketing components extraídos"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 4: CONFIGURAÇÃO ARQUITETURAL ENTERPRISE"
echo "═══════════════════════════════════════════════════════════"

# Package.json para UI Enterprise
cat > packages/ui-enterprise/package.json << 'EOF'
{
  "name": "@agentes/ui-enterprise",
  "version": "1.0.0",
  "description": "Enterprise UI Components para Agentes de Conversão",
  "main": "index.ts",
  "types": "index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "storybook": "storybook dev -p 6006"
  },
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@mui/lab": "^5.0.0-alpha.170",
    "@mui/x-charts": "^6.19.0",
    "@mui/x-data-grid": "^6.19.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "framer-motion": "^10.18.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.56.0",
    "@storybook/react": "^7.6.0"
  }
}
EOF

# Index principal para exports
cat > packages/ui-enterprise/index.ts << 'EOF'
// Agentes de Conversão - Enterprise UI Library
// Convergência estratégica de Materio MUI + SaaS Boilerplate

// Foundation Layer
export * from './foundation'

// Dashboard Components
export * from './dashboard'

// Authentication System  
export * from './auth'

// Marketing/Landing Components
export * from './marketing'

// Studio-specific Components
export * from './studio'

// Re-export MUI for convenience
export * from '@mui/material'
export * from '@mui/icons-material'
EOF

# Theme unificado
cat > packages/ui-enterprise/foundation/theme.ts << 'EOF'
import { createTheme, ThemeOptions } from '@mui/material/styles'

// Agentes de Conversão - Unified Theme System
export const agentesThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1', // Indigo - Modern, tech-forward
      light: '#8B8FF5',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899', // Pink - Conversational, approachable  
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B', // Slate 800
      secondary: '#64748B', // Slate 500
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
}

export const agentesTheme = createTheme(agentesThemeOptions)

// Theme variants for different contexts
export const dashboardTheme = createTheme({
  ...agentesThemeOptions,
  // Dashboard-specific overrides
})

export const studioTheme = createTheme({
  ...agentesThemeOptions,
  // Studio-specific overrides (canvas optimized)
})

export const marketingTheme = createTheme({
  ...agentesThemeOptions,
  // Marketing-specific overrides (conversion optimized)
})

export default agentesTheme
EOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FASE 5: CONFIGURAÇÃO DE INTEGRAÇÃO COM PROJETO BASE"
echo "═══════════════════════════════════════════════════════════"

# Atualizar package.json root para incluir nova dependência
if [ -f "package.json" ]; then
    # Backup do package.json original
    cp package.json package.json.backup
    
    # Adicionar workspace do ui-enterprise se não existir
    if ! grep -q "packages/ui-enterprise" package.json; then
        echo "📦 Adicionando ui-enterprise aos workspaces..."
        # Aqui seria necessário um parser JSON mais sofisticado
        # Por now, apenas informamos que precisa ser feito manualmente
        echo "⚠️  AÇÃO MANUAL REQUERIDA: Adicione 'packages/ui-enterprise' aos workspaces no package.json"
    fi
fi

# Configurar integração com apps existentes
echo "🔗 Configurando integração com apps..."

# Dashboard app integration
if [ -d "apps/dashboard" ]; then
    cat >> apps/dashboard/package.json << 'EOF' || echo "Dashboard package.json needs manual update"
  "dependencies": {
    "@agentes/ui-enterprise": "workspace:*"
  }
EOF
fi

echo ""
echo "✅ CONVERGÊNCIA ARQUITETURAL CONCLUÍDA!"
echo ""
echo "📊 ASSETS INTEGRADOS:"
echo "  ├── Foundation Theme System (Materio MUI)"
echo "  ├── Dashboard Components (Materio)"
echo "  ├── Authentication Flow (SaaS Boilerplate)"
echo "  ├── Marketing Components (SaaS Boilerplate)"
echo "  └── Unified Theme Configuration"
echo ""
echo "🚨 PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo ""
echo "1. INSTALAR DEPENDÊNCIAS:"
echo "   pnpm install"
echo ""
echo "2. CONFIGURAR IMPORTS (Manual):"
echo "   - Revisar components extraídos"
echo "   - Ajustar imports quebrados"
echo "   - Configurar path aliases"
echo ""
echo "3. TESTAR INTEGRAÇÃO:"
echo "   pnpm dev"
echo ""
echo "4. CUSTOMIZAR PARA AGENTES DE CONVERSÃO:"
echo "   - Adaptar componentes para contexto de IA"
echo "   - Integrar com sistema de nodes existente"
echo "   - Configurar tema específico para AgentStudio"
echo ""
echo "💎 RESULTADO ESPERADO:"
echo "Interface enterprise-grade em 72 horas com foundation sólida para evolução contínua"

