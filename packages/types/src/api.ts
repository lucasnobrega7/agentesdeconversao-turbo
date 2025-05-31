/**
 * API types - Request/Response interfaces
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Agent API
export interface CreateAgentRequest {
  name: string
  description?: string
  model_name: string
  temperature?: number
  max_tokens?: number
  system_prompt?: string
  user_prompt?: string
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  status?: 'active' | 'inactive' | 'archived'
}

export interface AgentQueryRequest {
  message: string
  conversation_id?: string
  stream?: boolean
}

export interface AgentQueryResponse {
  response: string
  conversation_id: string
  tokens_used: number
  model_used: string
  cost_usd?: number
}

// Analytics API
export interface AnalyticsRequest {
  start_date?: string
  end_date?: string
  agent_id?: string
  organization_id?: string
  metrics?: string[]
}

export interface AnalyticsResponse {
  total_conversations: number
  total_messages: number
  total_tokens: number
  total_cost: number
  conversations_by_day: Array<{
    date: string
    count: number
  }>
  top_agents: Array<{
    agent_id: string
    agent_name: string
    usage_count: number
  }>
}

// File Upload
export interface FileUploadRequest {
  file: File
  datastore_id?: string
  type?: 'document' | 'image' | 'audio'
}

export interface FileUploadResponse {
  file_id: string
  filename: string
  url: string
  size: number
  mime_type: string
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}