export interface Metric {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  unit?: string
  description?: string
}

export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface AnalyticsConfig {
  refreshInterval?: number
  timeZone?: string
  currency?: string
  locale?: string
}
