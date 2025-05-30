"use client"

import { 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Archive,
  Trash2
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Conversation {
  id: string
  customerName: string
  customerEmail: string
  agentName: string
  status: "active" | "completed" | "failed" | "pending"
  startedAt: string
  lastMessageAt: string
  messageCount: number
  sentiment: "positive" | "neutral" | "negative"
  channel: "web" | "whatsapp" | "telegram" | "email"
  summary?: string
}

interface RecentConversationsProps {
  limit?: number
  showActions?: boolean
  onConversationClick?: (conversation: Conversation) => void
}

export function RecentConversations({ 
  limit = 10, 
  showActions = true,
  onConversationClick 
}: RecentConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set())
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/conversations/recent?limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [limit])

  const getStatusIcon = (status: Conversation["status"]) => {
    switch (status) {
      case "active":
        return <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getChannelIcon = (channel: Conversation["channel"]) => {
    const iconClass = "h-4 w-4 text-muted-foreground"
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className={iconClass} />
      case "telegram":
        return <MessageSquare className={iconClass} />
      case "email":
        return <MessageSquare className={iconClass} />
      default:
        return <MessageSquare className={iconClass} />
    }
  }

  const getSentimentColor = (sentiment: Conversation["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "agora"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
    return `${Math.floor(seconds / 86400)}d atrás`
  }

  const handleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set())
    } else {
      setSelectedConversations(new Set(conversations.map(c => c.id)))
    }
  }

  const handleSelect = (id: string) => {
    const newSelection = new Set(selectedConversations)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedConversations(newSelection)
  }

  const handleBulkAction = async (action: "archive" | "delete") => {
    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for:`, Array.from(selectedConversations))
    setSelectedConversations(new Set())
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
  const mockConversations: Conversation[] = [
    {
      id: "1",
      customerName: "João Silva",
      customerEmail: "joao@example.com",
      agentName: "Agent Vendas",
      status: "active",
      startedAt: new Date(Date.now() - 300000).toISOString(),
      lastMessageAt: new Date(Date.now() - 60000).toISOString(),
      messageCount: 12,
      sentiment: "positive",
      channel: "whatsapp",
      summary: "Cliente interessado no plano Pro"
    },
    {
      id: "2",
      customerName: "Maria Santos",
      customerEmail: "maria@example.com",
      agentName: "Agent Suporte",
      status: "completed",
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
      messageCount: 24,
      sentiment: "neutral",
      channel: "web",
      summary: "Dúvidas sobre integração resolvidas"
    },
    {
      id: "3",
      customerName: "Pedro Costa",
      customerEmail: "pedro@example.com",
      agentName: "Agent Vendas",
      status: "pending",
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      lastMessageAt: new Date(Date.now() - 900000).toISOString(),
      messageCount: 8,
      sentiment: "negative",
      channel: "telegram",
      summary: "Reclamação sobre preços"
    }
  ]

  const displayConversations = conversations.length > 0 ? conversations : mockConversations

  return (
    <div className="bg-card border rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Conversas Recentes</h3>
          {selectedConversations.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedConversations.size} selecionadas
              </span>
              <button
                onClick={() => handleBulkAction("archive")}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="p-2 hover:bg-accent rounded-md transition-colors text-destructive"
              >
                <Trash2 className="h-4 w-4" />
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
              {showActions && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedConversations.size === displayConversations.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Agente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Canal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Mensagens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Última Atividade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Resumo
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayConversations.map((conversation) => (
              <tr
                key={conversation.id}
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onConversationClick?.(conversation)}
              >
                {showActions && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedConversations.has(conversation.id)}
                      onChange={() => handleSelect(conversation.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(conversation.status)}
                    <span className="text-sm capitalize">{conversation.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium">{conversation.customerName}</p>
                    <p className="text-xs text-muted-foreground">{conversation.customerEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{conversation.agentName}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(conversation.channel)}
                    <span className="text-sm capitalize">{conversation.channel}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{conversation.messageCount}</span>
                    <span className={`text-xs ${getSentimentColor(conversation.sentiment)}`}>
                      ({conversation.sentiment})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(conversation.lastMessageAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {conversation.summary || "Sem resumo disponível"}
                  </p>
                </td>
                {showActions && (
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(
                          actionMenuOpen === conversation.id ? null : conversation.id
                        )}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {actionMenuOpen === conversation.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-lg z-10">
                          <Link
                            href={`/conversations/${conversation.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver Detalhes
                          </Link>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left">
                            <Archive className="h-4 w-4" />
                            Arquivar
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {displayConversations.length} de {displayConversations.length} conversas
        </p>
        <Link
          href="/conversations"
          className="text-sm text-primary hover:underline"
        >
          Ver todas as conversas →
        </Link>
      </div>
    </div>
  )
}
