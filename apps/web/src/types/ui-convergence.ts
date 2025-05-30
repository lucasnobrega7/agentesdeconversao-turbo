// 🚀 Interfaces de Convergência UI - Gerado por Execute Now

export interface LayeredAbstraction {
  foundation: MaterialDesignSystem & CustomTokens;
  composition: ComponentHierarchy & ThemeContext;
  specialization: DomainSpecificComponents;
  integration: CrossSystemInteroperability;
}

export interface StateOrchestration {
  global: AuthContext & ThemeContext & TenantContext;
  domain: AgentState & ConversationState & AnalyticsState;
  transient: UIState & FormState & NotificationState;
}

export interface PerformanceStrategy {
  bundling: ModuleFederation & RouteBasedSplitting;
  caching: ComponentCache & StateCache & AssetCache;
  rendering: SSR & SelectiveHydration & StreamingHTML;
}

// Material Design System Types
export interface MaterialDesignSystem {
  tokens: DesignTokens;
  components: ComponentLibrary;
  layout: ResponsiveGrid;
  typography: TypographyScale;
}

export interface CustomTokens {
  ai: AIConversationalTokens;
  branding: BrandTokens;
  animations: MotionTokens;
}

// Base Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  config: any;
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  messages: Message[];
  status: 'active' | 'closed' | 'paused';
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  metadata?: any;
}
