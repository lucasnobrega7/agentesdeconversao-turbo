import { 
  Bot, 
  Plus, 
  MoreVertical, 
  Play, 
  BarChart3,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function AgentsPage() {
  // Mock data - Em produção seria do backend
  const agents = [
    {
      id: 'agent-1',
      name: 'Vendas WhatsApp',
      description: 'Agente especializado em vendas através do WhatsApp com foco em conversão',
      status: 'active',
      model: 'gpt-4o',
      conversations: 847,
      conversionRate: 34.2,
      lastActive: '2 min atrás',
      avatar: '🤖'
    },
    {
      id: 'agent-2', 
      name: 'Suporte 24/7',
      description: 'Atendimento automatizado para suporte técnico e dúvidas frequentes',
      status: 'active',
      model: 'claude-3-5-sonnet',
      conversations: 1203,
      conversionRate: 28.7,
      lastActive: '1 min atrás',
      avatar: '🛠️'
    },
    {
      id: 'agent-3',
      name: 'Lead Qualifier',
      description: 'Qualificação automática de leads para equipe comercial',
      status: 'restarting',
      model: 'gpt-4o-mini',
      conversations: 532,
      conversionRate: 41.8,
      lastActive: '5 min atrás',
      avatar: '🎯'
    },
    {
      id: 'agent-4',
      name: 'Onboarding Assistant',
      description: 'Guia novos usuários através do processo de onboarding',
      status: 'inactive',
      model: 'gemini-1.5-pro',
      conversations: 234,
      conversionRate: 52.1,
      lastActive: '2 horas atrás',
      avatar: '🚀'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'restarting':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'restarting':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Agentes</h1>
          <p className="text-muted-foreground">
            Gerencie seus agentes de IA que geram resultados reais
          </p>
        </div>
        <Link href="/dashboard/agents/new">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Novo Agente
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-green-600">4</div>
          <div className="text-sm text-muted-foreground">Agentes Criados</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-sm text-muted-foreground">Ativos Agora</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-purple-600">2,816</div>
          <div className="text-sm text-muted-foreground">Conversas Hoje</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-orange-600">39.2%</div>
          <div className="text-sm text-muted-foreground">Conversão Média</div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{agent.avatar}</div>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </div>
                </div>
              </div>
              <button className="p-1 hover:bg-accent rounded">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {agent.description}
            </p>

            {/* Metrics */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Modelo:</span>
                <span className="font-medium">{agent.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversas:</span>
                <span className="font-medium">{agent.conversations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversão:</span>
                <span className="font-medium text-green-600">{agent.conversionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última atividade:</span>
                <span className="font-medium">{agent.lastActive}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/dashboard/agents/${agent.id}/test`} className="flex-1">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Play className="h-4 w-4" />
                  Testar
                </button>
              </Link>
              <Link href={`/dashboard/agents/${agent.id}/analytics`}>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent">
                  <BarChart3 className="h-4 w-4" />
                </button>
              </Link>
              <Link href={`/dashboard/agents/${agent.id}/edit`}>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent">
                  <Edit className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        ))}

        {/* Create New Agent Card */}
        <Link href="/dashboard/agents/new">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary hover:bg-accent transition-colors cursor-pointer min-h-[320px] flex flex-col items-center justify-center">
            <Bot className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-semibold mb-2">Criar Novo Agente</h3>
            <p className="text-sm text-muted-foreground text-center">
              Configure um agente de IA especializado para seu caso de uso específico
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-medium">
              <Plus className="h-4 w-4" />
              Começar Agora
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}