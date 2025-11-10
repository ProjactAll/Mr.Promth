/**
 * Rate Limiting Utilities
 * Uses in-memory rate limiting for development
 * Can be upgraded to Upstash Redis for production
 */

interface RateLimitConfig {
  requests: number
  window: number // in seconds
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-memory rate limiter
 * For production, consider using Upstash Redis or similar
 */
export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowMs = this.config.window * 1000
    const resetAt = now + windowMs

    // Get or create rate limit entry
    let entry = rateLimitStore.get(identifier)

    // Reset if window has passed
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt }
      rateLimitStore.set(identifier, entry)
    }

    // Increment count
    entry.count++

    const remaining = Math.max(0, this.config.requests - entry.count)
    const success = entry.count <= this.config.requests

    return {
      success,
      limit: this.config.requests,
      remaining,
      reset: Math.floor(entry.resetAt / 1000),
    }
  }

  async reset(identifier: string): Promise<void> {
    rateLimitStore.delete(identifier)
  }
}

// Default rate limiters
export const apiRateLimiter = new RateLimiter({
  requests: 60,
  window: 60, // 60 requests per minute
})

export const authRateLimiter = new RateLimiter({
  requests: 5,
  window: 60, // 5 requests per minute
})

export const adminRateLimiter = new RateLimiter({
  requests: 100,
  window: 60, // 100 requests per minute
})

export const aiRateLimiter = new RateLimiter({
  requests: 10,
  window: 60, // 10 requests per minute
})

/**
 * Get rate limit config from database
 */
export async function getRateLimitConfig(type: string): Promise<RateLimitConfig> {
  // This would fetch from database in production
  // For now, return defaults
  const defaults: Record<string, RateLimitConfig> = {
    api: { requests: 60, window: 60 },
    auth: { requests: 5, window: 60 },
    admin: { requests: 100, window: 60 },
    ai: { requests: 10, window: 60 },
  }

  return defaults[type] || defaults.api
}

/**
 * Apply rate limiting to API routes
 */
export async function applyRateLimit(
  identifier: string,
  limiter: RateLimiter
): Promise<RateLimitResult> {
  return await limiter.limit(identifier)
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return ip
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
