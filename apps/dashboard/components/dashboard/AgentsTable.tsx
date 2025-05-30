"use client"

import {
  BrainCircuit,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Power,
  Settings,
  BarChart,
  Eye,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  description: string
  type: "sales" | "support" | "qualification" | "custom"
  status: "active" | "inactive" | "training" | "error"
  model: string
  version: string
  createdAt: string
  lastActiveAt: string
  conversationCount: number
  successRate: number
  avgResponseTime: number
  monthlyUsage: number
  customInstructions?: string
  integrations: string[]
}

interface AgentsTableProps {
  onAgentSelect?: (agent: Agent) => void
  onAgentEdit?: (agent: Agent) => void
  onAgentDuplicate?: (agent: Agent) => void
  showAnalytics?: boolean
}

export function AgentsTable({
  onAgentSelect,
  onAgentEdit,
  onAgentDuplicate,
  showAnalytics = true
}: AgentsTableProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "status" | "conversations" | "performance">("name")
  const [filterStatus, setFilterStatus] = useState<"all" | Agent["status"]>("all")

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch("/api/agents")
        if (response.ok) {
          const data = await response.json()
          setAgents(data)
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-400" />
      case "training":
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getTypeColor = (type: Agent["type"]) => {
    switch (type) {
      case "sales":
        return "bg-blue-100 text-blue-800"
      case "support":
        return "bg-green-100 text-green-800"
      case "qualification":
        return "bg-purple-100 text-purple-800"
      case "custom":
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const handleSelectAll = () => {
    if (selectedAgents.size === agents.length) {
      setSelectedAgents(new Set())
    } else {
      setSelectedAgents(new Set(agents.map(a => a.id)))
    }
  }

  const handleSelect = (id: string) => {
    const newSelection = new Set(selectedAgents)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedAgents(newSelection)
  }

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for:`, Array.from(selectedAgents))
    setSelectedAgents(new Set())
  }

  const handleToggleStatus = async (agent: Agent) => {
    // TODO: Implement status toggle
    console.log("Toggle status for:", agent.id)
  }

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  // Mock data for demonstration
  const mockAgents: Agent[] = [
    {
      id: "1",
      name: "Agent Vendas Pro",
      description: "Especializado em conversão de leads B2B",
      type: "sales",
      status: "active",
      model: "GPT-4 Turbo",
      version: "1.2.0",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(Date.now() - 60000).toISOString(),
      conversationCount: 1234,
      successRate: 87.5,
      avgResponseTime: 1.2,
      monthlyUsage: 45678,
      integrations: ["WhatsApp", "Telegram", "Web"]
    },
    {
      id: "2",
      name: "Agent Suporte 24/7",
      description: "Atendimento e resolução de dúvidas técnicas",
      type: "support",
      status: "active",
      model: "Claude 3 Opus",
      version: "2.0.1",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(Date.now() - 300000).toISOString(),
      conversationCount: 2345,
      successRate: 92.3,
      avgResponseTime: 0.8,
      monthlyUsage: 67890,
      integrations: ["Web", "Email"]
    },
    {
      id: "3",
      name: "Agent Qualificação",
      description: "Qualificação inicial de leads",
      type: "qualification",
      status: "training",
      model: "Gemini Pro",
      version: "0.9.5",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
      conversationCount: 456,
      successRate: 78.9,
      avgResponseTime: 1.5,
      monthlyUsage: 12345,
      integrations: ["WhatsApp"]
    }
  ]

  const displayAgents = agents.length > 0 ? agents : mockAgents
  const filteredAgents = filterStatus === "all" 
    ? displayAgents 
    : displayAgents.filter(a => a.status === filterStatus)

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "status":
        return a.status.localeCompare(b.status)
      case "conversations":
        return b.conversationCount - a.conversationCount
      case "performance":
        return b.successRate - a.successRate
      default:
        return 0
    }
  })

  return (
    <div className="bg-card border rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Agentes de IA</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="training">Treinando</option>
                <option value="error">Erro</option>
              </select>
            </div>
          </div>
          
          {selectedAgents.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedAgents.size} selecionados
              </span>
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Ativar
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Desativar
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedAgents.size === sortedAgents.length && sortedAgents.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => setSortBy("status")}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
                >
                  Status
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => setSortBy("name")}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
                >
                  Agente
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => setSortBy("conversations")}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
                >
                  Conversas
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => setSortBy("performance")}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
                >
                  Performance
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Integrações
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedAgents.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-accent/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedAgents.has(agent.id)}
                    onChange={() => handleSelect(agent.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(agent.status)}
                    <span className="text-sm capitalize">{agent.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}>
                    {agent.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm">{agent.model}</p>
                    <p className="text-xs text-muted-foreground">v{agent.version}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{agent.conversationCount.toLocaleString("pt-BR")}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{agent.successRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agent.avgResponseTime}s tempo resposta
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {agent.integrations.map((integration) => (
                      <span
                        key={integration}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground"
                      >
                        {integration}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {showAnalytics && (
                      <Link
                        href={`/agents/${agent.id}/analytics`}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <BarChart className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleToggleStatus(agent)}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(
                          actionMenuOpen === agent.id ? null : agent.id
                        )}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {actionMenuOpen === agent.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-lg z-10">
                          <button
                            onClick={() => onAgentSelect?.(agent)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => onAgentEdit?.(agent)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => onAgentDuplicate?.(agent)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </button>
                          <Link
                            href={`/agents/${agent.id}/settings`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                          >
                            <Settings className="h-4 w-4" />
                            Configurações
                          </Link>
                          <hr className="my-1" />
                          <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedAgents.length} agentes encontrados
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/agents/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90"
          >
            Criar Novo Agente
          </Link>
        </div>
      </div>
    </div>
  )
}
