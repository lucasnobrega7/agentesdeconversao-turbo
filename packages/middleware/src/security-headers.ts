/**
 * Security Headers Middleware
 * Headers de segurança para proteção contra ataques comuns
 */

import { Request, Response, NextFunction } from 'express'

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | boolean
  strictTransportSecurity?: string | boolean
  xFrameOptions?: string | boolean
  xContentTypeOptions?: boolean
  referrerPolicy?: string | boolean
  permissionsPolicy?: string | boolean
  crossOriginEmbedderPolicy?: string | boolean
  crossOriginOpenerPolicy?: string | boolean
  crossOriginResourcePolicy?: string | boolean
}

/**
 * Middleware para aplicar headers de segurança
 */
export function securityHeaders(config: SecurityHeadersConfig = {}) {
  return function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Content Security Policy
    if (config.contentSecurityPolicy !== false) {
      const csp = typeof config.contentSecurityPolicy === 'string' 
        ? config.contentSecurityPolicy
        : getDefaultCSP()
      res.setHeader('Content-Security-Policy', csp)
    }

    // Strict Transport Security (HTTPS)
    if (config.strictTransportSecurity !== false) {
      const hsts = typeof config.strictTransportSecurity === 'string'
        ? config.strictTransportSecurity
        : 'max-age=31536000; includeSubDomains; preload'
      res.setHeader('Strict-Transport-Security', hsts)
    }

    // X-Frame-Options (Clickjacking protection)
    if (config.xFrameOptions !== false) {
      const frameOptions = typeof config.xFrameOptions === 'string'
        ? config.xFrameOptions
        : 'DENY'
      res.setHeader('X-Frame-Options', frameOptions)
    }

    // X-Content-Type-Options (MIME type sniffing protection)
    if (config.xContentTypeOptions !== false) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }

    // Referrer Policy
    if (config.referrerPolicy !== false) {
      const referrer = typeof config.referrerPolicy === 'string'
        ? config.referrerPolicy
        : 'strict-origin-when-cross-origin'
      res.setHeader('Referrer-Policy', referrer)
    }

    // Permissions Policy (Feature Policy replacement)
    if (config.permissionsPolicy !== false) {
      const permissions = typeof config.permissionsPolicy === 'string'
        ? config.permissionsPolicy
        : getDefaultPermissionsPolicy()
      res.setHeader('Permissions-Policy', permissions)
    }

    // Cross-Origin Embedder Policy
    if (config.crossOriginEmbedderPolicy !== false) {
      const coep = typeof config.crossOriginEmbedderPolicy === 'string'
        ? config.crossOriginEmbedderPolicy
        : 'require-corp'
      res.setHeader('Cross-Origin-Embedder-Policy', coep)
    }

    // Cross-Origin Opener Policy
    if (config.crossOriginOpenerPolicy !== false) {
      const coop = typeof config.crossOriginOpenerPolicy === 'string'
        ? config.crossOriginOpenerPolicy
        : 'same-origin'
      res.setHeader('Cross-Origin-Opener-Policy', coop)
    }

    // Cross-Origin Resource Policy
    if (config.crossOriginResourcePolicy !== false) {
      const corp = typeof config.crossOriginResourcePolicy === 'string'
        ? config.crossOriginResourcePolicy
        : 'cross-origin'
      res.setHeader('Cross-Origin-Resource-Policy', corp)
    }

    // Remove headers que expõem tecnologia
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')

    // Headers adicionais de segurança
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('X-DNS-Prefetch-Control', 'off')
    res.setHeader('X-Download-Options', 'noopen')
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')

    next()
  }
}

/**
 * CSP padrão para aplicações
 */
function getDefaultCSP(): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Next.js needs unsafe-inline for styles
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.agentesdeconversao.ai https://faccixlabriqwxkxqprw.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

/**
 * Permissions Policy padrão
 */
function getDefaultPermissionsPolicy(): string {
  return [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'payment=()',
    'usb=()',
    'screen-wake-lock=()',
    'web-share=(self)'
  ].join(', ')
}

/**
 * Headers específicos para APIs
 */
export function apiSecurityHeaders() {
  return securityHeaders({
    contentSecurityPolicy: false, // APIs não precisam de CSP
    xFrameOptions: 'DENY',
    crossOriginResourcePolicy: 'cross-origin',
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
  })
}

/**
 * Headers específicos para dashboards
 */
export function dashboardSecurityHeaders() {
  return securityHeaders({
    contentSecurityPolicy: true, // Usar CSP padrão
    xFrameOptions: 'SAMEORIGIN', // Permitir embedding no mesmo origin
    crossOriginResourcePolicy: 'same-origin'
  })
}

/**
 * Headers para widgets embeddable
 */
export function widgetSecurityHeaders() {
  return securityHeaders({
    contentSecurityPolicy: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Widgets podem precisar de inline scripts
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.agentesdeconversao.ai",
      "frame-ancestors *", // Permitir embedding em qualquer site
    ].join('; '),
    xFrameOptions: false, // Permitir framing para widgets
    crossOriginResourcePolicy: 'cross-origin'
  })
}