/**
 * Vanchin AI Client
 * OpenAI-compatible API client for Vanchin AI
 * Supports 20M free tokens
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
 * Available Vanchin AI Models
 */
export const VANCHIN_MODELS: Record<string, VanchinModel> = {
  // Primary models
  model_1: {
    name: 'Model 1',
    apiKey: 'WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g',
    endpointId: 'ep-lpvcnv-1761467347624133479',
    description: 'General purpose model'
  },
  model_2: {
    name: 'Model 2',
    apiKey: '3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk',
    endpointId: 'ep-j9pysc-1761467653839114083',
    description: 'Alternative model'
  },
  model_3: {
    name: 'Model 3',
    apiKey: 'npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50',
    endpointId: 'ep-2uyob4-1761467835762653881',
    description: 'Specialized model'
  },
  model_4: {
    name: 'Model 4',
    apiKey: 'l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU',
    endpointId: 'ep-nqjal5-1762460264139958733'
  },
  model_5: {
    name: 'Model 5',
    apiKey: 'Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8',
    endpointId: 'ep-mhsvw6-1762460362477023705'
  },
  model_6: {
    name: 'Model 6',
    apiKey: 'vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg',
    endpointId: 'ep-h614n9-1762460436283699679'
  },
  model_7: {
    name: 'Model 7',
    apiKey: 'pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k',
    endpointId: 'ep-ohxawl-1762460514611065743'
  },
  model_8: {
    name: 'Model 8',
    apiKey: 'cOkB4mwHHjs95szkuOLGyoSRtzTwP2u6-0YBdcQKszI',
    endpointId: 'ep-bng3os-1762460592040033785'
  },
  model_9: {
    name: 'Model 9',
    apiKey: '6quSWJIN9tLotXUQNQypn_U2u6BwvvVLAOk7pgl7ybI',
    endpointId: 'ep-kazx9x-1761818165668826967'
  },
  model_10: {
    name: 'Model 10',
    apiKey: 'Co8IQ684LePQeq4t2bCB567d4zFa92N_7zaZLhJqkTo',
    endpointId: 'ep-6bl8j9-1761818251624808527'
  },
  model_11: {
    name: 'Model 11',
    apiKey: 'a9ciwI-1lgQW8128LG-QK_W0XWtYZ5Kt2aa2Zkjrq9w',
    endpointId: 'ep-2d9ubo-1761818334800110875'
  },
  model_12: {
    name: 'Model 12',
    apiKey: 'Ln-Z6aKGDxaMGXvN9hjMunpDNr975AncIpRtK7XrtTw',
    endpointId: 'ep-dnxrl0-1761818420368606961'
  },
  model_13: {
    name: 'Model 13',
    apiKey: 'CzQtP9g9qwM6wyxKJZ9spUloShOYH8hR-CHcymRks6w',
    endpointId: 'ep-nmgm5b-1761818484923833700'
  },
  model_14: {
    name: 'Model 14',
    apiKey: 'ylFdJan4VXsgm698_XaQZrc9KC_1EE7MRARV6sNapzI',
    endpointId: 'ep-8rvmfy-1762460863026449765'
  },
  model_15: {
    name: 'Model 15',
    apiKey: 'BkcklpfJv9h3bpfZV_J4zPfDN_4PkZ18hoOf39xT-bM',
    endpointId: 'ep-9biod2-1762526038830669057'
  },
  model_16: {
    name: 'Model 16',
    apiKey: 'ukzRCs6tqpk04tYoe4ST56a9i3NMrjRE_rh2tKqiys4',
    endpointId: 'ep-i26k60-1762526143717606119'
  },
  model_17: {
    name: 'Model 17',
    apiKey: 'dmB83cN8Iq4LDfOgrLKlqNSq6eOiydqyCjKmAkyw2kg',
    endpointId: 'ep-cl50ma-1762526243110761604'
  },
  model_18: {
    name: 'Model 18',
    apiKey: '10hmyCXOG7U25BK6f3W-nAhy27ZCh5qF_qCHONLAW3Q',
    endpointId: 'ep-dwjj6e-1762526348838423254'
  },
  model_19: {
    name: 'Model 19',
    apiKey: 'rUexU3L75K0C8F2nkCQnEfKLh6qyR4fm5tF6C5QrJH0',
    endpointId: 'ep-3lcllc-1762526444990494960'
  }
}

/**
 * Create Vanchin AI client
 * @param modelKey - Key from VANCHIN_MODELS (default: 'model_1')
 */
export function createVanchinClient(modelKey: keyof typeof VANCHIN_MODELS = 'model_1'): OpenAI {
  const model = VANCHIN_MODELS[modelKey]
  
  if (!model) {
    throw new Error(`Invalid model key: ${modelKey}`)
  }
  
  return new OpenAI({
    baseURL: 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints',
    apiKey: model.apiKey
  })
}

/**
 * Get model endpoint ID
 * @param modelKey - Key from VANCHIN_MODELS
 */
export function getModelEndpoint(modelKey: keyof typeof VANCHIN_MODELS = 'model_1'): string {
  const model = VANCHIN_MODELS[modelKey]
  
  if (!model) {
    throw new Error(`Invalid model key: ${modelKey}`)
  }
  
  return model.endpointId
}

/**
 * Load balancer - rotate between models
 */
let currentModelIndex = 0
const modelKeys = Object.keys(VANCHIN_MODELS) as (keyof typeof VANCHIN_MODELS)[]

export function getNextModel(): { client: OpenAI; endpoint: string; modelKey: string } {
  const modelKey = modelKeys[currentModelIndex]
  const client = createVanchinClient(modelKey)
  const endpoint = getModelEndpoint(modelKey)
  
  // Rotate to next model
  currentModelIndex = (currentModelIndex + 1) % modelKeys.length
  
  return {
    client,
    endpoint,
    modelKey
  }
}

/**
 * Random model selection
 */
export function getRandomModel(): { client: OpenAI; endpoint: string; modelKey: string } {
  const randomIndex = Math.floor(Math.random() * modelKeys.length)
  const modelKey = modelKeys[randomIndex]
  const client = createVanchinClient(modelKey)
  const endpoint = getModelEndpoint(modelKey)
  
  return {
    client,
    endpoint,
    modelKey
  }
}

/**
 * Chat completion with Vanchin AI
 * @param messages - Chat messages
 * @param options - Additional options
 */
export async function vanchinChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    modelKey?: keyof typeof VANCHIN_MODELS
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
) {
  const modelKey = options?.modelKey || 'model_1'
  const client = createVanchinClient(modelKey)
  const endpoint = getModelEndpoint(modelKey)
  
  try {
    const completion = await client.chat.completions.create({
      model: endpoint,
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      stream: options?.stream ?? false
    })
    
    return completion
  } catch (error) {
    console.error('[Vanchin AI] Error:', error)
    throw error
  }
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Method 1: Use specific model
  const client1 = createVanchinClient('model_1')
  const endpoint1 = getModelEndpoint('model_1')
  
  const response1 = await client1.chat.completions.create({
    model: endpoint1,
    messages: [
      { role: 'system', content: 'You are an AI assistant' },
      { role: 'user', content: 'Hello!' }
    ]
  })
  
  console.log(response1.choices[0].message.content)
  
  // Method 2: Use load balancer (auto-rotate)
  const { client: client2, endpoint: endpoint2 } = getNextModel()
  
  const response2 = await client2.chat.completions.create({
    model: endpoint2,
    messages: [
      { role: 'user', content: 'Tell me a joke' }
    ]
  })
  
  console.log(response2.choices[0].message.content)
  
  // Method 3: Use helper function
  const response3 = await vanchinChatCompletion([
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Explain quantum computing' }
  ], {
    modelKey: 'model_3',
    temperature: 0.8,
    maxTokens: 1000
  })
  
  // Type guard for ChatCompletion response
  if ('choices' in response3) {
    console.log(response3.choices[0].message.content)
  }
}
