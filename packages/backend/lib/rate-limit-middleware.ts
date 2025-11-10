import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter, getClientIdentifier } from './ratelimit'

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const identifier = getClientIdentifier(request)

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'คุณส่ง request มากเกินไป กรุณารอสักครู่แล้วลองใหม่',
        limit,
        remaining: 0,
        reset,
        retryAfter: reset - Math.floor(Date.now() / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': (reset - Math.floor(Date.now() / 1000)).toString(),
        },
      }
    )
  }

  // Call the actual handler
  const response = await handler(request)

  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())

  return response
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function rateLimit(limiter: RateLimiter) {
  return function (
    handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
      return withRateLimit(request, limiter, (req) => handler(req, ...args))
    }
  }
}
