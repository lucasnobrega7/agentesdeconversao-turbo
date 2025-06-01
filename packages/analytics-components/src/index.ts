// Analytics Components para Agentes de Conversão
export { ConversionFunnel } from './components/ConversionFunnel'
export { AgentPerformance } from './components/AgentPerformance'
export { RealTimeMetrics } from './components/RealTimeMetrics'
export { ChatAnalytics } from './components/ChatAnalytics'
export { RevenueChart } from './components/RevenueChart'
export { KPICard } from './components/KPICard'
export { MetricsTrend } from './components/MetricsTrend'
export { HeatmapCalendar } from './components/HeatmapCalendar'

// Hooks
export { useAnalytics } from './hooks/useAnalytics'
export { useMetrics } from './hooks/useMetrics'
export { useRealtimeData } from './hooks/useRealtimeData'

// Utils
export { formatMetric } from './utils/formatters'
export { calculateGrowth } from './utils/calculations'

// Types
export type {
  Metric,
  TimeRange,
  ChartData,
  AnalyticsConfig
} from './types'
