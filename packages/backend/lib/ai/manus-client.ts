/**
 * Manus API Client with Auto Key Rotation
 * 
 * Automatically rotates to next key when quota is exhausted
 * Supports OpenAI-compatible interface
 */

import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

interface ManusConfig {
  apiKey: string
  baseUrl: string
}

class ManusClient {
  private keys: string[] = []
  private currentIndex: number = 0
  private baseUrl: string
  private indexFile: string
  private errorLog: string

  constructor() {
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.manus.im/api/llm-proxy/v1'
    this.indexFile = path.join('/tmp', 'manus_api_key_index')
    this.errorLog = path.join('/tmp', 'manus_api_key_errors.log')
    
    this.loadKeys()
    this.loadCurrentIndex()
  }

  /**
   * Load API keys from environment
   */
  private loadKeys() {
    // Load from OPENAI_API_KEY (single key)
    const singleKey = process.env.OPENAI_API_KEY
    if (singleKey) {
      this.keys.push(singleKey)
    }

    // Load from MANUS_API_KEY_N (multiple keys)
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`MANUS_API_KEY_${i}`]
      if (key) {
        this.keys.push(key)
      }
    }

    if (this.keys.length === 0) {
      console.warn('⚠️  No Manus API keys found in environment')
    } else {
      console.log(`✅ Loaded ${this.keys.length} Manus API key(s)`)
    }
  }

  /**
   * Load current key index from file
   */
  private loadCurrentIndex() {
    try {
      if (fs.existsSync(this.indexFile)) {
        const content = fs.readFileSync(this.indexFile, 'utf-8')
        this.currentIndex = parseInt(content.trim()) || 0
      } else {
        this.saveCurrentIndex()
      }
    } catch (error) {
      console.error('Error loading key index:', error)
      this.currentIndex = 0
    }
  }

  /**
   * Save current key index to file
   */
  private saveCurrentIndex() {
    try {
      fs.writeFileSync(this.indexFile, this.currentIndex.toString())
    } catch (error) {
      console.error('Error saving key index:', error)
    }
  }

  /**
   * Log error to file
   */
  private logError(message: string) {
    try {
      const timestamp = new Date().toISOString()
      const logMessage = `[${timestamp}] ${message}\n`
      fs.appendFileSync(this.errorLog, logMessage)
    } catch (error) {
      console.error('Error writing to log:', error)
    }
  }

  /**
   * Get current API key
   */
  private getCurrentKey(): string {
    if (this.keys.length === 0) {
      throw new Error('No Manus API keys available')
    }
    return this.keys[this.currentIndex]
  }

  /**
   * Rotate to next API key
   */
  private rotateToNext() {
    const oldIndex = this.currentIndex
    this.currentIndex = (this.currentIndex + 1) % this.keys.length
    this.saveCurrentIndex()
    
    this.logError(`Rotated from key ${oldIndex} to key ${this.currentIndex}`)
    console.log(`🔄 Rotated to key ${this.currentIndex}`)
  }

  /**
   * Check if error is quota-related
   */
  private isQuotaError(error: any): boolean {
    const errorStr = JSON.stringify(error).toLowerCase()
    return /quota|rate.?limit|insufficient|exceeded|429/.test(errorStr)
  }

  /**
   * Create OpenAI client with current key
   */
  private createClient(): OpenAI {
    return new OpenAI({
      apiKey: this.getCurrentKey(),
      baseURL: this.baseUrl,
    })
  }

  /**
   * Make API call with auto-rotation
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<any> {
    const maxAttempts = this.keys.length
    let attempt = 0

    while (attempt < maxAttempts) {
      try {
        const client = this.createClient()
        
        const response = await client.chat.completions.create({
          model: options.model || 'gpt-4o',
          messages: messages as any,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens,
          stream: options.stream ?? false,
        })

        return response
      } catch (error: any) {
        // Check if quota error
        if (this.isQuotaError(error)) {
          this.logError(`Quota error: ${error.message}`)
          console.warn(`⚠️  Key quota exhausted, rotating...`)
          this.rotateToNext()
          attempt++
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          // Non-quota error, throw immediately
          throw error
        }
      }
    }

    throw new Error('❌ All Manus API keys exhausted')
  }

  /**
   * Get OpenAI-compatible client
   */
  getClient(): OpenAI {
    return this.createClient()
  }

  /**
   * Get current key info
   */
  getCurrentKeyInfo(): { index: number; key: string; total: number } {
    return {
      index: this.currentIndex,
      key: this.getCurrentKey().substring(0, 10) + '...',
      total: this.keys.length,
    }
  }
}

// Export singleton instance
export const manusClient = new ManusClient()

// Export convenience functions
export function getManusClient(): OpenAI {
  return manusClient.getClient()
}

export async function manusChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<any> {
  return manusClient.chatCompletion(messages, options)
}
