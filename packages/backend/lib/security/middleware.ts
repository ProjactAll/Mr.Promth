/**
 * Security Middleware
 * Comprehensive security headers and protections
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security headers configuration
 */
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}

/**
 * CORS configuration
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(response: NextResponse, allowAll = false): NextResponse {
  if (allowAll) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  } else {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  
  return response
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // Allow requests without origin header
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean)
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed!))
}

/**
 * Rate limit headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  
  return response
}

/**
 * Check for suspicious patterns in request
 */
export function detectSuspiciousActivity(request: NextRequest): {
  suspicious: boolean
  reason?: string
} {
  const url = request.nextUrl.pathname
  const query = request.nextUrl.search
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\.\//,  // Directory traversal
    /<script/i, // XSS attempt
    /union.*select/i, // SQL injection
    /exec\s*\(/i, // Code execution
    /eval\s*\(/i, // Code evaluation
    /base64_decode/i, // Obfuscation
    /system\s*\(/i, // System commands
    /%00/, // Null byte injection
    /\.\./  // Path traversal
  ]
  
  const fullUrl = url + query
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      return {
        suspicious: true,
        reason: `Suspicious pattern detected: ${pattern.source}`
      }
    }
  }
  
  // Check for excessive query parameters
  const params = new URLSearchParams(query)
  if (Array.from(params.keys()).length > 50) {
    return {
      suspicious: true,
      reason: 'Excessive query parameters'
    }
  }
  
  // Check for excessively long URLs
  if (fullUrl.length > 2000) {
    return {
      suspicious: true,
      reason: 'Excessively long URL'
    }
  }
  
  return { suspicious: false }
}

/**
 * Validate request body size
 */
export async function validateBodySize(
  request: NextRequest,
  maxSize = 10 * 1024 * 1024 // 10MB default
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (size > maxSize) {
      return {
        valid: false,
        error: `Request body too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      }
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize request headers
 */
export function sanitizeHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // Only allow safe headers
  const allowedHeaders = [
    'content-type',
    'authorization',
    'user-agent',
    'accept',
    'accept-language',
    'cache-control'
  ]
  
  for (const header of allowedHeaders) {
    const value = request.headers.get(header)
    if (value) {
      headers[header] = value
    }
  }
  
  return headers
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const sessionCookie = request.cookies.get('session')
  
  return !!(authHeader || sessionCookie)
}

/**
 * Extract and validate API key
 */
export function validateApiKey(request: NextRequest): {
  valid: boolean
  apiKey?: string
  error?: string
} {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return { valid: false, error: 'Missing authorization header' }
  }
  
  const parts = authHeader.split(' ')
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { valid: false, error: 'Invalid authorization format' }
  }
  
  const apiKey = parts[1]
  
  // Validate API key format
  if (!apiKey || apiKey.length < 32) {
    return { valid: false, error: 'Invalid API key format' }
  }
  
  return { valid: true, apiKey }
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details
  }
  
  console.warn('[SECURITY]', JSON.stringify(logEntry))
  
  // In production, send to logging service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Create security error response
 */
export function securityErrorResponse(
  message: string,
  status = 403
): NextResponse {
  return NextResponse.json(
    {
      error: 'Security Error',
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}
