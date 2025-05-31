/**
 * JWT Authentication Middleware
 * Validação e verificação de tokens JWT
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTClaims } from '@agentes/types'

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: JWTClaims
    organizationId?: string
  }
}

export interface JWTConfig {
  secret?: string
  issuer?: string
  audience?: string
  expiresIn?: string
  algorithm?: jwt.Algorithm
  skipPaths?: string[]
}

export interface AuthenticatedRequest extends Request {
  user: JWTClaims
  organizationId: string
}

/**
 * Middleware de autenticação JWT
 */
export function jwtAuth(config: JWTConfig = {}) {
  const secret = config.secret || process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
      // Extrair token do header Authorization
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return respondUnauthorized(res, 'Missing or invalid authorization header')
      }

      const token = authHeader.substring(7) // Remove 'Bearer '
      
      // Verificar e decodificar token
      const decoded = jwt.verify(token, secret, {
        issuer: config.issuer,
        audience: config.audience,
        algorithms: config.algorithm ? [config.algorithm] : ['HS256']
      }) as JWTClaims

      // Verificar se token não expirou
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return respondUnauthorized(res, 'Token expired')
      }

      // Adicionar informações do usuário ao request
      req.user = decoded
      req.organizationId = decoded.organization_id

      next()
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return respondUnauthorized(res, 'Invalid token')
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return respondUnauthorized(res, 'Token expired')
      }

      console.error('JWT Auth Error:', error)
      return respondUnauthorized(res, 'Authentication failed')
    }
  }
}

/**
 * Middleware para verificar permissões específicas
 */
export function requirePermission(permission: string) {
  return function permissionMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      return respondUnauthorized(res, 'Authentication required')
    }

    const userPermissions = req.user.permissions || []
    
    if (!userPermissions.includes(permission as any)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required_permission: permission
      })
    }

    next()
  }
}

/**
 * Middleware para verificar role
 */
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  
  return function roleMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      return respondUnauthorized(res, 'Authentication required')
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient role',
        code: 'FORBIDDEN',
        required_roles: allowedRoles,
        user_role: req.user.role
      })
    }

    next()
  }
}

/**
 * Middleware para verificar organização
 */
export function requireOrganization() {
  return function organizationMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      return respondUnauthorized(res, 'Authentication required')
    }

    if (!req.user.organization_id) {
      return res.status(403).json({
        error: 'Organization membership required',
        code: 'NO_ORGANIZATION'
      })
    }

    next()
  }
}

/**
 * Middleware opcional de autenticação (não falha se não autenticado)
 */
export function optionalAuth(config: JWTConfig = {}) {
  const secret = config.secret || process.env.JWT_SECRET
  
  if (!secret) {
    return (req: Request, res: Response, next: NextFunction) => next()
  }

  return function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next() // Continue sem autenticação
      }

      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, secret) as JWTClaims

      req.user = decoded
      req.organizationId = decoded.organization_id
    } catch (error) {
      // Ignore errors em optional auth
      console.warn('Optional auth failed:', error.message)
    }
    
    next()
  }
}

/**
 * Gerar token JWT
 */
export function generateToken(payload: Omit<JWTClaims, 'iat' | 'exp'>, config: JWTConfig = {}): string {
  const secret = config.secret || process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign(payload, secret, {
    expiresIn: config.expiresIn || '24h',
    issuer: config.issuer || 'agentes-de-conversao',
    audience: config.audience || 'agentes-de-conversao-api',
    algorithm: config.algorithm || 'HS256'
  })
}

/**
 * Verificar token sem middleware
 */
export function verifyToken(token: string, config: JWTConfig = {}): JWTClaims {
  const secret = config.secret || process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.verify(token, secret, {
    issuer: config.issuer,
    audience: config.audience,
    algorithms: config.algorithm ? [config.algorithm] : ['HS256']
  }) as JWTClaims
}

/**
 * Resposta padrão para não autorizado
 */
function respondUnauthorized(res: Response, message: string): void {
  res.status(401).json({
    error: 'Unauthorized',
    code: 'UNAUTHORIZED',
    message
  })
}