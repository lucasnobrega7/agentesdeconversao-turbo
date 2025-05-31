// API client para comunicação com o backend FastAPI
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Agent {
  id: string
  name: string
  description: string
  prompt?: string
  model?: string
  temperature?: number
  max_tokens?: number
  status?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_query: string
  agent_response: string
  agent_id?: string
  created_at: string
  metadata?: Record<string, any>
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }

  // Status check
  async getStatus() {
    return this.request('/api/status')
  }

  // Agents endpoints
  async getAgents(): Promise<ApiResponse<Agent[]>> {
    return this.request<Agent[]>('/api/v1/agents')
  }

  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    return this.request<Agent>(`/api/agents/${id}`)
  }

  async createAgent(agent: Partial<Agent>): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    })
  }

  async updateAgent(id: string, agent: Partial<Agent>): Promise<ApiResponse<Agent>> {
    return this.request<Agent>(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agent),
    })
  }

  async deleteAgent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/agents/${id}`, {
      method: 'DELETE',
    })
  }

  async queryAgent(id: string, query: string): Promise<ApiResponse<any>> {
    return this.request(`/api/agents/${id}/query`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }

  // Conversations endpoints
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.request<Conversation[]>('/api/v1/conversations')
  }

  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/api/conversations/${id}`)
  }

  async createConversation(conversation: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(conversation),
    })
  }

  // Analytics endpoints
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics')
  }

  // User endpoints
  async completeOnboarding(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/user/complete-onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/user/profile')
  }
}

// Create and export a default instance
export const apiClient = new ApiClient()

// Export the class for custom instances
export default ApiClient