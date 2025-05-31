/**
 * CORS Configuration Middleware
 * Cross-Origin Resource Sharing configurado para produção
 */

import cors from 'cors'
import { Request } from 'express'

export interface CORSConfig {
  allowedOrigins?: string[]
  allowCredentials?: boolean
  allowedMethods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  maxAge?: number
}

/**
 * Obter origins permitidas do ambiente
 */
export function getAllowedOrigins(): string[] {
  const corsOrigins = process.env.CORS_ORIGINS
  
  if (!corsOrigins || corsOrigins === '*') {
    return ['*']
  }
  
  return corsOrigins.split(',').map(origin => origin.trim())
}

/**
 * Configuração CORS para produção
 */
export function createCORSConfig(config: CORSConfig = {}) {
  const allowedOrigins = config.allowedOrigins || getAllowedOrigins()
  
  return cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Permitir requests sem origin (mobile apps, Postman)
      if (!origin) {
        return callback(null, true)
      }
      
      // Permitir todas as origins se configurado como '*'
      if (allowedOrigins.includes('*')) {
        return callback(null, true)
      }
      
      // Verificar se origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      
      // Verificar padrões wildcard
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace(/\*/g, '.*')
          return new RegExp(`^${pattern}$`).test(origin)
        }
        return false
      })
      
      if (isAllowed) {
        return callback(null, true)
      }
      
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error(`Not allowed by CORS policy: ${origin}`), false)
    },
    credentials: config.allowCredentials ?? true,
    methods: config.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: config.allowedHeaders || [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Organization-ID'
    ],
    exposedHeaders: config.exposedHeaders || [
      'X-Total-Count',
      'X-Page-Count',
      'X-Rate-Limit-Remaining'
    ],
    maxAge: config.maxAge || 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
}

/**
 * CORS middleware específico para diferentes ambientes
 */
export function createEnvironmentCORS() {
  const environment = process.env.NODE_ENV
  
  switch (environment) {
    case 'development':
      return createCORSConfig({
        allowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3002',
          'http://localhost:8000',
          'http://127.0.0.1:3000'
        ]
      })
      
    case 'staging':
      return createCORSConfig({
        allowedOrigins: [
          'https://*.vercel.app',
          'https://*.agentesdeconversao.ai',
          'http://localhost:3000'
        ]
      })
      
    case 'production':
      return createCORSConfig({
        allowedOrigins: [
          'https://agentesdeconversao.ai',
          'https://lp.agentesdeconversao.ai',
          'https://dash.agentesdeconversao.ai',
          'https://login.agentesdeconversao.ai',
          'https://api.agentesdeconversao.ai'
        ]
      })
      
    default:
      return createCORSConfig()
  }
}

/**
 * Middleware para iframe origins
 */
export function getAllowedIframeOrigins(): string {
  const iframeOrigins = process.env.IFRAME_ORIGINS
  
  if (!iframeOrigins || iframeOrigins === '*') {
    return "'self'"
  }
  
  if (iframeOrigins === 'none') {
    return "'none'"
  }
  
  return iframeOrigins
    .split(',')
    .map(origin => origin.trim())
    .join(' ')
}