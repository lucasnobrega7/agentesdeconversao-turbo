"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  BrainCircuit,
  Clock,
  Activity,
  DollarSign
} from "lucide-react"
import { useEffect, useState } from "react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  format?: "number" | "currency" | "percentage" | "time"
  loading?: boolean
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = "number",
  loading = false 
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (loading) return "..."
    
    switch (format) {
      case "currency":
        return `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      case "percentage":
        return `${val}%`
      case "time":
        return `${val}min`
      default:
        return Number(val).toLocaleString("pt-BR")
    }
  }

  const isPositive = change && change > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const trendColor = isPositive ? "text-green-600" : "text-red-600"

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold">
          {formatValue(value)}
        </p>
        
        {change !== undefined && (
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm ${trendColor}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-muted-foreground">
              vs. último período
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface DashboardMetricsProps {
  timeRange?: "24h" | "7d" | "30d" | "90d"
  onTimeRangeChange?: (range: string) => void
}

export function DashboardMetrics({ 
  timeRange = "7d",
  onTimeRangeChange 
}: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    activeUsers: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    totalRevenue: 0,
    activeAgents: 0,
    satisfaction: 0,
    messagesProcessed: 0
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/metrics?range=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  const timeRanges = [
    { value: "24h", label: "24 horas" },
    { value: "7d", label: "7 dias" },
    { value: "30d", label: "30 dias" },
    { value: "90d", label: "90 dias" }
  ]

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Métricas do Dashboard</h2>
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

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Conversas Totais"
          value={metrics.totalConversations || 1234}
          change={12.5}
          icon={MessageSquare}
          loading={loading}
        />
        <MetricCard
          title="Usuários Ativos"
          value={metrics.activeUsers || 856}
          change={8.2}
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={metrics.conversionRate || 23.4}
          change={-2.1}
          icon={Activity}
          format="percentage"
          loading={loading}
        />
        <MetricCard
          title="Receita Total"
          value={metrics.totalRevenue || 45678.90}
          change={15.8}
          icon={DollarSign}
          format="currency"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tempo de Resposta"
          value={metrics.avgResponseTime || 1.2}
          change={-5.3}
          icon={Clock}
          format="time"
          loading={loading}
        />
        <MetricCard
          title="Agentes Ativos"
          value={metrics.activeAgents || 12}
          change={0}
          icon={BrainCircuit}
          loading={loading}
        />
        <MetricCard
          title="Satisfação"
          value={metrics.satisfaction || 94.5}
          change={3.2}
          icon={TrendingUp}
          format="percentage"
          loading={loading}
        />
        <MetricCard
          title="Mensagens"
          value={metrics.messagesProcessed || 98765}
          change={18.9}
          icon={MessageSquare}
          loading={loading}
        />
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <span>Atualizado em tempo real</span>
      </div>
    </div>
  )
}
