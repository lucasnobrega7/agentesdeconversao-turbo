"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  MessageSquare,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface PerformanceData {
  conversationMetrics: {
    date: string
    total: number
    successful: number
    failed: number
    abandoned: number
  }[]
  responseTimeMetrics: {
    hour: string
    avgTime: number
    minTime: number
    maxTime: number
  }[]
  conversionFunnel: {
    stage: string
    count: number
    percentage: number
  }[]
  sentimentDistribution: {
    sentiment: string
    count: number
    percentage: number
  }[]
  channelPerformance: {
    channel: string
    conversations: number
    successRate: number
    avgResponseTime: number
  }[]
  topAgents: {
    name: string
    conversations: number
    successRate: number
    satisfaction: number
  }[]
}

interface AgentPerformanceProps {
  agentId?: string
  timeRange?: "24h" | "7d" | "30d" | "90d"
  onTimeRangeChange?: (range: string) => void
}

export function AgentPerformance({
  agentId,
  timeRange = "7d",
  onTimeRangeChange
}: AgentPerformanceProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<"conversations" | "response" | "conversion" | "sentiment">("conversations")

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        const endpoint = agentId 
          ? `/api/agents/${agentId}/performance?range=${timeRange}`
          : `/api/performance?range=${timeRange}`
        
        const response = await fetch(endpoint)
        if (response.ok) {
          const data = await response.json()
          setPerformanceData(data)
        }
      } catch (error) {
        console.error("Failed to fetch performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [agentId, timeRange])

  // Mock data for demonstration
  const mockData: PerformanceData = {
    conversationMetrics: [
      { date: "Seg", total: 120, successful: 90, failed: 20, abandoned: 10 },
      { date: "Ter", total: 145, successful: 110, failed: 25, abandoned: 10 },
      { date: "Qua", total: 132, successful: 100, failed: 22, abandoned: 10 },
      { date: "Qui", total: 168, successful: 130, failed: 28, abandoned: 10 },
      { date: "Sex", total: 155, successful: 120, failed: 25, abandoned: 10 },
      { date: "Sáb", total: 98, successful: 75, failed: 18, abandoned: 5 },
      { date: "Dom", total: 87, successful: 65, failed: 17, abandoned: 5 }
    ],
    responseTimeMetrics: [
      { hour: "00h", avgTime: 1.2, minTime: 0.5, maxTime: 2.1 },
      { hour: "06h", avgTime: 1.0, minTime: 0.4, maxTime: 1.8 },
      { hour: "12h", avgTime: 1.5, minTime: 0.6, maxTime: 2.5 },
      { hour: "18h", avgTime: 1.8, minTime: 0.7, maxTime: 3.0 },
      { hour: "23h", avgTime: 1.3, minTime: 0.5, maxTime: 2.2 }
    ],
    conversionFunnel: [
      { stage: "Visitantes", count: 10000, percentage: 100 },
      { stage: "Engajados", count: 6500, percentage: 65 },
      { stage: "Qualificados", count: 3200, percentage: 32 },
      { stage: "Convertidos", count: 800, percentage: 8 }
    ],
    sentimentDistribution: [
      { sentiment: "Positivo", count: 450, percentage: 45 },
      { sentiment: "Neutro", count: 350, percentage: 35 },
      { sentiment: "Negativo", count: 200, percentage: 20 }
    ],
    channelPerformance: [
      { channel: "WhatsApp", conversations: 450, successRate: 85, avgResponseTime: 1.2 },
      { channel: "Web", conversations: 320, successRate: 78, avgResponseTime: 1.5 },
      { channel: "Telegram", conversations: 180, successRate: 82, avgResponseTime: 1.3 },
      { channel: "Email", conversations: 120, successRate: 75, avgResponseTime: 2.0 }
    ],
    topAgents: [
      { name: "Agent Vendas Pro", conversations: 234, successRate: 89, satisfaction: 94 },
      { name: "Agent Suporte", conversations: 198, successRate: 92, satisfaction: 96 },
      { name: "Agent Qualificação", conversations: 156, successRate: 78, satisfaction: 88 }
    ]
  }

  const data = performanceData || mockData

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const timeRanges = [
    { value: "24h", label: "24 horas" },
    { value: "7d", label: "7 dias" },
    { value: "30d", label: "30 dias" },
    { value: "90d", label: "90 dias" }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {agentId ? "Performance do Agente" : "Performance Geral"}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setSelectedMetric("conversations")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedMetric === "conversations" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Conversas
        </button>
        <button
          onClick={() => setSelectedMetric("response")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedMetric === "response" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tempo de Resposta
        </button>
        <button
          onClick={() => setSelectedMetric("conversion")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedMetric === "conversion" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Conversão
        </button>
        <button
          onClick={() => setSelectedMetric("sentiment")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedMetric === "sentiment" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sentimento
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Chart */}
        {selectedMetric === "conversations" && (
          <>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Evolução de Conversas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.conversationMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="successful" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Sucesso"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="failed" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    name="Falha"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="abandoned" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    name="Abandonadas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performance por Canal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.channelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversations" fill="#8884d8" name="Conversas" />
                  <Bar dataKey="successRate" fill="#82ca9d" name="Taxa Sucesso %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Response Time Chart */}
        {selectedMetric === "response" && (
          <>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Tempo de Resposta por Hora</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.responseTimeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#8884d8" 
                    name="Média"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minTime" 
                    stroke="#82ca9d" 
                    name="Mínimo"
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxTime" 
                    stroke="#ff7c7c" 
                    name="Máximo"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Tempos</h3>
              <div className="space-y-4">
                {data.channelPerformance.map((channel, index) => (
                  <div key={channel.channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{channel.channel}</span>
                      <span className="text-sm text-muted-foreground">{channel.avgResponseTime}s</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(channel.avgResponseTime / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Conversion Funnel */}
        {selectedMetric === "conversion" && (
          <>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.conversionFunnel} 
                  layout="horizontal"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {data.conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Taxa de Conversão</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    {data.conversionFunnel[data.conversionFunnel.length - 1].percentage}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Taxa de conversão geral</p>
                </div>
                <div className="space-y-3">
                  {data.conversionFunnel.map((stage, index) => {
                    if (index === 0) return null
                    const prevStage = data.conversionFunnel[index - 1]
                    const conversionRate = ((stage.count / prevStage.count) * 100).toFixed(1)
                    return (
                      <div key={stage.stage} className="flex items-center justify-between">
                        <span className="text-sm">
                          {prevStage.stage} → {stage.stage}
                        </span>
                        <span className="text-sm font-medium">{conversionRate}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sentiment Analysis */}
        {selectedMetric === "sentiment" && (
          <>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Sentimentos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sentiment, percentage }) => `${sentiment} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#6b7280" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Top Agentes por Satisfação</h3>
              <div className="space-y-4">
                {data.topAgents.map((agent, index) => (
                  <div key={agent.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.conversations} conversas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{agent.satisfaction}%</p>
                        <p className="text-xs text-muted-foreground">Satisfação</p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${agent.satisfaction}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Conversas</span>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">
            {data.conversationMetrics.reduce((sum, day) => sum + day.total, 0).toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +12.5% vs período anterior
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">85.3%</p>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +2.8% vs período anterior
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tempo Médio</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">1.4s</p>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3" />
            -0.3s vs período anterior
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Satisfação</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">92.7%</p>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +1.2% vs período anterior
          </p>
        </div>
      </div>
    </div>
  )
}
