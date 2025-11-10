/**
 * Error Tracking System
 * Logs and tracks errors for monitoring and debugging
 */

import { createClient } from '@supabase/supabase-js'

interface ErrorLog {
  timestamp: Date
  level: 'error' | 'warn' | 'info'
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  route?: string
  method?: string
  statusCode?: number
}

// Initialize Supabase client for error logging
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

/**
 * Log error to database and console
 */
export async function logError(error: ErrorLog): Promise<void> {
  // Always log to console
  const logLevel = error.level === 'error' ? console.error : error.level === 'warn' ? console.warn : console.log
  
  logLevel(`[${error.level.toUpperCase()}] ${error.message}`, {
    route: error.route,
    method: error.method,
    statusCode: error.statusCode,
    context: error.context,
    stack: error.stack,
  })

  // Log to database if available
  if (supabase) {
    try {
      await supabase.from('error_logs').insert({
        level: error.level,
        message: error.message,
        stack: error.stack,
        context: error.context,
        user_id: error.userId,
        route: error.route,
        method: error.method,
        status_code: error.statusCode,
        created_at: error.timestamp.toISOString(),
      })
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError)
    }
  }
}

/**
 * Track API error
 */
export async function trackAPIError(
  error: Error,
  context: {
    route: string
    method: string
    userId?: string
    statusCode?: number
    additionalContext?: Record<string, any>
  }
): Promise<void> {
  await logError({
    timestamp: new Date(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    userId: context.userId,
    route: context.route,
    method: context.method,
    statusCode: context.statusCode || 500,
    context: context.additionalContext,
  })
}

/**
 * Track warning
 */
export async function trackWarning(
  message: string,
  context?: {
    route?: string
    method?: string
    userId?: string
    additionalContext?: Record<string, any>
  }
): Promise<void> {
  await logError({
    timestamp: new Date(),
    level: 'warn',
    message,
    userId: context?.userId,
    route: context?.route,
    method: context?.method,
    context: context?.additionalContext,
  })
}

/**
 * Track info event
 */
export async function trackInfo(
  message: string,
  context?: {
    route?: string
    method?: string
    userId?: string
    additionalContext?: Record<string, any>
  }
): Promise<void> {
  await logError({
    timestamp: new Date(),
    level: 'info',
    message,
    userId: context?.userId,
    route: context?.route,
    method: context?.method,
    context: context?.additionalContext,
  })
}

/**
 * Get error statistics
 */
export async function getErrorStats(
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
): Promise<{
  total: number
  byLevel: Record<string, number>
  byRoute: Record<string, number>
  recent: ErrorLog[]
}> {
  if (!supabase) {
    return {
      total: 0,
      byLevel: {},
      byRoute: {},
      recent: [],
    }
  }

  const timeRangeMap = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
  }

  const hoursAgo = timeRangeMap[timeRange]
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

  try {
    const { data: errors, error } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    if (error) throw error

    const total = errors?.length || 0
    const byLevel: Record<string, number> = {}
    const byRoute: Record<string, number> = {}

    errors?.forEach((err) => {
      byLevel[err.level] = (byLevel[err.level] || 0) + 1
      if (err.route) {
        byRoute[err.route] = (byRoute[err.route] || 0) + 1
      }
    })

    const recent = (errors?.slice(0, 10) || []).map((err) => ({
      timestamp: new Date(err.created_at),
      level: err.level,
      message: err.message,
      stack: err.stack,
      context: err.context,
      userId: err.user_id,
      route: err.route,
      method: err.method,
      statusCode: err.status_code,
    }))

    return {
      total,
      byLevel,
      byRoute,
      recent,
    }
  } catch (error) {
    console.error('Failed to get error stats:', error)
    return {
      total: 0,
      byLevel: {},
      byRoute: {},
      recent: [],
    }
  }
}

/**
 * Create error tracking middleware
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  route: string
): T {
  return (async (...args: any[]) => {
    try {
      const response = await handler(...args)
      
      // Track non-2xx responses as warnings
      if (response.status >= 400) {
        const body = await response.clone().json().catch(() => ({}))
        await trackWarning(`HTTP ${response.status} on ${route}`, {
          route,
          method: args[0]?.method || 'UNKNOWN',
          additionalContext: { statusCode: response.status, body },
        })
      }
      
      return response
    } catch (error: any) {
      // Track errors
      await trackAPIError(error, {
        route,
        method: args[0]?.method || 'UNKNOWN',
      })
      
      // Re-throw error
      throw error
    }
  }) as T
}
