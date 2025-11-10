/**
 * Performance Optimization - Caching
 * In-memory and distributed caching utilities
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/**
 * In-memory cache with TTL support
 */
export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(cleanupIntervalMs = 60000) {
    // Start cleanup interval
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, cleanupIntervalMs)
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  /**
   * Set value in cache with TTL
   */
  set(key: string, value: T, ttlSeconds = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    
    this.cache.set(key, {
      value,
      expiresAt
    })
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

/**
 * Cache with automatic key generation
 */
export class AutoKeyCache<T = any> extends MemoryCache<T> {
  /**
   * Generate cache key from function arguments
   */
  private generateKey(fn: (...args: any[]) => any, args: any[]): string {
    const fnName = fn.name || 'anonymous'
    const argsKey = JSON.stringify(args)
    return `${fnName}:${argsKey}`
  }

  /**
   * Memoize function with caching
   */
  memoize<F extends (...args: any[]) => any>(
    fn: F,
    ttlSeconds = 300
  ): F {
    return ((...args: any[]) => {
      const key = this.generateKey(fn, args)
      
      // Check cache
      const cached = this.get(key)
      if (cached !== null) {
        return cached
      }
      
      // Execute function and cache result
      const result = fn(...args)
      this.set(key, result, ttlSeconds)
      
      return result
    }) as F
  }

  /**
   * Memoize async function with caching
   */
  memoizeAsync<F extends (...args: any[]) => Promise<any>>(
    fn: F,
    ttlSeconds = 300
  ): F {
    return (async (...args: any[]) => {
      const key = this.generateKey(fn, args)
      
      // Check cache
      const cached = this.get(key)
      if (cached !== null) {
        return cached
      }
      
      // Execute function and cache result
      const result = await fn(...args)
      this.set(key, result, ttlSeconds)
      
      return result
    }) as F
  }
}

/**
 * Response cache for API endpoints
 */
export class ResponseCache {
  private cache = new MemoryCache<{
    body: any
    headers: Record<string, string>
    status: number
  }>()

  /**
   * Generate cache key from request
   */
  private generateKey(method: string, url: string, body?: any): string {
    const bodyKey = body ? JSON.stringify(body) : ''
    return `${method}:${url}:${bodyKey}`
  }

  /**
   * Get cached response
   */
  get(method: string, url: string, body?: any) {
    const key = this.generateKey(method, url, body)
    return this.cache.get(key)
  }

  /**
   * Cache response
   */
  set(
    method: string,
    url: string,
    response: {
      body: any
      headers: Record<string, string>
      status: number
    },
    ttlSeconds = 300,
    body?: any
  ): void {
    const key = this.generateKey(method, url, body)
    this.cache.set(key, response, ttlSeconds)
  }

  /**
   * Invalidate cache for URL pattern
   */
  invalidate(pattern: string): void {
    // This is a simple implementation
    // In production, use Redis with pattern matching
    this.cache.clear()
  }
}

/**
 * Query result cache
 */
export class QueryCache<T = any> {
  private cache = new MemoryCache<T>()

  /**
   * Get or fetch data
   */
  async getOrFetch(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    // Check cache
    const cached = this.cache.get(key)
    if (cached !== null) {
      return cached
    }

    // Fetch and cache
    const data = await fetcher()
    this.cache.set(key, data, ttlSeconds)

    return data
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate all
   */
  invalidateAll(): void {
    this.cache.clear()
  }
}

// Global cache instances
export const globalCache = new MemoryCache()
export const autoKeyCache = new AutoKeyCache()
export const responseCache = new ResponseCache()
export const queryCache = new QueryCache()

/**
 * Cache decorator for class methods
 */
export function Cached(ttlSeconds = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const cache = new MemoryCache()

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}:${JSON.stringify(args)}`
      
      const cached = cache.get(key)
      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      cache.set(key, result, ttlSeconds)

      return result
    }

    return descriptor
  }
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

export class CacheWithStats<T = any> extends MemoryCache<T> {
  private hits = 0
  private misses = 0

  get(key: string): T | null {
    const value = super.get(key)
    
    if (value !== null) {
      this.hits++
    } else {
      this.misses++
    }

    return value
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? this.hits / total : 0

    return {
      size: this.size(),
      hits: this.hits,
      misses: this.misses,
      hitRate
    }
  }

  resetStats(): void {
    this.hits = 0
    this.misses = 0
  }
}
