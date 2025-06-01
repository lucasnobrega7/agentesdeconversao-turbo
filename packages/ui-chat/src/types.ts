export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'agent'
  timestamp: Date
}

export interface ChatConfig {
  apiKey: string
  agentId: string
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  metadata?: Record<string, any>
}

export interface ChatTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
}
