/**
 * Vercel API Client
 * Handles deployment to Vercel via API
 */

import axios, { AxiosInstance } from 'axios'

export interface VercelDeploymentOptions {
  projectName: string
  projectPath: string
  gitUrl?: string
  envVars?: Record<string, string>
  buildCommand?: string
  framework?: string
}

export interface VercelDeployment {
  id: string
  url: string
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  readyState: 'QUEUED' | 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'READY'
  createdAt: number
  meta?: any
}

export interface VercelProject {
  id: string
  name: string
  framework: string
  devCommand: string | null
  installCommand: string | null
  buildCommand: string | null
  outputDirectory: string | null
}

/**
 * Vercel API Client
 */
export class VercelClient {
  private client: AxiosInstance
  private token: string
  
  constructor(token?: string) {
    this.token = token || process.env.VERCEL_TOKEN || ''
    
    if (!this.token) {
      console.warn('[VercelClient] No token provided, some operations may fail')
    }
    
    this.client = axios.create({
      baseURL: 'https://api.vercel.com',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    })
  }
  
  /**
   * Create a new project
   */
  async createProject(name: string, framework: string = 'nextjs'): Promise<VercelProject> {
    try {
      const response = await this.client.post('/v9/projects', {
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        framework,
        buildCommand: 'pnpm build',
        devCommand: 'pnpm dev',
        installCommand: 'pnpm install',
        outputDirectory: '.next'
      })
      
      return response.data
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Project already exists, get it
        return await this.getProject(name)
      }
      throw error
    }
  }
  
  /**
   * Get project by name
   */
  async getProject(name: string): Promise<VercelProject> {
    const response = await this.client.get(`/v9/projects/${name}`)
    return response.data
  }
  
  /**
   * Deploy from GitHub
   */
  async deployFromGitHub(
    projectName: string,
    gitUrl: string,
    options: {
      branch?: string
      envVars?: Record<string, string>
      production?: boolean
    } = {}
  ): Promise<VercelDeployment> {
    // Ensure project exists
    await this.createProject(projectName)
    
    // Set environment variables if provided
    if (options.envVars) {
      await this.setEnvironmentVariables(projectName, options.envVars)
    }
    
    // Trigger deployment via GitHub integration
    const response = await this.client.post('/v13/deployments', {
      name: projectName,
      gitSource: {
        type: 'github',
        repo: this.extractRepoFromUrl(gitUrl),
        ref: options.branch || 'main'
      },
      target: options.production ? 'production' : 'preview'
    })
    
    return response.data
  }
  
  /**
   * Deploy from local files (upload)
   */
  async deployFromFiles(
    projectName: string,
    files: { path: string; content: string | Buffer }[]
  ): Promise<VercelDeployment> {
    // Ensure project exists
    await this.createProject(projectName)
    
    // Upload files
    const fileUploads = await Promise.all(
      files.map(async (file) => {
        const sha = await this.uploadFile(file.content)
        return {
          file: file.path,
          sha
        }
      })
    )
    
    // Create deployment
    const response = await this.client.post('/v13/deployments', {
      name: projectName,
      files: fileUploads,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'pnpm build',
        devCommand: 'pnpm dev',
        installCommand: 'pnpm install',
        outputDirectory: '.next'
      }
    })
    
    return response.data
  }
  
  /**
   * Upload a file to Vercel
   */
  private async uploadFile(content: string | Buffer): Promise<string> {
    const response = await this.client.post('/v2/files', content, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })
    
    return response.data.sha
  }
  
  /**
   * Get deployment status
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    const response = await this.client.get(`/v13/deployments/${deploymentId}`)
    return response.data
  }
  
  /**
   * Wait for deployment to complete
   */
  async waitForDeployment(
    deploymentId: string,
    timeout: number = 600000 // 10 minutes
  ): Promise<VercelDeployment> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const deployment = await this.getDeployment(deploymentId)
      
      if (deployment.readyState === 'READY') {
        return deployment
      }
      
      if (deployment.readyState === 'ERROR') {
        throw new Error('Deployment failed')
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    
    throw new Error('Deployment timeout')
  }
  
  /**
   * Set environment variables
   */
  async setEnvironmentVariables(
    projectName: string,
    envVars: Record<string, string>
  ): Promise<void> {
    const project = await this.getProject(projectName)
    
    for (const [key, value] of Object.entries(envVars)) {
      await this.client.post(`/v10/projects/${project.id}/env`, {
        key,
        value,
        type: 'encrypted',
        target: ['production', 'preview', 'development']
      })
    }
  }
  
  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    try {
      const response = await this.client.get(`/v2/deployments/${deploymentId}/events`)
      return response.data.map((event: any) => event.text || event.payload?.text || '')
    } catch (error) {
      console.error('[VercelClient] Error getting logs:', error)
      return []
    }
  }
  
  /**
   * List deployments for a project
   */
  async listDeployments(projectName: string, limit: number = 10): Promise<VercelDeployment[]> {
    const response = await this.client.get('/v6/deployments', {
      params: {
        projectId: projectName,
        limit
      }
    })
    
    return response.data.deployments
  }
  
  /**
   * Delete deployment
   */
  async deleteDeployment(deploymentId: string): Promise<void> {
    await this.client.delete(`/v13/deployments/${deploymentId}`)
  }
  
  /**
   * Extract repo name from GitHub URL
   */
  private extractRepoFromUrl(url: string): string {
    // https://github.com/user/repo.git -> user/repo
    const match = url.match(/github\.com[:/](.+?)(?:\.git)?$/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }
    return match[1]
  }
  
  /**
   * Check if token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.client.get('/v2/user')
      return true
    } catch (error) {
      return false
    }
  }
}

/**
 * Helper function to create Vercel client
 */
export function createVercelClient(token?: string): VercelClient {
  return new VercelClient(token)
}
