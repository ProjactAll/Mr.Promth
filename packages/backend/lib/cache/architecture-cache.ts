/**
 * Architecture Template Cache
 * Caches common architecture patterns to speed up Agent 2
 */

import { createLogger } from '../utils/logger'
import { createHash } from 'crypto'

const logger = createLogger({ component: 'ArchitectureCache' })

interface CachedArchitecture {
  key: string
  architecture: any
  timestamp: number
  hits: number
}

class ArchitectureCache {
  private cache: Map<string, CachedArchitecture> = new Map()
  private maxSize: number = 100
  private ttl: number = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Generate cache key from prompt features
   */
  private generateKey(features: string[]): string {
    const normalized = features
      .map(f => f.toLowerCase().trim())
      .sort()
      .join('|')
    return createHash('sha256').update(normalized).digest('hex').substring(0, 16)
  }

  /**
   * Get cached architecture
   */
  get(features: string[]): any | null {
    const key = this.generateKey(features)
    const cached = this.cache.get(key)

    if (!cached) {
      logger.debug('Cache miss', { key })
      return null
    }

    // Check if expired
    const age = Date.now() - cached.timestamp
    if (age > this.ttl) {
      logger.debug('Cache expired', { key, age })
      this.cache.delete(key)
      return null
    }

    // Update hits
    cached.hits++
    logger.info('Cache hit', { key, hits: cached.hits })

    return cached.architecture
  }

  /**
   * Set cached architecture
   */
  set(features: string[], architecture: any): void {
    const key = this.generateKey(features)

    // Evict oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
      
      if (oldest) {
        this.cache.delete(oldest[0])
        logger.debug('Evicted oldest cache entry', { key: oldest[0] })
      }
    }

    this.cache.set(key, {
      key,
      architecture,
      timestamp: Date.now(),
      hits: 0
    })

    logger.info('Cached architecture', { key, size: this.cache.size })
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    logger.info('Cache cleared')
  }

  /**
   * Get cache stats
   */
  getStats() {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0)
    const avgAge = entries.length > 0
      ? entries.reduce((sum, e) => sum + (Date.now() - e.timestamp), 0) / entries.length
      : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      avgHits: entries.length > 0 ? totalHits / entries.length : 0,
      avgAge: Math.round(avgAge / 1000), // seconds
      hitRate: totalHits > 0 ? (totalHits / (totalHits + this.cache.size)) * 100 : 0
    }
  }
}

// Singleton instance
export const architectureCache = new ArchitectureCache()
