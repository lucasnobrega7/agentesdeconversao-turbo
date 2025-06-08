// Authentication related types

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: AuthProvider;
  organizationId?: string;
  emailVerified: boolean;
  tier: UserTier;
  lifetimeValue: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  SAML = 'saml'
}

export enum UserTier {
  STANDARD = 'standard',
  VIP = 'vip',
  ENTERPRISE = 'enterprise'
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  organizationName?: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}
