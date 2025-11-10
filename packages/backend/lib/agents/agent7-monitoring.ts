/**
 * Agent 7: System Monitoring & Observability
 * Tracks errors, performance, user analytics, and system health
 */

import { createLogger } from '../utils/logger'
import { createClient } from '@supabase/supabase-js'

export interface Agent7Request {
  projectId: string
  task: {
    type: 'log-error' | 'log-event' | 'get-metrics' | 'health-check' | 'analytics'
    data?: any
    timeRange?: {
      start: string
      end: string
    }
  }
}

export interface Agent7Result {
  success: boolean
  metrics?: {
    errors: {
      total: number
      byLevel: Record<string, number>
      recent: Array<{
        message: string
        level: string
        timestamp: string
      }>
    }
    performance?: {
      avgResponseTime: number
      p95ResponseTime: number
      p99ResponseTime: number
    }
    users?: {
      total: number
      active: number
      new: number
    }
    system?: {
      uptime: number
      status: 'healthy' | 'degraded' | 'down'
      lastCheck: string
    }
  }
  logs?: any[]
  recommendations: string[]
  errors?: string[]
}

/**
 * Agent 7 Main Function
 */
export async function agent7Monitor(
  request: Agent7Request
): Promise<Agent7Result> {
  const result: Agent7Result = {
    success: false,
    recommendations: []
  }
  
  try {
    logger.info('[Agent 7] Starting monitoring task...')
    logger.info('[Agent 7] Task:', { data: request.task.type })
    
    switch (request.task.type) {
      case 'log-error':
        await logError(request, result)
        break
        
      case 'log-event':
        await logEvent(request, result)
        break
        
      case 'get-metrics':
        await getMetrics(request, result)
        break
        
      case 'health-check':
        await healthCheck(request, result)
        break
        
      case 'analytics':
        await getAnalytics(request, result)
        break
    }
    
    result.success = true
    logger.info('[Agent 7] ✅ Monitoring task complete!')
    
    return result
    
  } catch (error) {
    logger.error('[Agent 7] ❌ Error:', error instanceof Error ? error : new Error(String(error)))
    result.errors = result.errors || []
    result.errors.push(error instanceof Error ? error.message : String(error))
    return result
  }
}

/**
 * Log error to database
 */
async function logError(
  request: Agent7Request,
  result: Agent7Result
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('logs')
    .insert({
      project_id: request.projectId,
      level: 'error',
      message: request.task.data?.message || 'Unknown error',
      metadata: request.task.data?.metadata || {},
      created_at: new Date().toISOString()
    })
  
  if (error) {
    throw error
  }
  
  result.recommendations.push('Error logged successfully')
  result.recommendations.push('Check System Logs in admin dashboard')
}

/**
 * Log event to database
 */
async function logEvent(
  request: Agent7Request,
  result: Agent7Result
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('logs')
    .insert({
      project_id: request.projectId,
      level: 'info',
      message: request.task.data?.message || 'Event logged',
      metadata: request.task.data?.metadata || {},
      created_at: new Date().toISOString()
    })
  
  if (error) {
    throw error
  }
  
  result.recommendations.push('Event logged successfully')
}

/**
 * Get system metrics
 */
async function getMetrics(
  request: Agent7Request,
  result: Agent7Result
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Get error metrics
  const { data: errorLogs, error: errorLogsError } = await supabase
    .from('logs')
    .select('*')
    .eq('project_id', request.projectId)
    .in('level', ['error', 'warning'])
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (errorLogsError) throw errorLogsError
  
  // Count by level
  const byLevel: Record<string, number> = {}
  errorLogs?.forEach(log => {
    byLevel[log.level] = (byLevel[log.level] || 0) + 1
  })
  
  // Get user metrics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_sign_in_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  
  result.metrics = {
    errors: {
      total: errorLogs?.length || 0,
      byLevel,
      recent: (errorLogs || []).slice(0, 10).map(log => ({
        message: log.message,
        level: log.level,
        timestamp: log.created_at
      }))
    },
    users: {
      total: totalUsers || 0,
      active: activeUsers || 0,
      new: newUsers || 0
    }
  }
  
  // Recommendations based on metrics
  if (result.metrics.errors.total > 50) {
    result.recommendations.push('⚠️ High error rate detected')
    result.recommendations.push('Review recent errors in System Logs')
  } else {
    result.recommendations.push('✅ Error rate is normal')
  }
  
  if (result.metrics.users && result.metrics.users.active < result.metrics.users.total * 0.2) {
    result.recommendations.push('⚠️ Low user engagement')
    result.recommendations.push('Consider user retention strategies')
  } else if (result.metrics.users) {
    result.recommendations.push('✅ Good user engagement')
  }
}

/**
 * Health check
 */
async function healthCheck(
  request: Agent7Request,
  result: Agent7Result
): Promise<void> {
  const checks = {
    database: false,
    api: false,
    auth: false
  }
  
  // Check database
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.database = !error
  } catch (error) {
    checks.database = false
  }
  
  // Check API
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`)
    checks.api = response.ok
  } catch (error) {
    checks.api = false
  }
  
  // Check auth
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.auth.getSession()
    checks.auth = !error
  } catch (error) {
    checks.auth = false
  }
  
  const allHealthy = Object.values(checks).every(check => check)
  
  result.metrics = {
    errors: { total: 0, byLevel: {}, recent: [] },
    system: {
      uptime: process.uptime(),
      status: allHealthy ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString()
    }
  }
  
  if (allHealthy) {
    result.recommendations.push('✅ All systems operational')
  } else {
    result.recommendations.push('⚠️ Some systems are degraded')
    if (!checks.database) result.recommendations.push('- Database connection failed')
    if (!checks.api) result.recommendations.push('- API is not responding')
    if (!checks.auth) result.recommendations.push('- Auth service is down')
  }
}

/**
 * Get analytics
 */
async function getAnalytics(
  request: Agent7Request,
  result: Agent7Result
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const timeRange = request.task.timeRange || {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  }
  
  // Get activity logs
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('created_at', timeRange.start)
    .lte('created_at', timeRange.end)
    .order('created_at', { ascending: false })
  
  // Get API usage
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('usage_count')
  
  const totalApiCalls = apiKeys?.reduce((sum, key) => sum + (key.usage_count || 0), 0) || 0
  
  // Get user growth
  const { data: userGrowth } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', timeRange.start)
    .lte('created_at', timeRange.end)
  
  result.logs = activityLogs || []
  
  result.recommendations.push(`Total activity logs: ${activityLogs?.length || 0}`)
  result.recommendations.push(`Total API calls: ${totalApiCalls}`)
  result.recommendations.push(`New users: ${userGrowth?.length || 0}`)
  result.recommendations.push('View detailed analytics in Admin Dashboard')
}

/**
 * Setup monitoring alerts
 */
export async function setupMonitoringAlerts(
  projectId: string,
  config: {
    errorThreshold: number
    notifyEmail?: string
    notifyWebhook?: string
  }
): Promise<void> {
  logger.info('[Agent 7] Setting up monitoring alerts...')
  logger.info('[Agent 7] Error threshold:', { data: config.errorThreshold })
  
  // This would integrate with services like:
  // - Sentry for error tracking
  // - LogRocket for session replay
  // - Datadog for metrics
  // - PagerDuty for alerts
  
  // For now, we'll log to database
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  await supabase.from('logs').insert({
    project_id: projectId,
    level: 'info',
    message: 'Monitoring alerts configured',
    metadata: config,
    created_at: new Date().toISOString()
  })
  
  logger.info('[Agent 7] ✅ Monitoring alerts configured')
}

/**
 * Validate Agent 7 request
 */
export function validateAgent7Request(request: Agent7Request): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!request.projectId) {
    errors.push('Project ID is required')
  }
  
  if (!request.task) {
    errors.push('Task is required')
  } else {
    if (!request.task.type) {
      errors.push('Task type is required')
    }
    
    if ((request.task.type === 'log-error' || request.task.type === 'log-event') && !request.task.data) {
      errors.push('Data is required for logging tasks')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
