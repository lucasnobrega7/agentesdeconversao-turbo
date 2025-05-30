import React from 'react'
import Link from 'next/link'
import { 
  Users, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Settings,
  Zap,
  TrendingUp,
  Shield,
  Monitor
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <Zap className="h-6 w-6" />
              <span className="font-bold">Agentes de Conversão</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <span className="text-sm text-muted-foreground">dash.agentesdeconversao.ai</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - ENTERPRISE NAVIGATION */}
        <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background/95 backdrop-blur">
          <nav className="space-y-2 p-4">
            {/* Dashboard Overview */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                OVERVIEW
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/analytics" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </Link>
                <Link 
                  href="/dashboard/monitoring" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Monitor className="h-4 w-4" />
                  Monitoramento
                </Link>
              </div>
            </div>

            {/* Agentes */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                AGENTES IA
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard/agents" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Bot className="h-4 w-4" />
                  Meus Agentes
                </Link>
                <Link 
                  href="/dashboard/agent-studio" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Zap className="h-4 w-4" />
                  AgentStudio
                </Link>
              </div>
            </div>

            {/* Conversas */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                CONVERSAS
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard/conversations" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <MessageSquare className="h-4 w-4" />
                  Todas as Conversas
                </Link>
                <Link 
                  href="/dashboard/conversations/active" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Ativas</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Base de Conhecimento */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                CONHECIMENTO
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard/knowledge" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <FileText className="h-4 w-4" />
                  Documentos
                </Link>
                <Link 
                  href="/dashboard/knowledge/mcp" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Shield className="h-4 w-4" />
                  Conectores MCP
                </Link>
              </div>
            </div>

            {/* Integrações */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                INTEGRAÇÕES
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard/integrations" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Zap className="h-4 w-4" />
                  WhatsApp & Telegram
                </Link>
                <Link 
                  href="/dashboard/integrations/webhooks" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  Webhooks
                </Link>
              </div>
            </div>

            {/* Time */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                ORGANIZAÇÃO
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard/team" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Users className="h-4 w-4" />
                  Equipe
                </Link>
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}