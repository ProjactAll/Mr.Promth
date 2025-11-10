/**
 * Vanchin AI Client with Load Balancing
 * 
 * This client manages 39 API key + endpoint pairs and automatically
 * load balances requests across them.
 * 
 * API Format:
 * - URL: https://vanchin.streamlake.ai/api/gateway/v1/endpoints/chat/completions
 * - Authorization: Bearer {API_KEY}
 * - model: {ENDPOINT_ID} (e.g., "ep-xxx-123456789")
 */

interface VanchinConfig {
  apiKey: string;
  endpoint: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

class VanchinClient {
  private configs: VanchinConfig[] = [];
  private currentIndex = 0;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VANCHIN_BASE_URL || 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints';
    this.loadConfigs();
  }

  private loadConfigs() {
    // Load all 39 API key + endpoint pairs from environment variables
    for (let i = 1; i <= 39; i++) {
      const apiKey = process.env[`VANCHIN_API_KEY_${i}`];
      const endpoint = process.env[`VANCHIN_ENDPOINT_${i}`];

      if (apiKey && endpoint) {
        this.configs.push({ apiKey, endpoint });
      }
    }

    if (this.configs.length === 0) {
      console.warn('No Vanchin API configurations found in environment variables');
    } else {
      console.log(`Loaded ${this.configs.length} Vanchin API configurations`);
    }
  }

  /**
   * Get the next API configuration using round-robin load balancing
   */
  private getNextConfig(): VanchinConfig {
    if (this.configs.length === 0) {
      throw new Error('No Vanchin API configurations available');
    }

    const config = this.configs[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.configs.length;
    return config;
  }

  /**
   * Create a chat completion
   * 
   * IMPORTANT: Vanchin API format:
   * - URL: {baseUrl}/chat/completions (NOT {baseUrl}/{endpoint}/chat/completions)
   * - model field: endpoint_id (e.g., "ep-xxx-123")
   * - Authorization: Bearer {apiKey}
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<any> {
    const config = this.getNextConfig();
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody = {
      model: config.endpoint, // endpoint_id goes in the "model" field
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      stream: options.stream ?? false,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vanchin API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vanchin API request failed:', error);
      throw error;
    }
  }

  /**
   * OpenAI-compatible interface
   */
  get chat() {
    return {
      completions: {
        create: async (params: {
          model?: string;
          messages: ChatMessage[];
          temperature?: number;
          max_tokens?: number;
          stream?: boolean;
        }) => {
          return this.createChatCompletion(params.messages, {
            temperature: params.temperature,
            max_tokens: params.max_tokens,
            stream: params.stream,
          });
        },
      },
    };
  }
}

// Export singleton instance
export const vanchinClient = new VanchinClient();

// Export types
export type { ChatMessage, ChatCompletionOptions };
