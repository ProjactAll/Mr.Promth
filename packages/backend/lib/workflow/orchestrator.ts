/**
 * Workflow Orchestrator
 * Manages the complete flow from prompt to deployed project
 */

import { agent3GenerateBackend } from '../agents/agent3-code-generator'
import { agent4GenerateFrontend } from '../agents/agent4-frontend-generator'
import { agent5TestingQA } from '../agents/agent5-testing-qa'
import { agent6Deploy } from '../agents/agent6-deployment'
import { agent7Monitor } from '../agents/agent7-monitoring'
import { createClient } from '@supabase/supabase-js'
import { workflowEvents } from './events'
import { ProjectManager } from '../file-manager/project-manager'

export interface WorkflowRequest {
  userId: string
  projectName: string
  prompt: string
  options?: {
    skipTesting?: boolean
    skipDeployment?: boolean
    autoGitHub?: boolean
  }
}

export interface WorkflowState {
  id: string
  userId: string
  projectName: string
  projectPath: string
  status: 'pending' | 'analyzing' | 'expanding' | 'generating-backend' | 'generating-frontend' | 'testing' | 'deploying' | 'monitoring' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  progress: number
  results: {
    analysis?: any
    expansion?: any
    backend?: any
    frontend?: any
    testing?: any
    deployment?: any
    monitoring?: any
    package?: {
      zipPath: string
      downloadUrl: string
      size: number
      fileCount: number
    }
  }
  errors: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Main workflow orchestrator
 */
export class WorkflowOrchestrator {
  private state: WorkflowState
  private supabase: ReturnType<typeof createClient>
  private projectManager: ProjectManager
  
  constructor(request: WorkflowRequest) {
    this.projectManager = new ProjectManager()
    this.state = {
      id: this.generateId(),
      userId: request.userId,
      projectName: request.projectName,
      projectPath: `/tmp/projects/${request.userId}/${this.sanitizeName(request.projectName)}`,
      status: 'pending',
      currentStep: 0,
      totalSteps: 7,
      progress: 0,
      results: {},
      errors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  
  /**
   * Execute the complete workflow
   */
  async execute(prompt: string, options?: WorkflowRequest['options']): Promise<WorkflowState> {
    const startTime = Date.now()
    
    try {
      console.log('[Workflow] Starting workflow:', this.state.id)
      
      // Save initial state
      await this.saveState()
      
      // Step 1: Analyze prompt
      await this.updateStatus('analyzing', 1)
      const analysis = await this.analyzePrompt(prompt)
      this.state.results.analysis = analysis
      await this.saveState()
      
      // Step 2: Expand prompt
      await this.updateStatus('expanding', 2)
      const expansion = await this.expandPrompt(analysis)
      this.state.results.expansion = expansion
      await this.saveState()
      
      // Step 3: Generate backend
      await this.updateStatus('generating-backend', 3)
      const backend = await this.generateBackend(expansion)
      this.state.results.backend = backend
      await this.saveState()
      
      // Step 4: Generate frontend
      await this.updateStatus('generating-frontend', 4)
      const frontend = await this.generateFrontend(expansion)
      this.state.results.frontend = frontend
      await this.saveState()
      
      // Step 5: Testing (optional)
      if (!options?.skipTesting) {
        await this.updateStatus('testing', 5)
        const testing = await this.runTests()
        this.state.results.testing = testing
        await this.saveState()
      }
      
      // Step 6: Deployment (optional)
      if (!options?.skipDeployment) {
        await this.updateStatus('deploying', 6)
        const deployment = await this.deploy()
        this.state.results.deployment = deployment
        await this.saveState()
      }
      
      // Step 7: Monitoring
      await this.updateStatus('monitoring', 7)
      const monitoring = await this.setupMonitoring()
      this.state.results.monitoring = monitoring
      await this.saveState()
      
      // Step 8: Package project
      console.log('[Workflow] Packaging project...')
      const packageResult = await this.packageProject()
      this.state.results.package = packageResult
      await this.saveState()
      
      // Complete
      await this.updateStatus('completed', 7)
      console.log('[Workflow] ✅ Workflow completed:', this.state.id)
      
      // Emit completion event
      const duration = Date.now() - startTime
      workflowEvents.emitComplete(this.state.id, {
        success: true,
        results: this.state.results,
        duration
      })
      
      return this.state
      
    } catch (error) {
      console.error('[Workflow] ❌ Error:', error)
      this.state.status = 'failed'
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.state.errors.push(errorMessage)
      await this.saveState()
      
      // Emit error event
      workflowEvents.emitError(this.state.id, {
        error: errorMessage,
        step: this.state.currentStep,
        recoverable: false
      })
      
      // Emit completion event with failure
      const duration = Date.now() - startTime
      workflowEvents.emitComplete(this.state.id, {
        success: false,
        results: this.state.results,
        duration
      })
      
      throw error
    }
  }
  
  /**
   * Step 1: Analyze prompt
   */
  private async analyzePrompt(prompt: string): Promise<any> {
    console.log('[Workflow] Analyzing prompt...')
    
    // Emit progress
    workflowEvents.emitProgress(this.state.id, {
      step: 1,
      totalSteps: this.state.totalSteps,
      status: 'analyzing',
      message: 'Analyzing your requirements with AI...',
      progress: Math.round((1 / this.state.totalSteps) * 100)
    })
    
    // Use Vanchin AI to analyze
    const { vanchinChatCompletion } = await import('../ai/vanchin-client')
    
    const analysisPrompt = `Analyze this project request and provide a structured analysis:

Project Request: ${prompt}

Provide:
1. Project type (e.g., web app, mobile app, API)
2. Key features needed
3. Complexity level (simple/medium/complex)
4. Estimated development time
5. Recommended tech stack

Respond in JSON format.`

    const completion = await vanchinChatCompletion(
      [{ role: 'user', content: analysisPrompt }],
      {
        temperature: 0.3,
        max_tokens: 1000
      }
    )
    
    // Extract text from completion
    let response = ''
    if (typeof completion === 'string') {
      response = completion
    } else if (typeof completion === 'object' && completion !== null && 'choices' in completion) {
      response = (completion as any).choices[0]?.message?.content || ''
    } else {
      // Handle stream or other types
      response = String(completion)
    }
    
    console.log('[Workflow] AI Analysis:', response)
    
    // Parse AI response or use fallback
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('[Workflow] Failed to parse AI response, using fallback')
    }
    
    // Fallback analysis
    return {
      type: this.detectProjectType(prompt),
      features: this.extractFeatures(prompt),
      complexity: this.estimateComplexity(prompt),
      estimatedTime: '10-15 minutes',
      aiAnalysis: response
    }
  }
  
  /**
   * Step 2: Expand prompt
   */
  private async expandPrompt(analysis: any): Promise<any> {
    console.log('[Workflow] Expanding prompt...')
    
    // Emit progress
    workflowEvents.emitProgress(this.state.id, {
      step: 2,
      totalSteps: this.state.totalSteps,
      status: 'expanding',
      message: 'Creating detailed specifications...',
      progress: Math.round((2 / this.state.totalSteps) * 100)
    })
    
    // Use Vanchin AI to expand
    const { vanchinChatCompletion } = await import('../ai/vanchin-client')
    
    const expansionPrompt = `Based on this analysis, create detailed technical specifications:

Analysis: ${JSON.stringify(analysis, null, 2)}
Project: ${this.state.projectName}

Provide detailed specs for:
1. Backend (API endpoints, database schema, authentication)
2. Frontend (pages, components, styling)
3. File structure
4. Dependencies

Respond in JSON format.`

    const completion2 = await vanchinChatCompletion(
      [{ role: 'user', content: expansionPrompt }],
      {
        temperature: 0.4,
        max_tokens: 2000
      }
    )
    
    // Extract text from completion
    let response2 = ''
    if (typeof completion2 === 'string') {
      response2 = completion2
    } else if (typeof completion2 === 'object' && completion2 !== null && 'choices' in completion2) {
      response2 = (completion2 as any).choices[0]?.message?.content || ''
    } else {
      response2 = String(completion2)
    }
    
    console.log('[Workflow] AI Expansion:', response2)
    
    // Parse AI response or use fallback
    try {
      const jsonMatch = response2.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('[Workflow] Failed to parse AI response, using fallback')
    }
    
    // Fallback expansion
    return {
      backend: {
        description: 'Create REST API with CRUD operations',
        endpoints: ['items'],
        database: {
          tables: ['items'],
          relationships: []
        },
        authentication: false,
        rateLimit: false
      },
      frontend: {
        description: 'Create responsive web application',
        pages: ['home'],
        components: ['list', 'form'],
        styling: 'tailwind',
        responsive: true
      },
      aiExpansion: response2
    }
  }
  
  /**
   * Step 3: Generate backend
   */
  private async generateBackend(expansion: any): Promise<any> {
    console.log('[Workflow] Generating backend...')
    
    const results = []
    
    // Generate API routes
    if (expansion.backend?.endpoints) {
      const apiResult = await agent3GenerateBackend({
        projectId: this.state.id,
        projectPath: this.state.projectPath,
        task: {
          type: 'api',
          description: expansion.backend.description,
          specifications: {
            endpoints: expansion.backend.endpoints,
            authentication: expansion.backend.authentication,
            rateLimit: expansion.backend.rateLimit
          }
        }
      })
      results.push(apiResult)
    }
    
    // Generate database migration
    if (expansion.backend?.database) {
      const migrationResult = await agent3GenerateBackend({
        projectId: this.state.id,
        projectPath: this.state.projectPath,
        task: {
          type: 'migration',
          description: 'Database schema',
          specifications: {
            database: expansion.backend.database
          }
        }
      })
      results.push(migrationResult)
    }
    
    return {
      success: results.every(r => r.success),
      filesGenerated: results.flatMap(r => r.filesGenerated || []),
      dependencies: [...new Set(results.flatMap(r => r.dependencies || []))],
      nextSteps: results.flatMap(r => r.nextSteps || [])
    }
  }
  
  /**
   * Step 4: Generate frontend
   */
  private async generateFrontend(expansion: any): Promise<any> {
    console.log('[Workflow] Generating frontend...')
    
    const results = []
    
    // Generate pages
    if (expansion.frontend?.pages) {
      for (const page of expansion.frontend.pages) {
        const pageResult = await agent4GenerateFrontend({
          projectId: this.state.id,
          projectPath: this.state.projectPath,
          task: {
            type: 'page',
            description: `${page} page`,
            specifications: {
              route: page,
              responsive: expansion.frontend.responsive,
              styling: expansion.frontend.styling
            }
          }
        })
        results.push(pageResult)
      }
    }
    
    return {
      success: results.every(r => r.success),
      filesGenerated: results.flatMap(r => r.filesGenerated || []),
      dependencies: [...new Set(results.flatMap(r => r.dependencies || []))],
      nextSteps: results.flatMap(r => r.nextSteps || [])
    }
  }
  
  /**
   * Step 5: Run tests
   */
  private async runTests(): Promise<any> {
    console.log('[Workflow] Running tests...')
    
    const allFiles = [
      ...(this.state.results.backend?.filesGenerated || []),
      ...(this.state.results.frontend?.filesGenerated || [])
    ]
    
    const targetFiles = allFiles
      .filter(f => !f.path.includes('test'))
      .map(f => f.path)
    
    if (targetFiles.length === 0) {
      return { success: true, message: 'No files to test' }
    }
    
    return await agent5TestingQA({
      projectId: this.state.id,
      projectPath: this.state.projectPath,
      task: {
        type: 'generate-tests',
        targetFiles: targetFiles.slice(0, 5), // Limit to 5 files for now
        testFramework: 'jest'
      }
    })
  }
  
  /**
   * Step 6: Deploy
   */
  private async deploy(): Promise<any> {
    console.log('[Workflow] Deploying...')
    
    return await agent6Deploy({
      projectId: this.state.id,
      projectPath: this.state.projectPath,
      task: {
        type: 'deploy',
        platform: 'vercel',
        environment: 'production'
      }
    })
  }
  
  /**
   * Step 7: Setup monitoring
   */
  private async setupMonitoring(): Promise<any> {
    console.log('[Workflow] Setting up monitoring...')
    
    return await agent7Monitor({
      projectId: this.state.id,
      task: {
        type: 'health-check'
      }
    })
  }
  
  /**
   * Package project files
   */
  private async packageProject(): Promise<any> {
    console.log('[Workflow] Packaging project files...')
    
    // Collect all generated files
    const allFiles = [
      ...(this.state.results.backend?.filesGenerated || []),
      ...(this.state.results.frontend?.filesGenerated || []),
      ...(this.state.results.testing?.testsGenerated || [])
    ]
    
    // Create project structure
    const projectPath = await this.projectManager.createProjectStructure({
      projectId: this.state.id,
      projectName: this.state.projectName,
      userId: this.state.userId,
      files: allFiles,
      dependencies: [
        ...(this.state.results.backend?.dependencies || []),
        ...(this.state.results.frontend?.dependencies || [])
      ]
    })
    
    // Package as ZIP
    const pkg = await this.projectManager.packageProject(projectPath, this.state.id)
    
    // Upload to Supabase Storage
    const downloadUrl = await this.projectManager.uploadToStorage(pkg, this.state.userId)
    
    console.log('[Workflow] ✅ Project packaged and uploaded')
    
    return {
      zipPath: pkg.zipPath,
      downloadUrl,
      size: pkg.size,
      fileCount: pkg.fileCount
    }
  }
  
  /**
   * Update workflow status
   */
  private async updateStatus(status: WorkflowState['status'], step: number): Promise<void> {
    this.state.status = status
    this.state.currentStep = step
    this.state.progress = Math.round((step / this.state.totalSteps) * 100)
    this.state.updatedAt = new Date().toISOString()
    
    console.log(`[Workflow] ${status} (${this.state.progress}%)`)
    
    // Emit progress event for real-time updates
    workflowEvents.emitProgress(this.state.id, {
      step,
      totalSteps: this.state.totalSteps,
      status,
      message: `Step ${step}/${this.state.totalSteps}: ${status}`,
      progress: this.state.progress
    })
    
    // Emit status event
    workflowEvents.emitStatus(this.state.id, {
      status,
      message: `Workflow is ${status}`
    })
  }
  
  /**
   * Save state to database
   */
  private async saveState(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workflows')
        .upsert({
          id: this.state.id,
          user_id: this.state.userId,
          project_name: this.state.projectName,
          status: this.state.status,
          current_step: this.state.currentStep,
          total_steps: this.state.totalSteps,
          progress: this.state.progress,
          results: this.state.results as any,
          errors: this.state.errors,
          created_at: this.state.createdAt,
          updated_at: this.state.updatedAt
        } as any)
      
      if (error) {
        console.error('[Workflow] Error saving state:', error)
      }
    } catch (error) {
      console.error('[Workflow] Error saving state:', error)
    }
  }
  
  /**
   * Get current state
   */
  getState(): WorkflowState {
    return { ...this.state }
  }
  
  /**
   * Helper: Generate unique ID
   */
  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Helper: Sanitize project name
   */
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  /**
   * Helper: Detect project type
   */
  private detectProjectType(prompt: string): string {
    const lower = prompt.toLowerCase()
    
    if (lower.includes('blog')) return 'blog'
    if (lower.includes('ecommerce') || lower.includes('shop')) return 'ecommerce'
    if (lower.includes('dashboard') || lower.includes('admin')) return 'dashboard'
    if (lower.includes('api')) return 'api'
    
    return 'web-app'
  }
  
  /**
   * Helper: Extract features
   */
  private extractFeatures(prompt: string): string[] {
    const features = []
    const lower = prompt.toLowerCase()
    
    if (lower.includes('auth') || lower.includes('login')) features.push('authentication')
    if (lower.includes('crud')) features.push('crud')
    if (lower.includes('search')) features.push('search')
    if (lower.includes('upload')) features.push('file-upload')
    if (lower.includes('payment')) features.push('payment')
    if (lower.includes('chat')) features.push('chat')
    
    return features
  }
  
  /**
   * Helper: Estimate complexity
   */
  private estimateComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
    const features = this.extractFeatures(prompt)
    
    if (features.length <= 2) return 'simple'
    if (features.length <= 5) return 'medium'
    return 'complex'
  }
}

/**
 * Get workflow status
 */
export async function getWorkflowStatus(workflowId: string): Promise<WorkflowState | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    projectName: data.project_name,
    projectPath: `/tmp/projects/${data.user_id}/${data.project_name}`,
    status: data.status,
    currentStep: data.current_step,
    totalSteps: data.total_steps,
    progress: data.progress,
    results: data.results || {},
    errors: data.errors || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

/**
 * Cancel workflow
 */
export async function cancelWorkflow(workflowId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error } = await supabase
    .from('workflows')
    .update({
      status: 'failed',
      errors: ['Cancelled by user'],
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)
  
  return !error
}
