'use client'

import { 
  Bot, 
  Plus, 
  MoreVertical, 
  Play, 
  BarChart3,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useAgents } from '@/hooks/use-agents'

export default function AgentsPage() {
  const { agents, loading, error } = useAgents()

  // Mock data para exibição quando necessário
  const mockAgents = [
    {
      id: 'demo-1',
      name: 'Demo: Vendas WhatsApp',
      description: 'Agente de demonstração para vendas via WhatsApp',
      model: 'gpt-4o',
      conversations: 0,
      conversionRate: 0,
      lastActive: 'Demo',
      avatar: '🤖'
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
      case 'demo':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const displayAgents = agents.length > 0 ? agents : mockAgents

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando agentes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar agentes
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Agentes</h1>
          <p className="text-muted-foreground">
            {agents.length > 0 
              ? `${agents.length} agentes conectados ao backend`
              : 'Gerencie seus agentes de IA que geram resultados reais'
            }
          </p>
        </div>
        <Link href="/agents/new">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Novo Agente
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-green-600">{agents.length}</div>
          <div className="text-sm text-muted-foreground">Agentes Criados</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-blue-600">
            {agents.filter(agent => agent.status !== 'inactive').length}
          </div>
          <div className="text-sm text-muted-foreground">Ativos Agora</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-purple-600">
            {agents.length > 0 ? 'Real' : 'Demo'}
          </div>
          <div className="text-sm text-muted-foreground">Status Backend</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-orange-600">✅</div>
          <div className="text-sm text-muted-foreground">API Integrada</div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayAgents.map((agent: any) => (
          <div key={agent.id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{agent.avatar || '🤖'}</div>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(agent.status || 'active')}`}>
                    {getStatusIcon(agent.status || 'active')}
                    {agent.status || 'active'}
                  </div>
                </div>
              </div>
              <button className="p-1 hover:bg-accent rounded">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {agent.description || 'Agente de IA para conversações inteligentes'}
            </p>

            {/* Metrics */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Modelo:</span>
                <span className="font-medium">{agent.model || 'gpt-4o'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-medium text-xs font-mono">{agent.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Criado:</span>
                <span className="font-medium">
                  {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Demo'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temperatura:</span>
                <span className="font-medium">{agent.temperature || 0.7}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/agents/${agent.id}/test`} className="flex-1">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Play className="h-4 w-4" />
                  Testar
                </button>
              </Link>
              <Link href={`/agents/${agent.id}/analytics`}>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent">
                  <BarChart3 className="h-4 w-4" />
                </button>
              </Link>
              <Link href={`/agents/${agent.id}/edit`}>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent">
                  <Edit className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        ))}

        {/* Create New Agent Card */}
        <Link href="/agents/new">
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