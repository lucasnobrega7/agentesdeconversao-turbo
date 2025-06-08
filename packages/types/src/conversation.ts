// Conversation related types

export interface Conversation {
  id: string;
  organizationId: string;
  agentId: string;
  userId?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export enum ConversationChannel {
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  WEBCHAT = 'webchat',
  API = 'api'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  ABANDONED = 'abandoned'
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    model?: string;
    tier?: string;
    intent?: string;
    routing?: Record<string, any>;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  createdAt: Date;
}

export interface ConversationMetrics {
  totalMessages: number;
  avgResponseTime: number;
  userSatisfaction?: number;
  resolvedIssues: number;
  escalations: number;
  aiCost: number;
}
