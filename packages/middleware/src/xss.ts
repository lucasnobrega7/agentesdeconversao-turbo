/**
 * XSS Protection Middleware
 * Sanitização global contra Cross-Site Scripting
 */

import { Request, Response, NextFunction } from 'express'
import sanitizeHtml from 'sanitize-html'

export interface XSSOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  allowedSchemes?: string[]
  skipPaths?: string[]
}

const defaultOptions: XSSOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes: {
    'a': ['href', 'title']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  skipPaths: ['/api/webhooks']
}

/**
 * Middleware para sanitizar entrada de dados contra XSS
 */
export function xssProtection(options: XSSOptions = {}) {
  const config = { ...defaultOptions, ...options }
  
  return function xssMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Skip paths específicos (como webhooks)
    if (config.skipPaths?.some(path => req.path.startsWith(path))) {
      return next()
    }

    try {
      // Sanitizar URL
      const decodedURI = decodeURI(req.url)
      req.url = sanitizeHtml(decodedURI, {
        allowedTags: [],
        allowedAttributes: {}
      })

      // Sanitizar query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query, config)
      }

      // Sanitizar body (se existe)
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, config)
      }

      next()
    } catch (error) {
      console.error('XSS sanitization error:', error)
      res.status(400).json({
        error: 'Invalid input detected',
        code: 'XSS_PROTECTION'
      })
    }
  }
}

/**
 * Sanitiza objeto recursivamente
 */
function sanitizeObject(obj: any, config: XSSOptions): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: config.allowedTags || [],
      allowedAttributes: config.allowedAttributes || {},
      allowedSchemes: config.allowedSchemes || []
    })
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, config))
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar também as chaves
      const cleanKey = sanitizeHtml(key, { allowedTags: [], allowedAttributes: {} })
      sanitized[cleanKey] = sanitizeObject(value, config)
    }
    return sanitized
  }

  return obj
}

/**
 * Middleware específico para sanitizar headers
 */
export function sanitizeHeaders() {
  return function headerSanitizer(req: Request, res: Response, next: NextFunction): void {
    const dangerousHeaders = ['x-forwarded-host', 'host', 'origin', 'referer']
    
    dangerousHeaders.forEach(header => {
      if (req.headers[header]) {
        req.headers[header] = sanitizeHtml(req.headers[header] as string, {
          allowedTags: [],
          allowedAttributes: {}
        })
      }
    })
    
    next()
  }
}

/**
 * Wrapper para Express apps
 */
export function createXSSProtection(options?: XSSOptions) {
  return [
    sanitizeHeaders(),
    xssProtection(options)
  ]
}