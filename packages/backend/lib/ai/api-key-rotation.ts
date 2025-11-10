/**
 * API Key Rotation System for Manus AI
 * Automatically rotates between multiple API keys when quota is exhausted
 */

import OpenAI from 'openai';
import { createLogger } from '../utils/logger';

const logger = createLogger({ component: 'APIKeyRotation' });

interface APIKeyConfig {
  key: string;
  baseURL: string;
  name: string;
  quota: number;
  used: number;
  lastError?: string;
  lastErrorTime?: number;
  isActive: boolean;
}

class APIKeyRotationManager {
  private keys: APIKeyConfig[] = [];
  private currentIndex: number = 0;
  private readonly errorCooldown = 60000; // 1 minute

  constructor() {
    this.initializeKeys();
  }

  /**
   * Initialize API keys from environment and user-provided keys
   */
  private initializeKeys() {
    // Primary Manus API keys (from environment)
    const manusKeys = [
      {
        key: process.env.OPENAI_API_KEY || '',
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        name: 'Manus Primary',
        quota: 1000000,
        used: 0,
        isActive: true
      }
    ];

    // Backup/Fallback keys (user-provided)
    const backupKeys = [
      {
        key: 'sk-By3zvcT8Bq7ajCGgR7m8F3',
        baseURL: 'https://api.manus.im/api/llm-proxy/v1',
        name: 'User Backup 1',
        quota: 1000000,
        used: 0,
        isActive: true
      }
    ];

    // Add all valid keys
    this.keys = [...manusKeys, ...backupKeys].filter(k => k.key && k.key.length > 0);

    logger.info(`Initialized ${this.keys.length} API keys for rotation`);
  }

  /**
   * Get current active API key
   */
  public getCurrentKey(): APIKeyConfig {
    // Find first healthy key
    for (let i = 0; i < this.keys.length; i++) {
      const index = (this.currentIndex + i) % this.keys.length;
      const key = this.keys[index];

      if (this.isKeyHealthy(key)) {
        this.currentIndex = index;
        return key;
      }
    }

    // If all keys are unhealthy, return current and reset error
    const fallback = this.keys[this.currentIndex];
    fallback.lastError = undefined;
    fallback.lastErrorTime = undefined;
    logger.warn('All keys unhealthy, resetting current key');
    return fallback;
  }

  /**
   * Check if key is healthy
   */
  private isKeyHealthy(key: APIKeyConfig): boolean {
    if (!key.isActive) return false;

    // Check if in error cooldown
    if (key.lastErrorTime) {
      const timeSinceError = Date.now() - key.lastErrorTime;
      if (timeSinceError < this.errorCooldown) {
        return false;
      }
    }

    // Check quota
    if (key.used >= key.quota) {
      logger.warn(`Key ${key.name} quota exhausted: ${key.used}/${key.quota}`);
      return false;
    }

    return true;
  }

  /**
   * Report successful API call
   */
  public reportSuccess(tokens: number = 1) {
    const key = this.keys[this.currentIndex];
    key.used += tokens;
    key.lastError = undefined;
    key.lastErrorTime = undefined;

    logger.debug(`API call success: ${key.name} (${key.used}/${key.quota})`);
  }

  /**
   * Report failed API call and rotate to next key
   */
  public reportError(error: string) {
    const key = this.keys[this.currentIndex];
    key.lastError = error;
    key.lastErrorTime = Date.now();

    logger.error(`API call failed: ${key.name} - ${error}`);

    // Check if quota error
    if (error.includes('quota') || error.includes('rate_limit') || error.includes('insufficient')) {
      key.isActive = false;
      logger.warn(`Deactivating key ${key.name} due to quota/rate limit`);
    }

    // Rotate to next key
    this.rotateKey();
  }

  /**
   * Rotate to next available key
   */
  private rotateKey() {
    const startIndex = this.currentIndex;
    
    do {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      const key = this.keys[this.currentIndex];

      if (this.isKeyHealthy(key)) {
        logger.info(`Rotated to key: ${key.name}`);
        return;
      }

      // If we've checked all keys, break
      if (this.currentIndex === startIndex) {
        logger.error('No healthy keys available after full rotation');
        break;
      }
    } while (true);
  }

  /**
   * Create OpenAI client with current key
   */
  public createClient(): OpenAI {
    const key = this.getCurrentKey();
    
    logger.info(`Creating OpenAI client with: ${key.name}`);

    return new OpenAI({
      apiKey: key.key,
      baseURL: key.baseURL,
    });
  }

  /**
   * Get rotation statistics
   */
  public getStats() {
    return {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.isActive).length,
      currentKey: this.keys[this.currentIndex].name,
      keys: this.keys.map(k => ({
        name: k.name,
        used: k.used,
        quota: k.quota,
        isActive: k.isActive,
        lastError: k.lastError
      }))
    };
  }

  /**
   * Reset all keys (for testing)
   */
  public reset() {
    this.keys.forEach(k => {
      k.used = 0;
      k.isActive = true;
      k.lastError = undefined;
      k.lastErrorTime = undefined;
    });
    this.currentIndex = 0;
    logger.info('All keys reset');
  }
}

// Singleton instance
let rotationManager: APIKeyRotationManager | null = null;

/**
 * Get or create rotation manager instance
 */
export function getRotationManager(): APIKeyRotationManager {
  if (!rotationManager) {
    rotationManager = new APIKeyRotationManager();
  }
  return rotationManager;
}

/**
 * Create OpenAI client with automatic key rotation
 */
export function createRotatingClient(): OpenAI {
  const manager = getRotationManager();
  return manager.createClient();
}

/**
 * Wrapper for OpenAI API calls with automatic retry and rotation
 */
export async function callWithRotation<T>(
  fn: (client: OpenAI) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const manager = getRotationManager();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const client = manager.createClient();
      const result = await fn(client);
      
      // Report success
      manager.reportSuccess();
      
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || String(error);
      
      logger.error(`API call attempt ${attempt + 1} failed: ${errorMessage}`);
      
      // Report error and rotate
      manager.reportError(errorMessage);
      
      // If this is the last attempt, throw
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError || new Error('API call failed after all retries');
}
