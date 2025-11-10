/**
 * Agent 3: Backend Code Generator
 * Generates backend code (API routes, database migrations, functions)
 */

import { createLogger } from '../utils/logger'
import { generateCode, generateRelatedFiles, type CodeGenerationRequest } from '../code-generator/ai-generator'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Create logger instance
const logger = createLogger({ module: 'agent3-code-generator' })

export interface Agent3Request {
  projectId: string
  projectPath: string
  task: {
    type: 'api' | 'migration' | 'function' | 'integration'
    description: string
    specifications: {
      endpoints?: string[]
      database?: {
        tables?: string[]
        relationships?: string[]
      }
      authentication?: boolean
      rateLimit?: boolean
    }
  }
}

export interface Agent3Result {
  success: boolean
  filesGenerated: {
    path: string
    type: string
    content: string
  }[]
  dependencies: string[]
  nextSteps: string[]
  errors?: string[]
}

/**
 * Agent 3 Main Function
 * Generates backend code based on specifications
 */
export async function agent3GenerateBackend(
  request: Agent3Request
): Promise<Agent3Result> {
  const result: Agent3Result = {
    success: false,
    filesGenerated: [],
    dependencies: [],
    nextSteps: []
  }
  
  try {
    logger.info('[Agent 3] Starting backend code generation...')
    logger.info('[Agent 3] Task:', { data: request.task.type })
    logger.info('[Agent 3] Description:', { data: request.task.description })
    
    // Generate code based on task type
    switch (request.task.type) {
      case 'api':
        await generateAPIRoutes(request, result)
        break
        
      case 'migration':
        await generateMigrations(request, result)
        break
        
      case 'function':
        await generateFunctions(request, result)
        break
        
      case 'integration':
        await generateIntegrations(request, result)
        break
    }
    
    result.success = true
    result.nextSteps = generateNextSteps(request, result)
    
    logger.info('[Agent 3]  Code generation complete!')
    logger.info('[Agent 3] Files generated:', { data: result.filesGenerated.length })
    
    return result
    
  } catch (error) {
    logger.error('[Agent 3]  Error:', error instanceof Error ? error : new Error(String(error)))
    result.errors = result.errors || []
    result.errors.push(error instanceof Error ? error.message : String(error))
    return result
  }
}

/**
 * Generate API Routes
 */
async function generateAPIRoutes(
  request: Agent3Request,
  result: Agent3Result
): Promise<void> {
  const { task, projectPath } = request
  
  // Generate API routes for each endpoint
  for (const endpoint of task.specifications.endpoints || []) {
    const codeRequest: CodeGenerationRequest = {
      type: 'api-route',
      description: `API route for ${endpoint}: ${task.description}`,
      context: {
        projectName: request.projectId,
        techStack: ['Next.js', 'TypeScript', 'Supabase'],
      },
      constraints: {
        typescript: true,
        style: 'functional'
      }
    }
    
    // Add authentication if required
    if (task.specifications.authentication) {
      codeRequest.description += '. Include authentication check using Supabase auth.'
    }
    
    // Add rate limiting if required
    if (task.specifications.rateLimit) {
      codeRequest.description += '. Include rate limiting.'
    }
    
    const generated = await generateCode(codeRequest)
    
    // Determine file path
    const routePath = join(projectPath, 'app', 'api', endpoint, generated.filename)
    
    // Create directory
    await mkdir(join(projectPath, 'app', 'api', endpoint), { recursive: true })
    
    // Write file
    await writeFile(routePath, generated.code, 'utf-8')
    
    result.filesGenerated.push({
      path: routePath,
      type: 'api-route',
      content: generated.code
    })
    
    // Add dependencies
    if (generated.dependencies) {
      result.dependencies.push(...generated.dependencies)
    }
    
    logger.info('[Agent 3]  Generated API route:', { data: endpoint })
  }
}

/**
 * Generate Database Migrations
 */
async function generateMigrations(
  request: Agent3Request,
  result: Agent3Result
): Promise<void> {
  const { task, projectPath } = request
  
  let migrationDescription = task.description
  
  // Add table information
  if (task.specifications.database?.tables) {
    migrationDescription += `\n\nTables to create: ${task.specifications.database.tables.join(', ')}`
  }
  
  // Add relationship information
  if (task.specifications.database?.relationships) {
    migrationDescription += `\n\nRelationships: ${task.specifications.database.relationships.join(', ')}`
  }
  
  const codeRequest: CodeGenerationRequest = {
    type: 'migration',
    description: migrationDescription,
    context: {
      projectName: request.projectId,
      techStack: ['Supabase', 'PostgreSQL']
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  // Determine file path
  const migrationPath = join(projectPath, 'supabase', 'migrations', generated.filename)
  
  // Create directory
  await mkdir(join(projectPath, 'supabase', 'migrations'), { recursive: true })
  
  // Write file
  await writeFile(migrationPath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: migrationPath,
    type: 'migration',
    content: generated.code
  })
  
  logger.info('[Agent 3]  Generated migration:', { data: generated.filename })
}

/**
 * Generate Utility Functions
 */
async function generateFunctions(
  request: Agent3Request,
  result: Agent3Result
): Promise<void> {
  const { task, projectPath } = request
  
  const codeRequest: CodeGenerationRequest = {
    type: 'function',
    description: task.description,
    context: {
      projectName: request.projectId,
      techStack: ['TypeScript', 'Next.js']
    },
    constraints: {
      typescript: true
    }
  }
  
  const files = await generateRelatedFiles(codeRequest)
  
  for (const file of files) {
    const filePath = join(projectPath, 'lib', 'utils', file.filename)
    
    // Create directory
    await mkdir(join(projectPath, 'lib', 'utils'), { recursive: true })
    
    // Write file
    await writeFile(filePath, file.code, 'utf-8')
    
    result.filesGenerated.push({
      path: filePath,
      type: file.filename.includes('test') ? 'test' : 'function',
      content: file.code
    })
    
    // Add dependencies
    if (file.dependencies) {
      result.dependencies.push(...file.dependencies)
    }
  }
  
  logger.info('[Agent 3]  Generated functions:', { data: files.length })
}

/**
 * Generate Third-party Integrations
 */
async function generateIntegrations(
  request: Agent3Request,
  result: Agent3Result
): Promise<void> {
  const { task, projectPath } = request
  
  const codeRequest: CodeGenerationRequest = {
    type: 'function',
    description: `Integration module for ${task.description}. Include API client setup, authentication, and main methods.`,
    context: {
      projectName: request.projectId,
      techStack: ['TypeScript', 'Next.js']
    },
    constraints: {
      typescript: true
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  const filePath = join(projectPath, 'lib', 'integrations', generated.filename)
  
  // Create directory
  await mkdir(join(projectPath, 'lib', 'integrations'), { recursive: true })
  
  // Write file
  await writeFile(filePath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: filePath,
    type: 'integration',
    content: generated.code
  })
  
  // Add dependencies
  if (generated.dependencies) {
    result.dependencies.push(...generated.dependencies)
  }
  
  logger.info('[Agent 3]  Generated integration:', { data: generated.filename })
}

/**
 * Generate next steps based on what was generated
 */
function generateNextSteps(
  request: Agent3Request,
  result: Agent3Result
): string[] {
  const steps: string[] = []
  
  // Check if dependencies need to be installed
  if (result.dependencies.length > 0) {
    const uniqueDeps = [...new Set(result.dependencies)]
    steps.push(`Install dependencies: pnpm add ${uniqueDeps.join(' ')}`)
  }
  
  // Type-specific next steps
  switch (request.task.type) {
    case 'api':
      steps.push('Test API endpoints using Postman or curl')
      steps.push('Add API documentation')
      steps.push('Configure CORS if needed')
      break
      
    case 'migration':
      steps.push('Run migration: supabase db push')
      steps.push('Verify tables in Supabase Dashboard')
      steps.push('Test RLS policies')
      break
      
    case 'function':
      steps.push('Run tests: pnpm test')
      steps.push('Import and use functions in your code')
      break
      
    case 'integration':
      steps.push('Add API keys to .env.local')
      steps.push('Test integration with sample data')
      steps.push('Add error handling for API failures')
      break
  }
  
  // Always suggest running Agent 4 next
  steps.push('Run Agent 4 to generate frontend components')
  
  return steps
}

/**
 * Validate Agent 3 request
 */
export function validateAgent3Request(request: Agent3Request): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!request.projectId) {
    errors.push('Project ID is required')
  }
  
  if (!request.projectPath) {
    errors.push('Project path is required')
  }
  
  if (!request.task) {
    errors.push('Task is required')
  } else {
    if (!request.task.type) {
      errors.push('Task type is required')
    }
    
    if (!request.task.description) {
      errors.push('Task description is required')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
