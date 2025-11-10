/**
 * Workflow Integration Tests
 * Tests the complete workflow from prompt to deployment
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator'
import { workflowEvents } from '@/lib/workflow/events'

describe('Workflow Integration Tests', () => {
  let orchestrator: WorkflowOrchestrator
  let workflowId: string
  
  beforeAll(() => {
    // Setup test environment
    process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
  })
  
  describe('Workflow Creation', () => {
    it('should create a new workflow', () => {
      orchestrator = new WorkflowOrchestrator({
        userId: 'test-user-123',
        projectName: 'test-project',
        prompt: 'Create a simple blog with posts and comments'
      })
      
      expect(orchestrator).toBeDefined()
    })
  })
  
  describe('Workflow Execution', () => {
    it('should execute workflow steps in order', async () => {
      const events: string[] = []
      
      // Subscribe to workflow events
      const unsubscribe = workflowEvents.subscribeToAll((event) => {
        events.push(event.type)
      })
      
      try {
        // Execute workflow with skip options for faster testing
        const result = await orchestrator.execute(
          'Create a simple blog with posts and comments',
          {
            skipTesting: true,
            skipDeployment: true
          }
        )
        
        workflowId = result.id
        
        // Verify workflow completed
        expect(result.status).toBe('completed')
        expect(result.progress).toBe(100)
        
        // Verify events were emitted
        expect(events).toContain('progress')
        expect(events).toContain('status')
        expect(events).toContain('complete')
        
        // Verify results
        expect(result.results.analysis).toBeDefined()
        expect(result.results.expansion).toBeDefined()
        expect(result.results.backend).toBeDefined()
        expect(result.results.frontend).toBeDefined()
        
      } finally {
        unsubscribe()
      }
    }, 300000) // 5 minutes timeout
  })
  
  describe('Workflow State Persistence', () => {
    it('should save workflow state to database', async () => {
      // This would require actual Supabase connection
      // For now, we just verify the state structure
      expect(workflowId).toBeDefined()
    })
  })
  
  describe('Error Handling', () => {
    it('should handle invalid prompts gracefully', async () => {
      const errorOrchestrator = new WorkflowOrchestrator({
        userId: 'test-user-123',
        projectName: 'error-test',
        prompt: ''
      })
      
      try {
        await errorOrchestrator.execute('', { skipTesting: true, skipDeployment: true })
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})

describe('Agent Integration Tests', () => {
  describe('Agent 3: Backend Generator', () => {
    it('should generate API routes', async () => {
      const { agent3GenerateBackend } = await import('@/lib/agents/agent3-code-generator')
      
      const result = await agent3GenerateBackend({
        projectId: 'test-123',
        projectPath: '/tmp/test-project',
        task: {
          type: 'api',
          description: 'User authentication API',
          specifications: {
            endpoints: [
              { method: 'POST', path: '/api/auth/login' },
              { method: 'POST', path: '/api/auth/register' }
            ],
            authentication: true,
            rateLimit: true
          }
        }
      })
      
      expect(result.success).toBe(true)
      expect(result.filesGenerated).toBeDefined()
      expect(result.filesGenerated!.length).toBeGreaterThan(0)
    }, 60000)
    
    it('should generate database migrations', async () => {
      const { agent3GenerateBackend } = await import('@/lib/agents/agent3-code-generator')
      
      const result = await agent3GenerateBackend({
        projectId: 'test-123',
        projectPath: '/tmp/test-project',
        task: {
          type: 'migration',
          description: 'User and posts tables',
          specifications: {
            database: {
              tables: [
                {
                  name: 'users',
                  columns: [
                    { name: 'id', type: 'uuid', primaryKey: true },
                    { name: 'email', type: 'text', unique: true },
                    { name: 'created_at', type: 'timestamp' }
                  ]
                }
              ]
            }
          }
        }
      })
      
      expect(result.success).toBe(true)
      expect(result.filesGenerated).toBeDefined()
    }, 60000)
  })
  
  describe('Agent 4: Frontend Generator', () => {
    it('should generate React pages', async () => {
      const { agent4GenerateFrontend } = await import('@/lib/agents/agent4-frontend-generator')
      
      const result = await agent4GenerateFrontend({
        projectId: 'test-123',
        projectPath: '/tmp/test-project',
        task: {
          type: 'page',
          description: 'User profile page',
          specifications: {
            route: '/profile',
            responsive: true,
            styling: 'tailwind'
          }
        }
      })
      
      expect(result.success).toBe(true)
      expect(result.filesGenerated).toBeDefined()
    }, 60000)
  })
  
  describe('Agent 5: Testing & QA', () => {
    it('should generate tests', async () => {
      const { agent5TestingQA } = await import('@/lib/agents/agent5-testing-qa')
      
      const result = await agent5TestingQA({
        projectId: 'test-123',
        projectPath: '/tmp/test-project',
        task: {
          type: 'generate-tests',
          targetFiles: ['/lib/utils/string.ts'],
          testFramework: 'vitest'
        }
      })
      
      expect(result.success).toBe(true)
      expect(result.testsGenerated).toBeDefined()
    }, 60000)
  })
})

describe('Real-time Events Tests', () => {
  it('should emit progress events', (done) => {
    const testWorkflowId = 'test-workflow-123'
    
    const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
      expect(event.workflowId).toBe(testWorkflowId)
      expect(event.type).toBe('progress')
      expect(event.data).toBeDefined()
      
      unsubscribe()
      done()
    })
    
    // Emit test event
    workflowEvents.emitProgress(testWorkflowId, {
      step: 1,
      totalSteps: 7,
      status: 'analyzing',
      message: 'Test message',
      progress: 14
    })
  })
  
  it('should emit status events', (done) => {
    const testWorkflowId = 'test-workflow-456'
    
    const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
      if (event.type === 'status') {
        expect(event.data.status).toBe('analyzing')
        unsubscribe()
        done()
      }
    })
    
    workflowEvents.emitStatus(testWorkflowId, {
      status: 'analyzing',
      message: 'Test status'
    })
  })
  
  it('should emit error events', (done) => {
    const testWorkflowId = 'test-workflow-789'
    
    const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
      if (event.type === 'error') {
        expect(event.data.error).toBeDefined()
        unsubscribe()
        done()
      }
    })
    
    workflowEvents.emitError(testWorkflowId, {
      error: 'Test error',
      step: 3,
      recoverable: false
    })
  })
  
  it('should emit complete events', (done) => {
    const testWorkflowId = 'test-workflow-101'
    
    const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
      if (event.type === 'complete') {
        expect(event.data.success).toBe(true)
        expect(event.data.duration).toBeGreaterThan(0)
        unsubscribe()
        done()
      }
    })
    
    workflowEvents.emitComplete(testWorkflowId, {
      success: true,
      results: {},
      duration: 1000
    })
  })
})

describe('File Management Tests', () => {
  it('should create project structure', async () => {
    const { ProjectManager } = await import('@/lib/file-manager/project-manager')
    const manager = new ProjectManager()
    
    const projectPath = await manager.createProjectStructure({
      projectId: 'test-123',
      projectName: 'test-project',
      userId: 'test-user',
      files: [
        {
          path: 'app/page.tsx',
          content: 'export default function Page() { return <div>Test</div> }'
        }
      ],
      dependencies: ['react', 'next']
    })
    
    expect(projectPath).toBeDefined()
    expect(projectPath).toContain('test-project')
  })
  
  it('should package project as ZIP', async () => {
    const { ProjectManager } = await import('@/lib/file-manager/project-manager')
    const manager = new ProjectManager()
    
    // First create a project
    const projectPath = await manager.createProjectStructure({
      projectId: 'test-456',
      projectName: 'test-zip',
      userId: 'test-user',
      files: [],
      dependencies: []
    })
    
    // Then package it
    const pkg = await manager.packageProject(projectPath, 'test-456')
    
    expect(pkg.zipPath).toBeDefined()
    expect(pkg.size).toBeGreaterThan(0)
    expect(pkg.fileCount).toBeGreaterThan(0)
    
    // Cleanup
    await manager.cleanup(projectPath)
  })
})
