/**
 * Performance Monitoring
 * Track and measure application performance
 */

interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
  tags?: Record<string, string>
}

interface PerformanceReport {
  metrics: PerformanceMetric[]
  summary: {
    totalDuration: number
    averageDuration: number
    minDuration: number
    maxDuration: number
    count: number
  }
}

/**
 * Performance timer
 */
export class PerformanceTimer {
  private startTime: number
  private endTime?: number
  private marks: Map<string, number> = new Map()

  constructor() {
    this.startTime = performance.now()
  }

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * Measure duration between two marks
   */
  measure(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark)
    const end = this.marks.get(endMark)

    if (!start || !end) {
      throw new Error(`Mark not found: ${!start ? startMark : endMark}`)
    }

    return end - start
  }

  /**
   * Get duration from start
   */
  getDuration(mark?: string): number {
    if (mark) {
      const markTime = this.marks.get(mark)
      if (!markTime) {
        throw new Error(`Mark not found: ${mark}`)
      }
      return markTime - this.startTime
    }

    const endTime = this.endTime || performance.now()
    return endTime - this.startTime
  }

  /**
   * Stop timer
   */
  stop(): number {
    this.endTime = performance.now()
    return this.getDuration()
  }

  /**
   * Get all marks
   */
  getMarks(): Record<string, number> {
    return Object.fromEntries(this.marks)
  }
}

/**
 * Performance tracker
 */
export class PerformanceTracker {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000

  /**
   * Record a metric
   */
  record(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms',
    tags?: Record<string, string>
  ): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    })

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Get performance report
   */
  getReport(name: string): PerformanceReport {
    const metrics = this.getMetrics(name)
    
    if (metrics.length === 0) {
      return {
        metrics: [],
        summary: {
          totalDuration: 0,
          averageDuration: 0,
          minDuration: 0,
          maxDuration: 0,
          count: 0
        }
      }
    }

    const values = metrics.map(m => m.value)
    const totalDuration = values.reduce((a, b) => a + b, 0)
    const averageDuration = totalDuration / values.length
    const minDuration = Math.min(...values)
    const maxDuration = Math.max(...values)

    return {
      metrics,
      summary: {
        totalDuration,
        averageDuration,
        minDuration,
        maxDuration,
        count: metrics.length
      }
    }
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * Export metrics
   */
  export(): PerformanceMetric[] {
    return [...this.metrics]
  }
}

/**
 * Function performance wrapper
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  tracker?: PerformanceTracker
): Promise<{ result: T; duration: number }> {
  const timer = new PerformanceTimer()
  
  try {
    const result = await fn()
    const duration = timer.stop()

    if (tracker) {
      tracker.record(name, duration)
    }

    return { result, duration }
  } catch (error) {
    const duration = timer.stop()
    
    if (tracker) {
      tracker.record(`${name}:error`, duration)
    }

    throw error
  }
}

/**
 * Database query performance tracker
 */
export class QueryPerformanceTracker {
  private queries: Array<{
    query: string
    duration: number
    timestamp: number
  }> = []

  /**
   * Track query
   */
  track(query: string, duration: number): void {
    this.queries.push({
      query,
      duration,
      timestamp: Date.now()
    })

    // Keep only last 100 queries
    if (this.queries.length > 100) {
      this.queries.shift()
    }
  }

  /**
   * Get slow queries
   */
  getSlowQueries(thresholdMs = 1000): typeof this.queries {
    return this.queries.filter(q => q.duration > thresholdMs)
  }

  /**
   * Get query statistics
   */
  getStats() {
    if (this.queries.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        slowQueries: 0
      }
    }

    const durations = this.queries.map(q => q.duration)
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const slowQueries = this.getSlowQueries().length

    return {
      count: this.queries.length,
      averageDuration,
      slowQueries
    }
  }

  /**
   * Clear queries
   */
  clear(): void {
    this.queries = []
  }
}

/**
 * API endpoint performance tracker
 */
export class ApiPerformanceTracker {
  private requests: Map<string, number[]> = new Map()

  /**
   * Track request
   */
  track(endpoint: string, duration: number): void {
    const durations = this.requests.get(endpoint) || []
    durations.push(duration)

    // Keep only last 100 requests per endpoint
    if (durations.length > 100) {
      durations.shift()
    }

    this.requests.set(endpoint, durations)
  }

  /**
   * Get endpoint statistics
   */
  getStats(endpoint: string) {
    const durations = this.requests.get(endpoint) || []

    if (durations.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0
      }
    }

    const sorted = [...durations].sort((a, b) => a - b)
    const count = sorted.length
    const average = sorted.reduce((a, b) => a + b, 0) / count
    const min = sorted[0]
    const max = sorted[count - 1]
    const p50 = sorted[Math.floor(count * 0.5)]
    const p95 = sorted[Math.floor(count * 0.95)]
    const p99 = sorted[Math.floor(count * 0.99)]

    return {
      count,
      average,
      min,
      max,
      p50,
      p95,
      p99
    }
  }

  /**
   * Get all endpoints
   */
  getAllStats() {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {}

    for (const endpoint of this.requests.keys()) {
      stats[endpoint] = this.getStats(endpoint)
    }

    return stats
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.requests.clear()
  }
}

// Global trackers
export const globalPerformanceTracker = new PerformanceTracker()
export const queryPerformanceTracker = new QueryPerformanceTracker()
export const apiPerformanceTracker = new ApiPerformanceTracker()

/**
 * Performance decorator
 */
export function Measure(tracker?: PerformanceTracker) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const timer = new PerformanceTimer()
      
      try {
        const result = await originalMethod.apply(this, args)
        const duration = timer.stop()

        const trackerToUse = tracker || globalPerformanceTracker
        trackerToUse.record(propertyKey, duration)

        return result
      } catch (error) {
        const duration = timer.stop()
        const trackerToUse = tracker || globalPerformanceTracker
        trackerToUse.record(`${propertyKey}:error`, duration)

        throw error
      }
    }

    return descriptor
  }
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`
  } else {
    return `${(ms / 60000).toFixed(2)}m`
  }
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
