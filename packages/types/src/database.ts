/**
 * Database types - Supabase & Prisma
 */

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface Agent {
  id: string
  name: string
  description?: string
  organization_id: string
  model_name: string
  temperature: number
  max_tokens: number
  system_prompt?: string
  user_prompt?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  status: 'active' | 'inactive' | 'archived'
}

export interface Conversation {
  id: string
  user_id: string
  agent_id: string
  title?: string
  status: 'active' | 'archived' | 'closed'
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_count?: number
  model_used?: string
  created_at: string
  metadata?: Record<string, any>
}

export interface Datastore {
  id: string
  name: string
  organization_id: string
  type: 'text' | 'qa' | 'web_page' | 'web_site' | 'file'
  status: 'unsynched' | 'synching' | 'synched'
  config?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Datasource {
  id: string
  datastore_id: string
  name: string
  type: 'text' | 'qa' | 'web_page' | 'web_site' | 'file'
  config?: Record<string, any>
  status: 'pending' | 'running' | 'synched'
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  organization_id: string
  name: string
  key_hash: string
  last_used?: string
  created_at: string
  expires_at?: string
  permissions?: string[]
}

export interface Usage {
  id: string
  user_id: string
  organization_id?: string
  agent_id?: string
  tokens_count: number
  cost_usd: number
  model_name: string
  created_at: string
  metadata?: Record<string, any>
}