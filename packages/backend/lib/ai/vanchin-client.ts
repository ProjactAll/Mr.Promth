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
    // Vanchin uses a single endpoint URL, endpoint_id goes in the "model" field
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
   * IMPORTANT: Vanchin API format:
   * - URL: https://vanchin.streamlake.ai/api/gateway/v1/endpoints/chat/completions
   * - Authorization: Bearer {API_KEY}
   * - model field: {ENDPOINT_ID} (e.g., "ep-xxx-123456789")
   */
  private createClient(model: VanchinModel): OpenAI {
    return new OpenAI({
      apiKey: model.apiKey,
      baseURL: this.baseUrl,
      defaultQuery: {
        // Vanchin uses endpoint_id as the "model" parameter
        model: model.endpointId
      }
    })
  }

  /**
   * Get OpenAI-compatible client with automatic load balancing
   */
  getClient(): OpenAI {
    const model = this.getNextModel()
    return this.createClient(model)
  }

  /**
   * Get client for a specific model by index (1-39)
   */
  getClientByIndex(index: number): OpenAI {
    const modelKey = `model_${index}`
    const model = VANCHIN_MODELS[modelKey]
    
    if (!model) {
      throw new Error(`Model ${index} not found. Available models: ${Object.keys(VANCHIN_MODELS).join(', ')}`)
    }
    
    return this.createClient(model)
  }

  /**
   * Direct chat completion (bypasses OpenAI client for full control)
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: {
      modelIndex?: number;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<any> {
    const model = options.modelIndex 
      ? VANCHIN_MODELS[`model_${options.modelIndex}`]
      : this.getNextModel()

    if (!model) {
      throw new Error(`Model not found`)
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.endpointId, // endpoint_id goes here
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Vanchin API error: ${error}`)
    }

    return response.json()
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
 */
export function getVanchinClient(): OpenAI {
  return vanchinClient.getClient()
}

/**
 * Get client for specific model index
 */
export function getVanchinClientByIndex(index: number): OpenAI {
  return vanchinClient.getClientByIndex(index)
}

/**
 * Direct chat completion (recommended for Vanchin)
 */
export async function vanchinChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    modelIndex?: number;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<any> {
  return vanchinClient.chatCompletion(messages, options)
}
