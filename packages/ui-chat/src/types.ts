export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
  metadata?: Record<string, any>;
}

export interface ChatConfig {
  apiKey: string;
  agentId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  metadata?: Record<string, any>;
  welcomeMessage?: string;
  placeholder?: string;
  primaryColor?: string;
  enableSounds?: boolean;
  enableNotifications?: boolean;
}

export interface ChatTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  userMessageBackground: string;
  userMessageText: string;
  agentMessageBackground: string;
  agentMessageText: string;
  headerBackground: string;
  headerText: string;
}

export interface ChatAgent {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  capabilities?: string[];
  languages?: string[];
}

export interface ChatSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  metadata?: Record<string, any>;
}
