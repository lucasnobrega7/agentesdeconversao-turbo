// AI and LiteLLM related types

export enum ModelTier {
  TIER_1 = 'tier1',
  TIER_2 = 'tier2',
  TIER_3 = 'tier3',
  TIER_4 = 'tier4'
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  description: string;
  costPerToken: number;
  maxTokens: number;
  contextWindow: number;
  capabilities: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  metadata?: Record<string, any>;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }>;
}

export interface ModelUsage {
  model: string;
  tier: ModelTier;
  requests: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  avgLatency: number;
  errors: number;
  period: {
    start: string;
    end: string;
  };
}

export interface RoutingDecision {
  selectedModel: string;
  selectedTier: ModelTier;
  intent: string;
  complexityScore: number;
  userValue: number;
  isVIP: boolean;
  reason: string;
  fallbackModels: string[];
}

export interface AIServiceConfig {
  enableStreaming: boolean;
  enableCache: boolean;
  cacheTimeout: number;
  maxRetries: number;
  timeout: number;
  fallbackBehavior: 'next-tier' | 'default-message' | 'error';
}

export interface ConversationAnalysis {
  conversationId: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  topics: string[];
  entities: Array<{
    type: string;
    value: string;
  }>;
  nextSteps: string[];
  satisfactionScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}
