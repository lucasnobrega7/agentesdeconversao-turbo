// Organization related types

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: PlanType;
  stripeCustomerId?: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export enum PlanType {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface OrganizationSettings {
  timezone: string;
  language: string;
  currency: string;
  features: {
    whatsapp: boolean;
    instagram: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    sso: boolean;
  };
  limits: {
    maxAgents: number;
    maxMessagesPerMonth: number;
    maxKnowledgeBases: number;
    maxTeamMembers: number;
    maxWhatsappInstances: number;
  };
}

export interface KnowledgeBase {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  config: KnowledgeBaseConfig;
  documentsCount: number;
  totalSize: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface KnowledgeBaseConfig {
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  indexingStrategy: 'semantic' | 'keyword' | 'hybrid';
  allowedFileTypes: string[];
  maxFileSize: number;
}

export interface TeamMember {
  id: string;
  organizationId: string;
  userId: string;
  role: TeamRole;
  permissions: string[];
  invitedBy: string;
  joinedAt?: Date;
  invitedAt: Date;
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}
