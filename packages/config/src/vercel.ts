import { sharedConfig } from './shared';

export const vercelConfig = {
  ...sharedConfig,
  platform: 'vercel' as const,
  env: {
    // Vercel-specific environment variables
    vercelUrl: process.env.VERCEL_URL,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    nextPublicVercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
  build: {
    outputDirectory: '.next',
    buildCommand: 'turbo run build:web',
    framework: 'nextjs',
  },
} as const;