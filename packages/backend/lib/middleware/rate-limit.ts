/**
 * Rate Limiting Middleware
 * Prevents API abuse and DDoS attacks
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later' } = config
  
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address or user ID)
    const identifier = getClientIdentifier(request)
    
    // Get current time
    const now = Date.now()
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(identifier)
    
    // Reset if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      }
      rateLimitStore.set(identifier, entry)
    }
    
    // Increment counter
    entry.count++
    
    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: message,
          retryAfter: `${retryAfter}s`
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      )
    }
    
    // Allow request
    return null
  }
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }
  
  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Clean up expired entries periodically
 */
export function startRateLimitCleanup() {
  setInterval(() => {
    const now = Date.now()
    
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}

/**
 * Predefined rate limit configs
 */
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10
  },
  
  // Standard: 30 requests per minute
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 30
  },
  
  // Generous: 100 requests per minute
  generous: {
    windowMs: 60 * 1000,
    maxRequests: 100
  },
  
  // Workflow: 5 workflows per hour
  workflow: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Maximum 5 workflows per hour. Please wait before creating a new workflow.'
  },
  
  // AI Generation: 20 requests per minute
  aiGeneration: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'AI generation rate limit exceeded. Please slow down.'
  }
}
