/**
 * Agent & AI types
 */

// AI Models
export type AIModel = 
  | 'openai/gpt-4'
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-3.5-turbo'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3-sonnet'
  | 'anthropic/claude-3-haiku'
  | 'google/gemini-pro'

export interface ModelConfig {
  model: AIModel
  temperature: number
  max_tokens: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

// Agent configuration
export interface AgentConfig extends ModelConfig {
  system_prompt?: string
  user_prompt?: string
  tools?: AgentTool[]
  knowledge_base?: string[]
  fallback_responses?: string[]
}

export interface AgentTool {
  id: string
  name: string
  description: string
  type: 'http' | 'websearch' | 'calculator' | 'custom'
  config: Record<string, any>
  enabled: boolean
}

// Flow/Workflow types (Flowise integration)
export interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, any>
  inputs?: FlowConnection[]
  outputs?: FlowConnection[]
}

export interface FlowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface AgentFlow {
  id: string
  name: string
  description?: string
  nodes: FlowNode[]
  connections: FlowConnection[]
  version: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// Execution context
export interface ExecutionContext {
  conversation_id: string
  user_id: string
  agent_id: string
  session_data?: Record<string, any>
  variables?: Record<string, any>
}

export interface ExecutionResult {
  success: boolean
  response: string
  tokens_used: number
  cost_usd: number
  execution_time: number
  model_used: string
  error?: string
  debug_info?: Record<string, any>
}

// Training & Fine-tuning
export interface TrainingData {
  input: string
  expected_output: string
  context?: string
  feedback_score?: number
}

export interface AgentPerformance {
  agent_id: string
  total_conversations: number
  avg_response_time: number
  success_rate: number
  user_satisfaction: number
  cost_per_conversation: number
  last_30_days: {
    conversations: number
    tokens: number
    cost: number
  }
}