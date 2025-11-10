/**
 * Vanchin AI Client
 * OpenAI-compatible API client for Vanchin AI
 * Supports 39 API key + endpoint pairs with automatic load balancing
 */

import OpenAI from 'openai'

/**
 * Vanchin AI Model Configuration
 * Each model has its own API key and endpoint ID
 */
export interface VanchinModel {
  name: string
  apiKey: string
  endpointId: string
  description?: string
}

/**
 * Vanchin Client Instance
 * Includes both OpenAI client and model ID
 */
export interface VanchinClientInstance {
  client: OpenAI
  modelId: string
  modelName: string
}

/**
 * Load Vanchin models from environment variables
 */
function loadVanchinModels(): Record<string, VanchinModel> {
  const models: Record<string, VanchinModel> = {}
  
  for (let i = 1; i <= 39; i++) {
    const apiKey = process.env[`VANCHIN_API_KEY_${i}`]
    const endpointId = process.env[`VANCHIN_ENDPOINT_${i}`]
    
    if (apiKey && endpointId) {
      models[`model_${i}`] = {
        name: `Model ${i}`,
        apiKey,
        endpointId,
        description: `Vanchin AI Model ${i}`
      }
    }
  }
  
  return models
}

/**
 * Available Vanchin AI Models (loaded from environment)
 */
export const VANCHIN_MODELS = loadVanchinModels()

/**
 * Vanchin AI Client Class
 * Provides OpenAI-compatible interface with automatic load balancing
 */
export class VanchinClient {
  private models: VanchinModel[]
  private currentIndex = 0
  private baseUrl: string

  constructor() {
    // Vanchin base URL (without /chat/completions)
    this.baseUrl = process.env.VANCHIN_BASE_URL || 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints'
    this.models = Object.values(VANCHIN_MODELS)
    
    if (this.models.length === 0) {
      console.warn('⚠️  No Vanchin models loaded from environment variables')
      console.warn('Please set VANCHIN_API_KEY_N and VANCHIN_ENDPOINT_N in .env.local')
    } else {
      console.log(`✅ Loaded ${this.models.length} Vanchin AI models`)
    }
  }

  /**
   * Get next model using round-robin load balancing
   */
  private getNextModel(): VanchinModel {
    if (this.models.length === 0) {
      throw new Error('No Vanchin models available. Please configure environment variables.')
    }

    const model = this.models[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.models.length
    return model
  }

  /**
   * Create OpenAI-compatible client for a specific model
   * 
   * IMPORTANT: Vanchin API format (based on user's example):
   * - base_url: https://vanchin.streamlake.ai/api/gateway/v1/endpoints
   * - api_key: from environment variable
   * - model: endpoint_id (e.g., "ep-lvu0su-1762738948457077875")
   */
  private createClientInstance(model: VanchinModel): VanchinClientInstance {
    const client = new OpenAI({
      apiKey: model.apiKey,
      baseURL: this.baseUrl,
    })

    return {
      client,
      modelId: model.endpointId,
      modelName: model.name,
    }
  }

  /**
   * Get OpenAI-compatible client with automatic load balancing
   * Returns both client and model ID (you must pass modelId to chat.completions.create)
   */
  getClient(): VanchinClientInstance {
    const model = this.getNextModel()
    return this.createClientInstance(model)
  }

  /**
   * Get client for a specific model by index (1-39)
   */
  getClientByIndex(index: number): VanchinClientInstance {
    const modelKey = `model_${index}`
    const model = VANCHIN_MODELS[modelKey]
    
    if (!model) {
      throw new Error(`Model ${index} not found. Available models: ${Object.keys(VANCHIN_MODELS).join(', ')}`)
    }
    
    return this.createClientInstance(model)
  }

  /**
   * Chat completion with automatic load balancing
   * This is the recommended way to use Vanchin AI
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: {
      modelIndex?: number
      temperature?: number
      max_tokens?: number
    } = {}
  ): Promise<string> {
    const instance = options.modelIndex 
      ? this.getClientByIndex(options.modelIndex)
      : this.getClient()

    try {
      const response = await instance.client.chat.completions.create({
        model: instance.modelId, // IMPORTANT: endpoint_id goes here
        messages: messages as any,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error(`Vanchin API error (${instance.modelName}):`, error)
      throw error
    }
  }

  /**
   * Get total number of available models
   */
  getModelCount(): number {
    return this.models.length
  }

  /**
   * Get all available model names
   */
  getAvailableModels(): string[] {
    return this.models.map(m => m.name)
  }
}

/**
 * Singleton instance
 */
export const vanchinClient = new VanchinClient()

/**
 * Get OpenAI-compatible client (with load balancing)
 * 
 * Usage:
 * ```ts
 * const { client, modelId } = getVanchinClient()
 * const response = await client.chat.completions.create({
 *   model: modelId,
 *   messages: [{ role: 'user', content: 'Hello' }]
 * })
 * ```
 */
export function getVanchinClient(): VanchinClientInstance {
  return vanchinClient.getClient()
}

/**
 * Get client for specific model index
 */
export function getVanchinClientByIndex(index: number): VanchinClientInstance {
  return vanchinClient.getClientByIndex(index)
}

/**
 * Direct chat completion (recommended for Vanchin)
 * 
 * Usage:
 * ```ts
 * const response = await vanchinChatCompletion([
 *   { role: 'user', content: 'Hello' }
 * ])
 * ```
 */
export async function vanchinChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    modelIndex?: number
    temperature?: number
    max_tokens?: number
  }
): Promise<string> {
  return vanchinClient.chatCompletion(messages, options)
}
