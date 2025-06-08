// Agent related types

export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  prompt: string;
  knowledgeBaseId?: string;
  flowId?: string;
  config: AgentConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  enableStreaming: boolean;
  historyLimit: number;
  responseFormat?: 'text' | 'markdown' | 'json';
  fallbackMessage: string;
  welcomeMessage?: string;
  tools?: AgentTool[];
  modelPreferences?: {
    preferred: string[];
    blocked: string[];
  };
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface AgentFlow {
  id: string;
  agentId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  version: number;
  isPublished: boolean;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export enum FlowNodeType {
  START = 'start',
  MESSAGE = 'message',
  CONDITION = 'condition',
  ACTION = 'action',
  TOOL = 'tool',
  KNOWLEDGE = 'knowledge',
  HANDOFF = 'handoff',
  END = 'end'
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, any>;
}
