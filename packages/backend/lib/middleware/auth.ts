/**
 * Authentication Middleware
 * 
 * Middleware for verifying API keys in extension endpoints
 */

import { NextResponse } from 'next/server'
import { getApiKeyByKey } from '@/lib/database'

export interface AuthenticatedRequest extends Request {
  userId?: string
  apiKey?: string
}

/**
 * Verify API key from request headers
 */
export async function verifyApiKey(request: Request): Promise<{
  valid: boolean
  userId?: string
  error?: string
}> {
  const apiKey = request.headers.get('X-API-Key')

  if (!apiKey) {
    return {
      valid: false,
      error: 'API key is required',
    }
  }

  try {
    const keyData = await getApiKeyByKey(apiKey)
    
    if (!keyData) {
      return {
        valid: false,
        error: 'Invalid API key',
      }
    }

    return {
      valid: true,
      userId: keyData.user_id,
    }
  } catch (error) {
    console.error('API key verification error:', error)
    return {
      valid: false,
      error: 'Failed to verify API key',
    }
  }
}

/**
 * Middleware wrapper for API routes
 * 
 * Usage:
 * ```ts
 * export const POST = withAuth(async (request, { userId }) => {
 *   // Your handler code here
 *   // userId is guaranteed to be set
 * })
 * ```
 */
export function withAuth(
  handler: (
    request: Request,
    context: { userId: string; apiKey: string }
  ) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    try {
      const keyData = await getApiKeyByKey(apiKey)

      if (!keyData) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }

      // Call the handler with authenticated context
      return await handler(request, {
        userId: keyData.user_id,
        apiKey: apiKey,
      })
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Rate limiting (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetAt) {
    // Create new record
    const resetAt = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment count
  record.count++
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt }
}

/**
 * Middleware with rate limiting
 */
export function withAuthAndRateLimit(
  handler: (
    request: Request,
    context: { userId: string; apiKey: string }
  ) => Promise<NextResponse>,
  options: { limit?: number; windowMs?: number } = {}
) {
  return async (request: Request): Promise<NextResponse> => {
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(
      apiKey,
      options.limit || 100,
      options.windowMs || 60000
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(options.limit || 100),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      )
    }

    try {
      const keyData = await getApiKeyByKey(apiKey)

      if (!keyData) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }

      // Call the handler with authenticated context
      const response = await handler(request, {
        userId: keyData.user_id,
        apiKey: apiKey,
      })

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', String(options.limit || 100))
      response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
      response.headers.set('X-RateLimit-Reset', String(rateLimit.resetAt))

      return response
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}
