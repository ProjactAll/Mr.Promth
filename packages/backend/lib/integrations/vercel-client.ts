/**
 * Vercel Integration Client
 * Auto-deploy projects to Vercel
 */

export interface VercelConfig {
  token: string
  teamId?: string
}

export interface CreateProjectOptions {
  name: string
  framework?: 'nextjs' | 'react' | 'vue' | 'nuxt' | 'gatsby' | 'svelte'
  buildCommand?: string
  outputDirectory?: string
  installCommand?: string
  devCommand?: string
  environmentVariables?: Array<{
    key: string
    value: string
    target: ('production' | 'preview' | 'development')[]
  }>
  gitRepository?: {
    type: 'github' | 'gitlab' | 'bitbucket'
    repo: string // format: "owner/repo"
  }
}

export interface DeploymentOptions {
  projectName: string
  files: Array<{
    file: string
    data: string
  }>
  target?: 'production' | 'staging'
}

export class VercelClient {
  private token: string
  private teamId?: string
  private baseUrl = 'https://api.vercel.com'
  
  constructor(config: VercelConfig) {
    this.token = config.token
    this.teamId = config.teamId
  }
  
  /**
   * Make API request to Vercel
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Vercel API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      )
    }
    
    return response.json()
  }
  
  /**
   * Create new project
   */
  async createProject(options: CreateProjectOptions) {
    try {
      const body: any = {
        name: options.name,
        framework: options.framework || 'nextjs',
        buildCommand: options.buildCommand,
        outputDirectory: options.outputDirectory,
        installCommand: options.installCommand,
        devCommand: options.devCommand
      }
      
      // Add git repository if provided
      if (options.gitRepository) {
        body.gitRepository = {
          type: options.gitRepository.type,
          repo: options.gitRepository.repo
        }
      }
      
      // Add team ID if provided
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      const data = await this.request<any>(
        `/v9/projects${teamQuery}`,
        {
          method: 'POST',
          body: JSON.stringify(body)
        }
      )
      
      // Add environment variables if provided
      if (options.environmentVariables && options.environmentVariables.length > 0) {
        await this.addEnvironmentVariables(
          data.id,
          options.environmentVariables
        )
      }
      
      return {
        success: true,
        project: data,
        url: `https://vercel.com/${data.accountId}/${data.name}`
      }
    } catch (error) {
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Add environment variables to project
   */
  async addEnvironmentVariables(
    projectId: string,
    variables: Array<{
      key: string
      value: string
      target: ('production' | 'preview' | 'development')[]
    }>
  ) {
    try {
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      const results = await Promise.all(
        variables.map(async (variable) => {
          return await this.request<any>(
            `/v10/projects/${projectId}/env${teamQuery}`,
            {
              method: 'POST',
              body: JSON.stringify({
                key: variable.key,
                value: variable.value,
                type: 'encrypted',
                target: variable.target
              })
            }
          )
        })
      )
      
      return {
        success: true,
        variables: results
      }
    } catch (error) {
      throw new Error(`Failed to add environment variables: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Create deployment
   */
  async createDeployment(options: DeploymentOptions) {
    try {
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      const body = {
        name: options.projectName,
        files: options.files,
        projectSettings: {
          framework: 'nextjs'
        },
        target: options.target || 'production'
      }
      
      const data = await this.request<any>(
        `/v13/deployments${teamQuery}`,
        {
          method: 'POST',
          body: JSON.stringify(body)
        }
      )
      
      return {
        success: true,
        deployment: data,
        url: `https://${data.url}`,
        inspectorUrl: data.inspectorUrl
      }
    } catch (error) {
      throw new Error(`Failed to create deployment: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Get project details
   */
  async getProject(projectId: string) {
    try {
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      const data = await this.request<any>(
        `/v9/projects/${projectId}${teamQuery}`
      )
      
      return {
        success: true,
        project: data
      }
    } catch (error: any) {
      if (error.message.includes('404')) {
        return {
          success: false,
          error: 'Project not found'
        }
      }
      
      throw new Error(`Failed to get project: ${error.message}`)
    }
  }
  
  /**
   * List projects
   */
  async listProjects(limit = 20) {
    try {
      const teamQuery = this.teamId ? `&teamId=${this.teamId}` : ''
      
      const data = await this.request<any>(
        `/v9/projects?limit=${limit}${teamQuery}`
      )
      
      return {
        success: true,
        projects: data.projects,
        pagination: data.pagination
      }
    } catch (error) {
      throw new Error(`Failed to list projects: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Delete project
   */
  async deleteProject(projectId: string) {
    try {
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      await this.request<any>(
        `/v9/projects/${projectId}${teamQuery}`,
        {
          method: 'DELETE'
        }
      )
      
      return {
        success: true
      }
    } catch (error) {
      throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Get deployment status
   */
  async getDeployment(deploymentId: string) {
    try {
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      const data = await this.request<any>(
        `/v13/deployments/${deploymentId}${teamQuery}`
      )
      
      return {
        success: true,
        deployment: data,
        status: data.readyState,
        url: `https://${data.url}`
      }
    } catch (error) {
      throw new Error(`Failed to get deployment: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Link project to GitHub repository
   */
  async linkGitHubRepo(
    projectId: string,
    repoOwner: string,
    repoName: string
  ) {
    try {
      const teamQuery = this.teamId ? `?teamId=${this.teamId}` : ''
      
      const data = await this.request<any>(
        `/v9/projects/${projectId}${teamQuery}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            link: {
              type: 'github',
              repo: `${repoOwner}/${repoName}`,
              repoId: null,
              gitCredentialId: null,
              sourceless: false,
              productionBranch: 'main'
            }
          })
        }
      )
      
      return {
        success: true,
        project: data
      }
    } catch (error) {
      throw new Error(`Failed to link GitHub repo: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * Create Vercel client from environment
 */
export function createVercelClient(token?: string, teamId?: string): VercelClient {
  const vercelToken = token || process.env.VERCEL_TOKEN
  
  if (!vercelToken) {
    throw new Error('Vercel token is required. Set VERCEL_TOKEN environment variable.')
  }
  
  return new VercelClient({
    token: vercelToken,
    teamId: teamId || process.env.VERCEL_TEAM_ID
  })
}
