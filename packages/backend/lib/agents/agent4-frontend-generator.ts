/**
 * Agent 4: Frontend Component Generator
 * Generates React components, pages, and UI elements
 */

import { createLogger } from '../utils/logger'

// Create logger instance
const logger = createLogger('$(basename "$file" .ts)')
import { generateCode, type CodeGenerationRequest } from '../code-generator/ai-generator'

// Create logger instance
const logger = createLogger('$(basename "$file" .ts)')
import { writeFile, mkdir } from 'fs/promises'

// Create logger instance
const logger = createLogger('$(basename "$file" .ts)')
import { join } from 'path'

// Create logger instance
const logger = createLogger('$(basename "$file" .ts)')

export interface Agent4Request {
  projectId: string
  projectPath: string
  task: {
    type: 'page' | 'component' | 'form' | 'dashboard' | 'layout'
    description: string
    specifications: {
      route?: string
      components?: string[]
      styling?: 'tailwind' | 'css-modules' | 'styled-components'
      responsive?: boolean
      accessibility?: boolean
      dataSource?: {
        type: 'api' | 'static' | 'supabase'
        endpoint?: string
      }
    }
  }
}

export interface Agent4Result {
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
 * Agent 4 Main Function
 * Generates frontend code based on specifications
 */
export async function agent4GenerateFrontend(
  request: Agent4Request
): Promise<Agent4Result> {
  const result: Agent4Result = {
    success: false,
    filesGenerated: [],
    dependencies: [],
    nextSteps: []
  }
  
  try {
    logger.info('[Agent 4] Starting frontend code generation...')
    logger.info('[Agent 4] Task:', { data: request.task.type })
    logger.info('[Agent 4] Description:', { data: request.task.description })
    
    // Generate code based on task type
    switch (request.task.type) {
      case 'page':
        await generatePage(request, result)
        break
        
      case 'component':
        await generateComponent(request, result)
        break
        
      case 'form':
        await generateForm(request, result)
        break
        
      case 'dashboard':
        await generateDashboard(request, result)
        break
        
      case 'layout':
        await generateLayout(request, result)
        break
    }
    
    result.success = true
    result.nextSteps = generateNextSteps(request, result)
    
    logger.info('[Agent 4] ✅ Frontend generation complete!')
    logger.info('[Agent 4] Files generated:', { data: result.filesGenerated.length })
    
    return result
    
  } catch (error) {
    logger.error('[Agent 4] ❌ Error:', error instanceof Error ? error : new Error(String(error)))
    result.errors = result.errors || []
    result.errors.push(error instanceof Error ? error.message : String(error))
    return result
  }
}

/**
 * Generate Page Component
 */
async function generatePage(
  request: Agent4Request,
  result: Agent4Result
): Promise<void> {
  const { task, projectPath } = request
  
  let description = task.description
  
  // Add styling information
  description += `\n\nUse ${task.specifications.styling || 'tailwind'} for styling.`
  
  // Add responsive requirement
  if (task.specifications.responsive) {
    description += '\nMake it fully responsive for mobile, tablet, and desktop.'
  }
  
  // Add accessibility requirement
  if (task.specifications.accessibility) {
    description += '\nInclude proper ARIA labels and keyboard navigation.'
  }
  
  // Add data source information
  if (task.specifications.dataSource) {
    description += `\n\nFetch data from ${task.specifications.dataSource.type}`
    if (task.specifications.dataSource.endpoint) {
      description += ` endpoint: ${task.specifications.dataSource.endpoint}`
    }
  }
  
  const codeRequest: CodeGenerationRequest = {
    type: 'component',
    description: `Next.js page component: ${description}`,
    context: {
      projectName: request.projectId,
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS']
    },
    constraints: {
      typescript: true,
      style: 'functional'
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  // Determine file path
  const route = task.specifications.route || 'page'
  const pagePath = join(projectPath, 'app', route, 'page.tsx')
  
  // Create directory
  await mkdir(join(projectPath, 'app', route), { recursive: true })
  
  // Write file
  await writeFile(pagePath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: pagePath,
    type: 'page',
    content: generated.code
  })
  
  // Add dependencies
  if (generated.dependencies) {
    result.dependencies.push(...generated.dependencies)
  }
  
  logger.info('[Agent 4] ✅ Generated page:', { data: route })
}

/**
 * Generate Reusable Component
 */
async function generateComponent(
  request: Agent4Request,
  result: Agent4Result
): Promise<void> {
  const { task, projectPath } = request
  
  let description = task.description
  description += `\n\nUse ${task.specifications.styling || 'tailwind'} for styling.`
  
  if (task.specifications.responsive) {
    description += '\nMake it responsive.'
  }
  
  if (task.specifications.accessibility) {
    description += '\nInclude accessibility features.'
  }
  
  const codeRequest: CodeGenerationRequest = {
    type: 'component',
    description: `React component: ${description}`,
    context: {
      projectName: request.projectId,
      techStack: ['React', 'TypeScript', 'Tailwind CSS']
    },
    constraints: {
      typescript: true,
      style: 'functional'
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  // Extract component name from code or use default
  const componentName = extractComponentName(generated.code) || 'Component'
  const componentPath = join(projectPath, 'components', `${componentName}.tsx`)
  
  // Create directory
  await mkdir(join(projectPath, 'components'), { recursive: true })
  
  // Write file
  await writeFile(componentPath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: componentPath,
    type: 'component',
    content: generated.code
  })
  
  // Add dependencies
  if (generated.dependencies) {
    result.dependencies.push(...generated.dependencies)
  }
  
  logger.info('[Agent 4] ✅ Generated component:', { data: componentName })
}

/**
 * Generate Form Component
 */
async function generateForm(
  request: Agent4Request,
  result: Agent4Result
): Promise<void> {
  const { task, projectPath } = request
  
  let description = task.description
  description += '\n\nInclude form validation, error handling, and submit functionality.'
  description += `\nUse ${task.specifications.styling || 'tailwind'} for styling.`
  
  if (task.specifications.dataSource) {
    description += `\n\nSubmit form data to ${task.specifications.dataSource.type}`
    if (task.specifications.dataSource.endpoint) {
      description += ` endpoint: ${task.specifications.dataSource.endpoint}`
    }
  }
  
  const codeRequest: CodeGenerationRequest = {
    type: 'component',
    description: `Form component: ${description}`,
    context: {
      projectName: request.projectId,
      techStack: ['React', 'TypeScript', 'React Hook Form', 'Zod', 'Tailwind CSS']
    },
    constraints: {
      typescript: true,
      style: 'functional'
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  const componentName = extractComponentName(generated.code) || 'Form'
  const formPath = join(projectPath, 'components', 'forms', `${componentName}.tsx`)
  
  // Create directory
  await mkdir(join(projectPath, 'components', 'forms'), { recursive: true })
  
  // Write file
  await writeFile(formPath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: formPath,
    type: 'form',
    content: generated.code
  })
  
  // Add form-related dependencies
  result.dependencies.push('react-hook-form', 'zod', '@hookform/resolvers')
  
  if (generated.dependencies) {
    result.dependencies.push(...generated.dependencies)
  }
  
  logger.info('[Agent 4] ✅ Generated form:', { data: componentName })
}

/**
 * Generate Dashboard
 */
async function generateDashboard(
  request: Agent4Request,
  result: Agent4Result
): Promise<void> {
  const { task, projectPath } = request
  
  let description = task.description
  description += '\n\nInclude:'
  description += '\n- Summary cards with key metrics'
  description += '\n- Charts and visualizations'
  description += '\n- Data tables'
  description += '\n- Responsive grid layout'
  description += `\nUse ${task.specifications.styling || 'tailwind'} for styling.`
  
  if (task.specifications.dataSource) {
    description += `\n\nFetch data from ${task.specifications.dataSource.type}`
    if (task.specifications.dataSource.endpoint) {
      description += ` endpoint: ${task.specifications.dataSource.endpoint}`
    }
  }
  
  const codeRequest: CodeGenerationRequest = {
    type: 'component',
    description: `Dashboard page: ${description}`,
    context: {
      projectName: request.projectId,
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts']
    },
    constraints: {
      typescript: true,
      style: 'functional'
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  const route = task.specifications.route || 'dashboard'
  const dashboardPath = join(projectPath, 'app', route, 'page.tsx')
  
  // Create directory
  await mkdir(join(projectPath, 'app', route), { recursive: true })
  
  // Write file
  await writeFile(dashboardPath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: dashboardPath,
    type: 'dashboard',
    content: generated.code
  })
  
  // Add chart library
  result.dependencies.push('recharts')
  
  if (generated.dependencies) {
    result.dependencies.push(...generated.dependencies)
  }
  
  logger.info('[Agent 4] ✅ Generated dashboard:', { data: route })
}

/**
 * Generate Layout Component
 */
async function generateLayout(
  request: Agent4Request,
  result: Agent4Result
): Promise<void> {
  const { task, projectPath } = request
  
  let description = task.description
  description += '\n\nInclude navigation, header, footer, and main content area.'
  description += `\nUse ${task.specifications.styling || 'tailwind'} for styling.`
  
  const codeRequest: CodeGenerationRequest = {
    type: 'component',
    description: `Layout component: ${description}`,
    context: {
      projectName: request.projectId,
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS']
    },
    constraints: {
      typescript: true,
      style: 'functional'
    }
  }
  
  const generated = await generateCode(codeRequest)
  
  const route = task.specifications.route || ''
  const layoutPath = join(projectPath, 'app', route, 'layout.tsx')
  
  // Create directory
  await mkdir(join(projectPath, 'app', route), { recursive: true })
  
  // Write file
  await writeFile(layoutPath, generated.code, 'utf-8')
  
  result.filesGenerated.push({
    path: layoutPath,
    type: 'layout',
    content: generated.code
  })
  
  if (generated.dependencies) {
    result.dependencies.push(...generated.dependencies)
  }
  
  logger.info('[Agent 4] ✅ Generated layout:', { data: route || 'root' })
}

/**
 * Extract component name from code
 */
function extractComponentName(code: string): string | null {
  const match1 = code.match(/export\s+default\s+function\s+(\w+)/)
  if (match1) return match1[1]
  
  const match2 = code.match(/function\s+(\w+)/)
  if (match2) return match2[1]
  
  const match3 = code.match(/const\s+(\w+)\s*=/)
  if (match3) return match3[1]
  
  return null
}

/**
 * Generate next steps
 */
function generateNextSteps(
  request: Agent4Request,
  result: Agent4Result
): string[] {
  const steps: string[] = []
  
  // Install dependencies
  if (result.dependencies.length > 0) {
    const uniqueDeps = [...new Set(result.dependencies)]
    steps.push(`Install dependencies: pnpm add ${uniqueDeps.join(' ')}`)
  }
  
  // Type-specific steps
  switch (request.task.type) {
    case 'page':
      if (request.task.specifications.route) {
        steps.push(`Visit page at: http://localhost:3000/${request.task.specifications.route}`)
      }
      break
      
    case 'component':
      steps.push('Import and use component in your pages')
      break
      
    case 'form':
      steps.push('Test form validation and submission')
      steps.push('Connect form to API endpoint')
      break
      
    case 'dashboard':
      steps.push('Connect dashboard to real data sources')
      steps.push('Test responsive layout on different devices')
      break
      
    case 'layout':
      steps.push('Verify layout renders correctly')
      steps.push('Test navigation links')
      break
  }
  
  steps.push('Run development server: pnpm dev')
  steps.push('Test in browser and verify functionality')
  
  return steps
}

/**
 * Validate Agent 4 request
 */
export function validateAgent4Request(request: Agent4Request): { valid: boolean; errors: string[] } {
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
