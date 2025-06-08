import { sharedConfig } from './shared';

export const railwayConfig = {
  ...sharedConfig,
  platform: 'railway' as const,
  env: {
    // Railway-specific environment variables
    railwayEnvironmentName: process.env.RAILWAY_ENVIRONMENT_NAME,
    railwayServiceName: process.env.RAILWAY_SERVICE_NAME,
    railwayProjectId: process.env.RAILWAY_PROJECT_ID,
    databaseUrl: process.env.DATABASE_URL,
  },
  build: {
    builder: 'nixpacks',
    healthcheckPath: '/health',
    restartPolicyType: 'ON_FAILURE',
  },
} as const;