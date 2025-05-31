/**
 * Analytics & Metrics types
 */

// Base metric types
export interface Metric {
  name: string
  value: number
  unit: string
  timestamp: string
  dimensions?: Record<string, string>
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  label?: string
}

// Analytics periods
export type AnalyticsPeriod = 
  | 'hour'
  | 'day' 
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

export interface AnalyticsDateRange {
  start_date: string
  end_date: string
  period: AnalyticsPeriod
}

// Conversation analytics
export interface ConversationAnalytics {
  total_conversations: number
  total_messages: number
  avg_conversation_length: number
  completion_rate: number
  user_satisfaction: number
  response_time_avg: number
  response_time_p95: number
  daily_conversations: TimeSeriesData[]
  top_intents: Array<{
    intent: string
    count: number
    percentage: number
  }>
}

// Agent performance analytics
export interface AgentAnalytics {
  agent_id: string
  agent_name: string
  total_usage: number
  success_rate: number
  avg_response_time: number
  total_tokens: number
  total_cost: number
  user_ratings: {
    average: number
    distribution: Record<number, number>
  }
  usage_trend: TimeSeriesData[]
  cost_trend: TimeSeriesData[]
}

// Organization analytics
export interface OrganizationAnalytics {
  organization_id: string
  total_agents: number
  active_agents: number
  total_conversations: number
  total_users: number
  monthly_cost: number
  monthly_token_usage: number
  growth_metrics: {
    conversation_growth: number
    user_growth: number
    cost_growth: number
  }
  agent_performance: AgentAnalytics[]
}

// Real-time metrics
export interface RealTimeMetrics {
  active_conversations: number
  requests_per_minute: number
  avg_response_time: number
  error_rate: number
  system_load: number
  queue_size: number
  cache_hit_rate: number
}

// Cost analytics
export interface CostAnalytics {
  total_cost: number
  cost_by_model: Array<{
    model: string
    cost: number
    tokens: number
    requests: number
  }>
  cost_by_agent: Array<{
    agent_id: string
    agent_name: string
    cost: number
    percentage: number
  }>
  cost_trend: TimeSeriesData[]
  projected_monthly_cost: number
  cost_optimization_suggestions: Array<{
    type: 'model_switch' | 'prompt_optimization' | 'usage_limit'
    description: string
    potential_savings: number
  }>
}

// User behavior analytics
export interface UserBehaviorAnalytics {
  unique_users: number
  returning_users: number
  session_duration_avg: number
  pages_per_session: number
  bounce_rate: number
  most_used_features: Array<{
    feature: string
    usage_count: number
    user_count: number
  }>
  user_journey: Array<{
    step: string
    completion_rate: number
    drop_off_rate: number
  }>
}

// A/B Testing
export interface ABTestResult {
  test_id: string
  test_name: string
  variant_a: {
    name: string
    conversion_rate: number
    sample_size: number
  }
  variant_b: {
    name: string
    conversion_rate: number
    sample_size: number
  }
  confidence_level: number
  statistical_significance: boolean
  winner?: 'A' | 'B' | 'INCONCLUSIVE'
}

// Event tracking
export interface AnalyticsEvent {
  event_type: 'conversation_started' | 'message_sent' | 'agent_created' | 'user_signup' | 'subscription_upgrade'
  event_data: Record<string, any>
  user_id?: string
  organization_id?: string
  timestamp: string
  properties?: Record<string, any>
}