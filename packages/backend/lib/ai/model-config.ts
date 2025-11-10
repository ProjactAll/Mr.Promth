/**
 * AI Model Allocation Configuration
 * Defines which models are assigned to which agents
 */

export type AgentType =
  | 'project-planner'
  | 'frontend-developer'
  | 'backend-developer'
  | 'database-designer'
  | 'ui-ux-designer'
  | 'code-reviewer'
  | 'deployment-agent'

export interface AgentModelConfig {
  primary: string[]
  backup: string[]
  description?: string
}

/**
 * Agent-to-Model Allocation
 * Each agent has primary and backup models for failover
 */
export const AGENT_MODEL_ALLOCATION: Record<AgentType, AgentModelConfig> = {
  'project-planner': {
    primary: ['model_1'],
    backup: ['model_2', 'model_3'],
    description: 'Analyze requirements, create project structure, define architecture'
  },
  'frontend-developer': {
    primary: ['model_4', 'model_5', 'model_6'],
    backup: ['model_7', 'model_8'],
    description: 'Create React/Next.js components, UI implementation'
  },
  'backend-developer': {
    primary: ['model_9', 'model_10', 'model_11'],
    backup: ['model_12', 'model_13'],
    description: 'API routes, server logic, database operations'
  },
  'database-designer': {
    primary: ['model_14', 'model_15'],
    backup: ['model_16'],
    description: 'Schema design, migrations, query optimization'
  },
  'ui-ux-designer': {
    primary: ['model_17', 'model_18'],
    backup: ['model_19'],
    description: 'Design system, styling, responsive design'
  },
  'code-reviewer': {
    primary: ['model_3'],
    backup: ['model_1', 'model_2'],
    description: 'Code quality, best practices, security'
  },
  'deployment-agent': {
    primary: ['model_19'],
    backup: ['model_18', 'model_17'],
    description: 'Build configuration, deployment scripts, CI/CD'
  }
}

/**
 * Get models for a specific agent
 */
export function getAgentModels(agent: AgentType): AgentModelConfig {
  return AGENT_MODEL_ALLOCATION[agent]
}

/**
 * Get primary model for an agent
 */
export function getPrimaryModel(agent: AgentType): string {
  const config = AGENT_MODEL_ALLOCATION[agent]
  return config.primary[0]
}

/**
 * Get all models for an agent (primary + backup)
 */
export function getAllModels(agent: AgentType): string[] {
  const config = AGENT_MODEL_ALLOCATION[agent]
  return [...config.primary, ...config.backup]
}

/**
 * Get random model from agent's pool
 */
export function getRandomAgentModel(agent: AgentType): string {
  const allModels = getAllModels(agent)
  const randomIndex = Math.floor(Math.random() * allModels.length)
  return allModels[randomIndex]
}

/**
 * Model usage tracking
 */
export interface ModelUsageLog {
  timestamp: Date
  agent: AgentType
  modelKey: string
  taskType: string
  tokensUsed?: number
  responseTime?: number
  success: boolean
  error?: string
}

/**
 * Execute task with automatic failover
 */
export async function executeWithFailover<T>(
  agent: AgentType,
  task: (modelKey: string) => Promise<T>,
  options?: {
    maxRetries?: number
    retryDelay?: number
  }
): Promise<T> {
  const models = getAllModels(agent)
  const maxRetries = options?.maxRetries ?? models.length
  const retryDelay = options?.retryDelay ?? 1000

  let lastError: Error | null = null

  for (let i = 0; i < Math.min(maxRetries, models.length); i++) {
    const modelKey = models[i]
    
    try {
      console.log(`[${agent}] Trying model: ${modelKey}`)
      const result = await task(modelKey)
      console.log(`[${agent}] Success with model: ${modelKey}`)
      return result
    } catch (error) {
      lastError = error as Error
      console.error(`[${agent}] Model ${modelKey} failed:`, error)
      
      // Wait before trying next model
      if (i < models.length - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw new Error(
    `All models failed for agent ${agent}. Last error: ${lastError?.message}`
  )
}

/**
 * Load balancing strategies
 */
export type LoadBalancingStrategy = 'round-robin' | 'random' | 'least-used'

let roundRobinCounters: Record<AgentType, number> = {
  'project-planner': 0,
  'frontend-developer': 0,
  'backend-developer': 0,
  'database-designer': 0,
  'ui-ux-designer': 0,
  'code-reviewer': 0,
  'deployment-agent': 0
}

/**
 * Get next model using specified strategy
 */
export function getNextModelForAgent(
  agent: AgentType,
  strategy: LoadBalancingStrategy = 'round-robin'
): string {
  const config = AGENT_MODEL_ALLOCATION[agent]
  const allModels = [...config.primary, ...config.backup]

  switch (strategy) {
    case 'round-robin':
      const index = roundRobinCounters[agent] % allModels.length
      roundRobinCounters[agent]++
      return allModels[index]

    case 'random':
      return getRandomAgentModel(agent)

    case 'least-used':
      // TODO: Implement least-used strategy with usage tracking
      return config.primary[0]

    default:
      return config.primary[0]
  }
}

/**
 * Agent capabilities and use cases
 */
export const AGENT_CAPABILITIES: Record<AgentType, string[]> = {
  'project-planner': [
    'Requirements analysis',
    'Architecture design',
    'Technology stack selection',
    'Project timeline estimation',
    'Resource allocation'
  ],
  'frontend-developer': [
    'React component creation',
    'Next.js page development',
    'UI implementation',
    'Client-side state management',
    'Responsive design implementation'
  ],
  'backend-developer': [
    'API endpoint creation',
    'Server-side logic',
    'Database integration',
    'Authentication implementation',
    'Business logic development'
  ],
  'database-designer': [
    'Schema design',
    'Migration scripts',
    'Query optimization',
    'Data modeling',
    'Index creation'
  ],
  'ui-ux-designer': [
    'Design system creation',
    'Component styling',
    'Responsive layouts',
    'Accessibility features',
    'Animation implementation'
  ],
  'code-reviewer': [
    'Code quality analysis',
    'Security audit',
    'Performance optimization',
    'Best practice validation',
    'Bug detection'
  ],
  'deployment-agent': [
    'Build configuration',
    'Deployment scripts',
    'CI/CD setup',
    'Environment configuration',
    'Production optimization'
  ]
}

/**
 * Get agent description
 */
export function getAgentDescription(agent: AgentType): string {
  return AGENT_MODEL_ALLOCATION[agent].description || ''
}

/**
 * Get agent capabilities
 */
export function getAgentCapabilities(agent: AgentType): string[] {
  return AGENT_CAPABILITIES[agent]
}

/**
 * List all agents
 */
export function listAllAgents(): AgentType[] {
  return Object.keys(AGENT_MODEL_ALLOCATION) as AgentType[]
}

/**
 * Get agent statistics
 */
export function getAgentStats(agent: AgentType) {
  const config = AGENT_MODEL_ALLOCATION[agent]
  return {
    agent,
    primaryModels: config.primary.length,
    backupModels: config.backup.length,
    totalModels: config.primary.length + config.backup.length,
    description: config.description,
    capabilities: AGENT_CAPABILITIES[agent]
  }
}

/**
 * Get all agent statistics
 */
export function getAllAgentStats() {
  return listAllAgents().map(agent => getAgentStats(agent))
}
