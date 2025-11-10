/**
 * Unified AI Client
 * 
 * Combines Vanchin AI (primary) and Manus API (fallback)
 * Automatically switches between providers based on availability
 */

import { vanchinClient, vanchinChatCompletion } from './vanchin-client'
import { manusClient, manusChatCompletion } from './manus-client'
import OpenAI from 'openai'

type AIProvider = 'vanchin' | 'manus'

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
  provider?: AIProvider
}

class UnifiedAIClient {
  private preferredProvider: AIProvider = 'vanchin'

  constructor() {
    // Check which providers are available
    const vanchinAvailable = vanchinClient.getModelCount() > 0
    const manusAvailable = manusClient.getCurrentKeyInfo().total > 0

    if (vanchinAvailable) {
      this.preferredProvider = 'vanchin'
      console.log('✅ Primary AI: Vanchin (39 models)')
    } else if (manusAvailable) {
      this.preferredProvider = 'manus'
      console.log('✅ Primary AI: Manus (fallback)')
    } else {
      console.warn('⚠️  No AI providers available!')
    }
  }

  /**
   * Get OpenAI-compatible client
   * Uses preferred provider
   */
  getClient(): OpenAI {
    if (this.preferredProvider === 'vanchin') {
      return vanchinClient.getClient()
    } else {
      return manusClient.getClient()
    }
  }

  /**
   * Chat completion with automatic fallback
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: ChatCompletionOptions = {}
  ): Promise<any> {
    const provider = options.provider || this.preferredProvider

    try {
      if (provider === 'vanchin') {
        return await vanchinChatCompletion(messages, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        })
      } else {
        return await manusChatCompletion(messages, {
          model: options.model,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        })
      }
    } catch (error: any) {
      console.error(`${provider} failed:`, error.message)

      // Try fallback provider
      if (provider === 'vanchin') {
        console.log('🔄 Falling back to Manus...')
        return await manusChatCompletion(messages, {
          model: options.model,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        })
      } else {
        console.log('🔄 Falling back to Vanchin...')
        return await vanchinChatCompletion(messages, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        })
      }
    }
  }

  /**
   * Get provider status
   */
  getStatus() {
    return {
      preferred: this.preferredProvider,
      vanchin: {
        available: vanchinClient.getModelCount() > 0,
        models: vanchinClient.getModelCount(),
      },
      manus: {
        available: manusClient.getCurrentKeyInfo().total > 0,
        keys: manusClient.getCurrentKeyInfo().total,
        current: manusClient.getCurrentKeyInfo().index,
      },
    }
  }

  /**
   * Switch preferred provider
   */
  setPreferredProvider(provider: AIProvider) {
    this.preferredProvider = provider
    console.log(`✅ Switched to ${provider}`)
  }
}

// Export singleton instance
export const aiClient = new UnifiedAIClient()

// Export convenience functions
export function getAIClient(): OpenAI {
  return aiClient.getClient()
}

export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: ChatCompletionOptions
): Promise<any> {
  return aiClient.chatCompletion(messages, options)
}

export function getAIStatus() {
  return aiClient.getStatus()
}

export function setPreferredProvider(provider: AIProvider) {
  aiClient.setPreferredProvider(provider)
}
