/**
 * Security Middleware Stack
 * Stack completo de middlewares de segurança
 */

import { Express, Request, Response, NextFunction } from 'express'
import { createXSSProtection, XSSOptions } from './xss'
import { createEnvironmentCORS, CORSConfig } from './cors'
import { createRateLimit, RateLimitConfig } from './rate-limit'
import { securityHeaders } from './security-headers'
import { jwtAuth, JWTConfig } from './auth'

export interface SecurityConfig {
  xss?: XSSOptions
  cors?: CORSConfig
  rateLimit?: RateLimitConfig
  jwt?: JWTConfig
  skipPaths?: string[]
  logSecurity?: boolean
}

/**
 * Aplica stack completo de segurança à aplicação Express
 */
export function createSecurityMiddleware(app: Express, config: SecurityConfig = {}) {
  const { 
    xss = {}, 
    cors = {}, 
    rateLimit = {},
    jwt = {},
    skipPaths = [],
    logSecurity = true
  } = config

  // Log de segurança
  if (logSecurity) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[SECURITY] ${req.method} ${req.path} - ${req.ip}`)
      next()
    })
  }

  // 1. Headers de segurança (primeiro)
  app.use(securityHeaders())

  // 2. CORS (antes de qualquer processing)
  app.use(createEnvironmentCORS())

  // 3. Rate limiting (proteção contra ataques)
  app.use(createRateLimit(rateLimit))

  // 4. XSS Protection (sanitização)
  app.use(createXSSProtection(xss))

  // 5. JWT Authentication (rotas protegidas)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip auth para rotas públicas
    const publicPaths = [
      '/health',
      '/api/status', 
      '/api/webhooks',
      '/auth/login',
      '/auth/register',
      ...skipPaths
    ]
    
    const isPublic = publicPaths.some(path => req.path.startsWith(path))
    if (isPublic) {
      return next()
    }
    
    // Aplicar JWT para rotas protegidas
    return jwtAuth(jwt)(req, res, next)
  })

  // Error handler para middlewares de segurança
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.name === 'SecurityError') {
      console.error(`[SECURITY ERROR] ${error.message}`, {
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
      
      return res.status(403).json({
        error: 'Security violation detected',
        code: error.code || 'SECURITY_ERROR'
      })
    }
    
    next(error)
  })
}

/**
 * Middleware específico para APIs
 */
export function createAPISecurityMiddleware(config: SecurityConfig = {}) {
  return function(app: Express) {
    createSecurityMiddleware(app, {
      ...config,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per window
        ...config.rateLimit
      },
      skipPaths: [
        '/api/webhooks',
        '/health',
        '/metrics',
        ...config.skipPaths || []
      ]
    })
  }
}

/**
 * Middleware específico para dashboards
 */
export function createDashboardSecurityMiddleware(config: SecurityConfig = {}) {
  return function(app: Express) {
    createSecurityMiddleware(app, {
      ...config,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes  
        max: 300, // 300 requests per window
        ...config.rateLimit
      },
      skipPaths: [
        '/auth',
        '/login',
        '/register',
        '/reset-password',
        ...config.skipPaths || []
      ]
    })
  }
}

/**
 * Configuração de segurança para desenvolvimento
 */
export function createDevSecurityMiddleware(app: Express) {
  return createSecurityMiddleware(app, {
    cors: {
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001']
    },
    rateLimit: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 1000 // muito permissivo para dev
    },
    logSecurity: true
  })
}

/**
 * Configuração de segurança para produção
 */
export function createProdSecurityMiddleware(app: Express) {
  return createSecurityMiddleware(app, {
    cors: {
      allowedOrigins: [
        'https://agentesdeconversao.ai',
        'https://dash.agentesdeconversao.ai'
      ]
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // restritivo para produção
    },
    logSecurity: true
  })
}