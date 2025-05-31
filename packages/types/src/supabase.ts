/**
 * Supabase specific types
 */

import type { Database } from './database-fresh'

// Supabase client types
export type SupabaseClient = any // Will be properly typed with generated types

// Row Level Security context
export interface RLSContext {
  user_id: string
  organization_id?: string
  role?: string
}

// Real-time subscription types
export interface RealtimeSubscription {
  id: string
  table: string
  filter?: string
  callback: (payload: RealtimePayload) => void
}

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: Record<string, any>
  old?: Record<string, any>
  errors?: string[]
}

// Storage types
export interface SupabaseFile {
  id: string
  name: string
  bucket_id: string
  owner?: string
  created_at: string
  updated_at: string
  last_accessed_at?: string
  metadata?: Record<string, any>
}

export interface FileUploadOptions {
  cacheControl?: string
  contentType?: string
  upsert?: boolean
}

// Edge Functions
export interface EdgeFunctionRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

export interface EdgeFunctionResponse {
  data: any
  error?: string
  status: number
}

// Auth types (Supabase specific)
export interface SupabaseUser {
  id: string
  email: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  role?: string
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SupabaseSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  user: SupabaseUser
}

// Database query helpers
export type DatabaseTables = keyof Database['public']['Tables']

export type TableRow<T extends DatabaseTables> = 
  Database['public']['Tables'][T]['Row']

export type TableInsert<T extends DatabaseTables> = 
  Database['public']['Tables'][T]['Insert']

export type TableUpdate<T extends DatabaseTables> = 
  Database['public']['Tables'][T]['Update']

// Query filters
export interface QueryFilter {
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is'
  value: any
}

export interface QueryOptions {
  select?: string
  filter?: QueryFilter[]
  order?: { column: string; ascending?: boolean }[]
  limit?: number
  offset?: number
  count?: 'exact' | 'planned' | 'estimated'
}