/**
 * Environment Variables Validation
 * 
 * Validates that all required environment variables are set
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // Vanchin AI (optional - will check dynamically)
  VANCHIN_BASE_URL?: string

  // Agent API Keys (optional - only needed if using agents)
  VANCHIN_AGENT_AGENT1_KEY?: string
  VANCHIN_AGENT_AGENT2_KEY?: string
  VANCHIN_AGENT_AGENT3_KEY?: string
  VANCHIN_AGENT_AGENT4_KEY?: string
  VANCHIN_AGENT_AGENT5_KEY?: string
  VANCHIN_AGENT_AGENT6_KEY?: string
  VANCHIN_AGENT_AGENT7_KEY?: string
}

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * Validate required environment variables
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = []

  // Check Supabase config
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  if (errors.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables:\n${errors.join('\n')}`
    )
  }

  return process.env as unknown as EnvConfig
}

/**
 * Check if Vanchin AI is configured
 */
export function isVanchinConfigured(): boolean {
  // Check if at least one Vanchin model is configured
  for (let i = 1; i <= 39; i++) {
    const apiKey = process.env[`VANCHIN_API_KEY_${i}`]
    const endpoint = process.env[`VANCHIN_ENDPOINT_${i}`]
    if (apiKey && endpoint) {
      return true
    }
  }
  return false
}

/**
 * Check if specific agent is configured
 */
export function isAgentConfigured(agentId: string): boolean {
  const envKey = `VANCHIN_AGENT_${agentId.toUpperCase()}_KEY`
  return !!process.env[envKey]
}

/**
 * Get configured agents count
 */
export function getConfiguredAgentsCount(): number {
  let count = 0
  for (let i = 1; i <= 7; i++) {
    if (isAgentConfigured(`agent${i}`)) {
      count++
    }
  }
  return count
}

/**
 * Get configured Vanchin models count
 */
export function getConfiguredVanchinModelsCount(): number {
  let count = 0
  for (let i = 1; i <= 39; i++) {
    const apiKey = process.env[`VANCHIN_API_KEY_${i}`]
    const endpoint = process.env[`VANCHIN_ENDPOINT_${i}`]
    if (apiKey && endpoint) {
      count++
    }
  }
  return count
}

/**
 * Print environment status (for debugging)
 */
export function printEnvStatus(): void {
  console.log('='.repeat(50))
  console.log('Environment Configuration Status')
  console.log('='.repeat(50))

  try {
    validateEnv()
    console.log(' Supabase: Configured')
  } catch (error) {
    console.log(' Supabase: Not configured')
    console.log((error as Error).message)
  }

  const vanchinModels = getConfiguredVanchinModelsCount()
  if (vanchinModels > 0) {
    console.log(` Vanchin AI: ${vanchinModels} models configured`)
  } else {
    console.log('  Vanchin AI: No models configured')
  }

  const agentsCount = getConfiguredAgentsCount()
  if (agentsCount > 0) {
    console.log(` AI Agents: ${agentsCount}/7 configured`)
  } else {
    console.log('  AI Agents: None configured')
  }

  console.log('='.repeat(50))
}
