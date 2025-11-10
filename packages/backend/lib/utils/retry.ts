/**
 * Retry Utility
 * Implements retry logic with exponential backoff
 */

import { createLogger } from './logger'

const logger = createLogger({ component: 'Retry' })

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: Error) => boolean
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  shouldRetry: () => true
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options }
  let lastError: Error | null = null
  let delay = opts.initialDelay

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      logger.debug(`Attempt ${attempt}/${opts.maxAttempts}`)
      const result = await fn()
      
      if (attempt > 1) {
        logger.info(`Succeeded on attempt ${attempt}`)
      }
      
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if we should retry
      if (!opts.shouldRetry(lastError)) {
        logger.warn('Error not retryable', { error: lastError.message })
        throw lastError
      }

      // Check if this was the last attempt
      if (attempt === opts.maxAttempts) {
        logger.error(`All ${opts.maxAttempts} attempts failed`, { error: lastError.message })
        throw lastError
      }

      // Wait before retrying
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { 
        error: lastError.message 
      })
      
      await sleep(delay)
      
      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed')
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable (network, timeout, rate limit)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()
  
  // Network errors
  if (message.includes('network') || 
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')) {
    return true
  }

  // Rate limit errors
  if (message.includes('rate limit') || 
      message.includes('too many requests') ||
      message.includes('429')) {
    return true
  }

  // Temporary server errors
  if (message.includes('500') || 
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')) {
    return true
  }

  return false
}

/**
 * Retry with custom error check
 */
export async function retryWithCheck<T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, 'shouldRetry'> = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    shouldRetry: isRetryableError
  })
}
