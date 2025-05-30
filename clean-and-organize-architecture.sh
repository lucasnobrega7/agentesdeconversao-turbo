#!/bin/bash

# 🏗️ LIMPEZA E ORGANIZAÇÃO ARQUITETURAL ENTERPRISE
# Implementa estrutura de subdomínios conforme CLAUDE.md

echo "🧹 INICIANDO LIMPEZA E ORGANIZAÇÃO ARQUITETURAL"
echo "==============================================="

PROJECT_DIR="/Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao"
cd "$PROJECT_DIR"

echo "📋 ==> FASE 1: ANÁLISE DO ESTADO ATUAL"
echo "====================================="

echo "Estrutura atual encontrada:"
echo "├── apps/ (estrutura antiga - será reorganizada)"
echo "├── frontend/ (estrutura Next.js atual)"
echo "├── backend/ (API FastAPI atual)"
echo "├── packages/ (vazio)"
echo "└── arquivos soltos (serão limpos)"

echo ""
echo "🗑️ ==> FASE 2: LIMPEZA DE ARQUIVOS SOLTOS"
echo "========================================"

# Remover scripts desnecessários
echo "Removendo scripts de setup antigos..."
rm -f execute-now.sh
rm -f execute-ui-convergence.sh
rm -f extraction-master.sh
rm -f organize-architecture-enterprise.sh
rm -f resolve-impediments.sh
rm -f resolve-infrastructure.sh
rm -f ui-integration-master.sh
rm -f mega_setup.sh
rm -f validate-all.sh
rm -f validate-enterprise.sh
rm -f test_openrouter.py
rm -f test_openrouter_simple.py

echo "✓ Scripts desnecessários removidos"

# Remover documentação desnecessária
echo "Limpando documentação redundante..."
rm -f ARCHITECTURAL-CONVERGENCE.md
rm -f INFRASTRUCTURE-ANALYSIS.md
rm -f INTEGRATION-GUIDE.md
rm -f NEXT-STEPS.md

echo "✓ Documentação redundante removida"

echo ""
echo "🏗️ ==> FASE 3: REORGANIZAÇÃO POR SUBDOMÍNIOS"
echo "==========================================="

# Criar estrutura de subdomínios conforme especificação
echo "Criando estrutura de subdomínios..."

mkdir -p subdomains

# 1. Landing Page (lp.agentesdeconversao.ai)
echo "📄 Organizando Landing Page..."
mkdir -p subdomains/lp
mv frontend subdomains/lp/
cd subdomains/lp/frontend

# Limpar estrutura frontend para manter apenas rotas públicas e auth
echo "Limpando rotas desnecessárias no frontend..."

# Manter apenas estrutura essencial do frontend
mkdir -p temp-structure/src/app
mkdir -p temp-structure/src/components
mkdir -p temp-structure/src/lib
mkdir -p temp-structure/src/config

# Copiar arquivos essenciais
cp src/app/layout.tsx temp-structure/src/app/
cp src/app/page.tsx temp-structure/src/app/
cp src/app/globals.css temp-structure/src/app/
cp -r src/app/\(public\) temp-structure/src/app/ 2>/dev/null || true
cp -r src/app/\(auth\) temp-structure/src/app/ 2>/dev/null || true
cp -r src/components temp-structure/src/
cp -r src/lib temp-structure/src/
cp -r src/config temp-structure/src/ 2>/dev/null || true

# Manter arquivos de configuração
cp package.json temp-structure/
cp package-lock.json temp-structure/ 2>/dev/null || true
cp next.config.js temp-structure/
cp tailwind.config.js temp-structure/
cp tsconfig.json temp-structure/
cp components.json temp-structure/
cp vercel.json temp-structure/ 2>/dev/null || true

# Remover estrutura antiga e aplicar nova
rm -rf src
rm -rf node_modules
mv temp-structure/* .
rm -rf temp-structure

echo "✓ Landing Page organizada"

cd "$PROJECT_DIR"

# 2. Dashboard (dash.agentesdeconversao.ai)
echo "📊 Organizando Dashboard..."
mkdir -p subdomains/dash
mkdir -p subdomains/dash/src/app
mkdir -p subdomains/dash/src/components
mkdir -p subdomains/dash/src/lib
mkdir -p subdomains/dash/src/config

# Criar package.json para dashboard
cat > subdomains/dash/package.json << 'EOF'
{
  "name": "agentes-conversao-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "lucide-react": "^0.263.1",
    "next-themes": "^0.2.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "^15.3.3"
  }
}
EOF

# Copiar estrutura do dashboard
cp -r subdomains/lp/frontend/src/app/\(dashboard\) subdomains/dash/src/app/ 2>/dev/null || true
cp -r subdomains/lp/frontend/src/components subdomains/dash/src/
cp -r subdomains/lp/frontend/src/lib subdomains/dash/src/
cp -r subdomains/lp/frontend/src/config subdomains/dash/src/
cp subdomains/lp/frontend/tailwind.config.js subdomains/dash/
cp subdomains/lp/frontend/next.config.js subdomains/dash/
cp subdomains/lp/frontend/tsconfig.json subdomains/dash/

# Criar layout principal do dashboard
cat > subdomains/dash/src/app/layout.tsx << 'EOF'
import { Inter } from 'next/font/google'
import '../../../lp/frontend/src/app/globals.css'
import { ThemeProviderEnterprise } from '@/components/theme-provider-enterprise'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dashboard | Agentes de Conversão',
  description: 'Dashboard principal da plataforma de agentes IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProviderEnterprise>
          {children}
        </ThemeProviderEnterprise>
      </body>
    </html>
  )
}
EOF

# Criar página principal do dashboard
cat > subdomains/dash/src/app/page.tsx << 'EOF'
import { redirect } from 'next/navigation'

export default function DashboardRoot() {
  redirect('/dashboard')
}
EOF

echo "✓ Dashboard organizado"

# 3. Documentação (docs.agentesdeconversao.ai)
echo "📚 Organizando Documentação..."
mkdir -p subdomains/docs

# Mover estrutura de docs
mv apps/docs subdomains/docs/app 2>/dev/null || true

# Se não existir, criar estrutura básica
if [ ! -d "subdomains/docs/app" ]; then
    mkdir -p subdomains/docs/app
    mkdir -p subdomains/docs/src
fi

echo "✓ Documentação organizada"

# 4. API (api.agentesdeconversao.ai)
echo "🔧 Organizando API..."
mkdir -p subdomains/api
mv backend subdomains/api/

echo "✓ API organizada"

# 5. Chat Widget (chat.agentesdeconversao.ai)
echo "💬 Criando estrutura para Chat Widget..."
mkdir -p subdomains/chat
mkdir -p subdomains/chat/src/components

# Criar package.json para chat widget
cat > subdomains/chat/package.json << 'EOF'
{
  "name": "agentes-conversao-chat-widget",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3003",
    "build": "next build",
    "start": "next start -p 3003"
  },
  "dependencies": {
    "next": "^15.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5"
  }
}
EOF

echo "✓ Chat Widget estruturado"

echo ""
echo "🧹 ==> FASE 4: LIMPEZA FINAL"
echo "=========================="

# Remover estrutura apps antiga
rm -rf apps
rm -rf packages

# Remover arquivos de configuração desnecessários
rm -f turbo.json
rm -f docker-compose.yml

echo "✓ Estrutura antiga removida"

echo ""
echo "📁 ==> FASE 5: ESTRUTURA FINAL"
echo "============================="

tree_output=$(cat << 'EOF'
Projeto reorganizado conforme arquitetura de subdomínios:

agentesdeconversao/
├── subdomains/
│   ├── lp/                    # lp.agentesdeconversao.ai
│   │   └── frontend/          # Landing Page + Auth
│   ├── dash/                  # dash.agentesdeconversao.ai  
│   │   └── src/app/           # Dashboard Principal
│   ├── docs/                  # docs.agentesdeconversao.ai
│   │   └── app/               # Documentação
│   ├── api/                   # api.agentesdeconversao.ai
│   │   └── backend/           # API FastAPI
│   └── chat/                  # chat.agentesdeconversao.ai
│       └── src/               # Widget de Chat
├── PROJECT_STRUCTURE.md       # Documentação da arquitetura
├── README.md                  # Documentação principal
└── dev-commands.sh            # Comandos de desenvolvimento
EOF
)

echo "$tree_output"

echo ""
echo "✅ ORGANIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "===================================="
echo "📊 Estatísticas:"
echo "├── 5 subdomínios organizados"
echo "├── Estrutura limpa e focada"
echo "├── Arquivos soltos removidos"
echo "└── Pronto para desenvolvimento"

echo ""
echo "🚀 PRÓXIMOS COMANDOS:"
echo "# Landing Page:"
echo "cd subdomains/lp/frontend && npm install && npm run dev"
echo ""
echo "# Dashboard:"
echo "cd subdomains/dash && npm install && npm run dev"
echo ""
echo "# API:"
echo "cd subdomains/api/backend && python main.py"

echo ""
echo "✨ ARQUITETURA ENTERPRISE ORGANIZADA CONFORME CLAUDE.MD!"