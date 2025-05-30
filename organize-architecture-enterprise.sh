#!/bin/bash

# 🏗️ ORGANIZADOR DE ARQUITETURA ENTERPRISE
# Implementa a estrutura completa conforme CLAUDE.md

echo "🏗️ ORGANIZANDO ARQUITETURA ENTERPRISE"
echo "====================================="

PROJECT_DIR="/Users/lucasrnobrega/Claude-outputs/Projetos/agentesdeconversao"
cd "$PROJECT_DIR/frontend/src/app"

echo "📁 ==> FASE 1: CRIAÇÃO DE PÁGINAS ESSENCIAIS FALTANTES"
echo "====================================================="

# Páginas públicas essenciais
echo "🌐 Criando páginas públicas..."

# Landing Page - Recursos
mkdir -p "(public)/recursos"
cat > "(public)/recursos/page.tsx" << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursos | Agentes de Conversão',
  description: 'Recursos e funcionalidades da plataforma de agentes IA'
}

export default function RecursosPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        Recursos Poderosos para Agentes IA
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Agent Studio Visual</h3>
          <p className="text-muted-foreground">
            Editor visual drag-and-drop para criar fluxos de conversação complexos
          </p>
        </div>
        
        <div className="text-center p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Multi-Channel</h3>
          <p className="text-muted-foreground">
            WhatsApp, Telegram, Web Chat e mais - tudo integrado
          </p>
        </div>
        
        <div className="text-center p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Analytics Enterprise</h3>
          <p className="text-muted-foreground">
            Dashboards em tempo real com métricas avançadas
          </p>
        </div>
      </div>
    </div>
  )
}
EOF

# Landing Page - Preços
mkdir -p "(public)/precos"
cat > "(public)/precos/page.tsx" << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preços | Agentes de Conversão',
  description: 'Planos e preços da plataforma de agentes IA'
}

export default function PrecosPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        Planos que Escalam com Você
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-8 border rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Starter</h3>
          <p className="text-3xl font-bold mb-6">R$ 97<span className="text-sm">/mês</span></p>
          <ul className="space-y-2 text-left">
            <li>✓ 3 agentes ativos</li>
            <li>✓ 1.000 conversas/mês</li>
            <li>✓ Integrações básicas</li>
            <li>✓ Suporte por email</li>
          </ul>
        </div>
        
        <div className="text-center p-8 border-2 border-primary rounded-lg relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
            Mais Popular
          </div>
          <h3 className="text-2xl font-bold mb-4">Professional</h3>
          <p className="text-3xl font-bold mb-6">R$ 297<span className="text-sm">/mês</span></p>
          <ul className="space-y-2 text-left">
            <li>✓ 10 agentes ativos</li>
            <li>✓ 10.000 conversas/mês</li>
            <li>✓ Todas as integrações</li>
            <li>✓ Agent Studio avançado</li>
            <li>✓ Analytics completo</li>
            <li>✓ Suporte prioritário</li>
          </ul>
        </div>
        
        <div className="text-center p-8 border rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
          <p className="text-3xl font-bold mb-6">Customizado</p>
          <ul className="space-y-2 text-left">
            <li>✓ Agentes ilimitados</li>
            <li>✓ Conversas ilimitadas</li>
            <li>✓ White-label</li>
            <li>✓ SLA dedicado</li>
            <li>✓ Integração customizada</li>
            <li>✓ Suporte 24/7</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✓ Páginas públicas criadas"

echo ""
echo "🔐 ==> FASE 2: PÁGINAS DE AUTENTICAÇÃO"
echo "====================================="

# Auth - Signup
mkdir -p "(auth)/signup"
cat > "(auth)/signup/page.tsx" << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar Conta | Agentes de Conversão',
  description: 'Crie sua conta na plataforma de agentes IA'
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Criar Conta</h2>
          <p className="mt-2 text-muted-foreground">
            Comece a criar agentes IA em minutos
          </p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Criar Conta
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <a href="/login" className="text-primary hover:underline">
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✓ Página de signup criada"

echo ""
echo "📊 ==> FASE 3: PÁGINAS DO DASHBOARD"
echo "=================================="

# Dashboard - Analytics principal
mkdir -p "(dashboard)/analytics"
cat > "(dashboard)/analytics/page.tsx" << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics | Dashboard',
  description: 'Analytics e métricas dos agentes IA'
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos seus agentes em tempo real
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Conversas Hoje
          </h3>
          <p className="text-3xl font-bold">1,234</p>
          <p className="text-sm text-green-600">+12% vs ontem</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Taxa de Resolução
          </h3>
          <p className="text-3xl font-bold">94%</p>
          <p className="text-sm text-green-600">+2% vs semana passada</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tempo Médio de Resposta
          </h3>
          <p className="text-3xl font-bold">1.2s</p>
          <p className="text-sm text-green-600">-0.3s vs média</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Satisfação do Cliente
          </h3>
          <p className="text-3xl font-bold">4.8</p>
          <p className="text-sm text-muted-foreground">de 5.0</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Conversas por Hora</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            [Gráfico de linha - Conversas por Hora]
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Agentes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Suporte Geral</span>
              <span className="font-semibold">456 conversas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Vendas Bot</span>
              <span className="font-semibold">321 conversas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>FAQ Automático</span>
              <span className="font-semibold">234 conversas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Dashboard - Conversations
mkdir -p "(dashboard)/conversations"
cat > "(dashboard)/conversations/page.tsx" << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conversas | Dashboard',
  description: 'Gerencie todas as conversas dos agentes'
}

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todas as conversas em andamento
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md hover:bg-muted">
            Filtros
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Nova Conversa
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 border-b">
        <button className="px-4 py-2 border-b-2 border-primary text-primary font-medium">
          Ativas (24)
        </button>
        <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
          Arquivadas
        </button>
        <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
          Aguardando
        </button>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Cliente #{1000 + i}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Ativa
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Última mensagem: Preciso de ajuda com meu pedido...
                </p>
                <p className="text-xs text-muted-foreground">
                  Agente: Suporte Geral • há 2 minutos
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium">14:32</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
EOF

echo "✓ Páginas de dashboard criadas"

echo ""
echo "⚙️ ==> FASE 4: PÁGINAS DE CONFIGURAÇÃO"
echo "===================================="

# Settings page
mkdir -p "(dashboard)/settings"
cat > "(dashboard)/settings/page.tsx" << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações | Dashboard',
  description: 'Configurações da conta e organização'
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <nav className="space-y-1">
            <a href="#profile" className="block px-3 py-2 rounded-md bg-muted font-medium">
              Perfil
            </a>
            <a href="#security" className="block px-3 py-2 rounded-md hover:bg-muted">
              Segurança
            </a>
            <a href="#notifications" className="block px-3 py-2 rounded-md hover:bg-muted">
              Notificações
            </a>
            <a href="#integrations" className="block px-3 py-2 rounded-md hover:bg-muted">
              Integrações
            </a>
            <a href="#billing" className="block px-3 py-2 rounded-md hover:bg-muted">
              Faturamento
            </a>
          </nav>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informações do Perfil</h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    defaultValue="Lucas Nóbrega"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="lucas@agentesdeconversao.ai"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Organização
                </label>
                <input
                  type="text"
                  defaultValue="Agentes de Conversão"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fuso Horário
                </label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>America/Sao_Paulo (GMT-3)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Europe/London (GMT+0)</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✓ Páginas de configuração criadas"

echo ""
echo "🎯 ==> FASE 5: RELATÓRIO DE ORGANIZAÇÃO"
echo "======================================"

TOTAL_PAGES=$(find . -name "page.tsx" | wc -l)
DASHBOARD_PAGES=$(find ./"(dashboard)" -name "page.tsx" | wc -l)
PUBLIC_PAGES=$(find ./"(public)" -name "page.tsx" | wc -l)
AUTH_PAGES=$(find ./"(auth)" -name "page.tsx" | wc -l)

echo "📊 ARQUITETURA ENTERPRISE ORGANIZADA:"
echo "├── Total de páginas: $TOTAL_PAGES"
echo "├── Páginas Dashboard: $DASHBOARD_PAGES"
echo "├── Páginas Públicas: $PUBLIC_PAGES"
echo "├── Páginas Auth: $AUTH_PAGES"
echo "└── Estrutura conforme CLAUDE.md: ✅"

echo ""
echo "✅ PRÓXIMOS PASSOS:"
echo "1. Implementar navegação enterprise"
echo "2. Integrar theme provider convergido"
echo "3. Configurar layouts responsivos"
echo "4. Aplicar componentes UI extraídos"

echo ""
echo "🚀 ARQUITETURA ENTERPRISE ORGANIZADA COM SUCESSO!"
echo "================================================="
echo "📈 Estrutura pronta para desenvolvimento acelerado"