/**
 * Authentication & Authorization types
 */

// User and Organization interfaces
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug?: string
  created_at: string
  updated_at: string
}

// User roles
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

// Auth state
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

// Login/Register
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
  organization_name?: string
}

export interface AuthResponse {
  user: User
  session: Session
  organization?: Organization
}

// Password reset
export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

// Organization membership
export interface Membership {
  id: string
  user_id: string
  organization_id: string
  role: UserRole
  status: 'pending' | 'active' | 'suspended'
  invited_email?: string
  invited_token?: string
  created_at: string
  updated_at: string
}

export interface InviteUserRequest {
  email: string
  role: UserRole
  organization_id: string
}

// Permissions
export type Permission = 
  | 'agents:read'
  | 'agents:write'
  | 'agents:delete'
  | 'conversations:read'
  | 'conversations:write'
  | 'conversations:delete'
  | 'analytics:read'
  | 'billing:read'
  | 'billing:write'
  | 'organization:read'
  | 'organization:write'
  | 'users:read'
  | 'users:write'
  | 'users:invite'

export interface RolePermissions {
  [key: string]: Permission[]
}

// JWT Claims
export interface JWTClaims {
  sub: string // user_id
  email: string
  role: string
  organization_id?: string
  permissions?: Permission[]
  iat: number
  exp: number
}