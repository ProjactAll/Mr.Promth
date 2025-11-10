/**
 * Vanchin AI Client
 * Manages AI model requests with load balancing across multiple endpoints
 */

import OpenAI from 'openai'

// Vanchin AI Configuration
const VANCHIN_BASE_URL = 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints'

// AI Model Endpoints (19 models with load balancing)
export const VANCHIN_MODELS = [
  { apiKey: 'WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g', endpoint: 'ep-lpvcnv-1761467347624133479' },
  { apiKey: '3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk', endpoint: 'ep-j9pysc-1761467653839114083' },
  { apiKey: 'npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50', endpoint: 'ep-2uyob4-1761467835762653881' },
  { apiKey: 'l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU', endpoint: 'ep-nqjal5-1762460264139958733' },
  { apiKey: 'Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8', endpoint: 'ep-mhsvw6-1762460362477023705' },
  { apiKey: 'vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg', endpoint: 'ep-h614n9-1762460436283699679' },
  { apiKey: 'pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k', endpoint: 'ep-ohxawl-1762460514611065743' },
  { apiKey: 'cOkB4mwHHjs95szkuOLGyoSRtzTwP2u6-0YBdcQKszI', endpoint: 'ep-bng3os-1762460592040033785' },
  { apiKey: '6quSWJIN9tLotXUQNQypn_U2u6BwvvVLAOk7pgl7ybI', endpoint: 'ep-kazx9x-1761818165668826967' },
  { apiKey: 'Co8IQ684LePQeq4t2bCB567d4zFa92N_7zaZLhJqkTo', endpoint: 'ep-6bl8j9-1761818251624808527' },
  { apiKey: 'a9ciwI-1lgQW8128LG-QK_W0XWtYZ5Kt2aa2Zkjrq9w', endpoint: 'ep-2d9ubo-1761818334800110875' },
  { apiKey: 'Ln-Z6aKGDxaMGXvN9hjMunpDNr975AncIpRtK7XrtTw', endpoint: 'ep-dnxrl0-1761818420368606961' },
  { apiKey: 'CzQtP9g9qwM6wyxKJZ9spUloShOYH8hR-CHcymRks6w', endpoint: 'ep-nmgm5b-1761818484923833700' },
  { apiKey: 'ylFdJan4VXsgm698_XaQZrc9KC_1EE7MRARV6sNapzI', endpoint: 'ep-8rvmfy-1762460863026449765' },
  { apiKey: 'BkcklpfJv9h3bpfZV_J4zPfDN_4PkZ18hoOf39xT-bM', endpoint: 'ep-9biod2-1762526038830669057' },
  { apiKey: 'ukzRCs6tqpk04tYoe4ST56a9i3NMrjRE_rh2tKqiys4', endpoint: 'ep-i26k60-1762526143717606119' },
  { apiKey: 'dmB83cN8Iq4LDfOgrLKlqNSq6eOiydqyCjKmAkyw2kg', endpoint: 'ep-cl50ma-1762526243110761604' },
  { apiKey: '10hmyCXOG7U25BK6f3W-nAhy27ZCh5qF_qCHONLAW3Q', endpoint: 'ep-dwjj6e-1762526348838423254' },
  { apiKey: 'rUexU3L75K0C8F2nkCQnEfKLh6qyR4fm5tF6C5QrJH0', endpoint: 'ep-3lcllc-1762526444990494960' },
]

// Load balancer state
let currentModelIndex = 0
let requestCounts: number[] = new Array(VANCHIN_MODELS.length).fill(0)

/**
 * Get next available model using round-robin load balancing
 */
function getNextModel() {
  const model = VANCHIN_MODELS[currentModelIndex]
  requestCounts[currentModelIndex]++
  currentModelIndex = (currentModelIndex + 1) % VANCHIN_MODELS.length
  return model
}

/**
 * Get least used model for better load distribution
 */
function getLeastUsedModel() {
  const minRequests = Math.min(...requestCounts)
  const index = requestCounts.indexOf(minRequests)
  requestCounts[index]++
  return VANCHIN_MODELS[index]
}

/**
 * Create Vanchin AI client
 */
export function createVanchinClient(useLoadBalancing: boolean = true) {
  const model = useLoadBalancing ? getLeastUsedModel() : getNextModel()
  
  return new OpenAI({
    baseURL: VANCHIN_BASE_URL,
    apiKey: model.apiKey,
    defaultQuery: {
      model: model.endpoint
    }
  })
}

/**
 * Generate completion with Vanchin AI
 */
export async function generateCompletion(params: {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  model?: string
}): Promise<string> {
  const {
    prompt,
    systemPrompt = 'You are an expert software engineer and AI assistant.',
    temperature = 0.7,
    maxTokens = 4000,
    model
  } = params

  try {
    // Get client with load balancing
    const client = createVanchinClient(true)
    
    // Prepare messages
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ]
    
    if (prompt) {
      messages.push({ role: 'user', content: prompt })
    }

    // Make request
    const completion = await client.chat.completions.create({
      model: model || VANCHIN_MODELS[0].endpoint,
      messages,
      temperature,
      max_tokens: maxTokens,
    })

    return completion.choices[0]?.message?.content || ''
    
  } catch (error) {
    console.error('[VanchinAI] Error generating completion:', error)
    throw new Error(`Vanchin AI request failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Generate streaming completion
 */
export async function* generateStreamingCompletion(params: {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  model?: string
}): AsyncGenerator<string, void, unknown> {
  const {
    prompt,
    systemPrompt = 'You are an expert software engineer and AI assistant.',
    temperature = 0.7,
    maxTokens = 4000,
    model
  } = params

  try {
    const client = createVanchinClient(true)
    
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ]
    
    if (prompt) {
      messages.push({ role: 'user', content: prompt })
    }

    const stream = await client.chat.completions.create({
      model: model || VANCHIN_MODELS[0].endpoint,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
    
  } catch (error) {
    console.error('[VanchinAI] Error generating streaming completion:', error)
    throw new Error(`Vanchin AI streaming failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Generate code with specialized prompt
 */
export async function generateCode(params: {
  task: string
  language: string
  context?: string
  examples?: string
}): Promise<string> {
  const { task, language, context, examples } = params
  
  const systemPrompt = `You are an expert ${language} developer. Generate clean, production-ready code following best practices.`
  
  let prompt = `Task: ${task}\n\nLanguage: ${language}\n\n`
  
  if (context) {
    prompt += `Context:\n${context}\n\n`
  }
  
  if (examples) {
    prompt += `Examples:\n${examples}\n\n`
  }
  
  prompt += `Generate the complete code. Include comments and error handling. Return ONLY the code, no explanations.`
  
  return generateCompletion({
    prompt,
    systemPrompt,
    temperature: 0.3, // Lower temperature for more consistent code
    maxTokens: 6000
  })
}

/**
 * Get load balancing statistics
 */
export function getLoadBalancingStats() {
  return {
    totalModels: VANCHIN_MODELS.length,
    currentIndex: currentModelIndex,
    requestCounts: requestCounts.map((count, index) => ({
      model: VANCHIN_MODELS[index].endpoint,
      requests: count
    })),
    totalRequests: requestCounts.reduce((a, b) => a + b, 0)
  }
}

/**
 * Reset load balancing statistics
 */
export function resetLoadBalancingStats() {
  currentModelIndex = 0
  requestCounts = new Array(VANCHIN_MODELS.length).fill(0)
}
