/**
 * Rate Limiting Middleware
 * Proteção contra ataques de força bruta e DDoS
 */

import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

export interface RateLimitConfig {
  windowMs?: number
  max?: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
}

/**
 * Rate limiter básico
 */
export function createRateLimit(config: RateLimitConfig = {}) {
  return rateLimit({
    windowMs: config.windowMs || 15 * 60 * 1000, // 15 minutes
    max: config.max || 100, // Limit each IP to 100 requests per windowMs
    message: config.message || {
      error: 'Too many requests from this IP',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((config.windowMs || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: config.standardHeaders ?? true, // Return rate limit info in headers
    legacyHeaders: config.legacyHeaders ?? false, // Disable legacy headers
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skipFailedRequests: config.skipFailedRequests || false,
    keyGenerator: config.keyGenerator || ((req: Request) => {
      // Use Organization ID se disponível, senão IP
      return req.headers['x-organization-id'] as string || req.ip
    }),
    skip: config.skip || ((req: Request) => {
      // Skip health checks e webhooks
      return req.path === '/health' || req.path.startsWith('/api/webhooks')
    }),
    handler: (req: Request, res: Response) => {
      console.warn(`[RATE LIMIT] IP ${req.ip} exceeded rate limit on ${req.path}`)
      
      res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((config.windowMs || 15 * 60 * 1000) / 1000),
        limit: config.max || 100,
        resetTime: new Date(Date.now() + (config.windowMs || 15 * 60 * 1000))
      })
    }
  })
}

/**
 * Rate limiter específico para auth
 */
export function createAuthRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Apenas 5 tentativas de login por IP em 15 min
    message: {
      error: 'Too many authentication attempts',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 900 // 15 minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    keyGenerator: (req: Request) => req.ip,
    handler: (req: Request, res: Response) => {
      console.warn(`[AUTH RATE LIMIT] IP ${req.ip} exceeded auth rate limit`)
      
      res.status(429).json({
        error: 'Too many authentication attempts',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: 900,
        message: 'Please wait 15 minutes before trying again'
      })
    }
  })
}

/**
 * Rate limiter específico para API
 */
export function createAPIRateLimit() {
  return rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
      error: 'API rate limit exceeded',
      code: 'API_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Use API key se disponível, senão IP
      return req.headers['x-api-key'] as string || req.ip
    }
  })
}

/**
 * Rate limiter para uploads
 */
export function createUploadRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per 15 minutes
    message: {
      error: 'Upload rate limit exceeded',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Apenas aplicar a rotas de upload
      return !req.path.includes('/upload') && !req.path.includes('/file')
    }
  })
}

/**
 * Rate limiter adaptativo baseado no usuário
 */
export function createAdaptiveRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
      // Limites baseados no plano do usuário
      const userPlan = req.headers['x-user-plan'] as string
      
      switch (userPlan) {
        case 'enterprise':
          return 1000
        case 'pro':
          return 500
        case 'starter':
          return 200
        default:
          return 100 // free tier
      }
    },
    message: (req: Request) => ({
      error: 'Rate limit exceeded for your plan',
      code: 'PLAN_RATE_LIMIT_EXCEEDED',
      plan: req.headers['x-user-plan'] || 'free',
      upgradeUrl: 'https://agentesdeconversao.ai/pricing'
    }),
    keyGenerator: (req: Request) => {
      // Use user ID se disponível
      return req.headers['x-user-id'] as string || req.ip
    }
  })
}