import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface WorkspaceConfig {
  user_id: string
  created_at: string
  projects: Project[]
}

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  status: 'active' | 'completed' | 'failed' | 'archived'
  path: string
}

export class WorkspaceManager {
  private baseDir: string

  constructor(baseDir: string = '/tmp/mrprompt_workspaces') {
    this.baseDir = baseDir
  }

  /**
   * Get workspace path for a user
   */
  getUserWorkspacePath(userId: string): string {
    return path.join(this.baseDir, `user_${userId}`)
  }

  /**
   * Get project path within user's workspace
   */
  getProjectPath(userId: string, projectId: string): string {
    return path.join(this.getUserWorkspacePath(userId), projectId)
  }

  /**
   * Initialize workspace for a user
   */
  async initializeWorkspace(userId: string): Promise<void> {
    const workspacePath = this.getUserWorkspacePath(userId)
    
    try {
      await fs.mkdir(workspacePath, { recursive: true })
      
      // Create .workspace_config.json
      const config: WorkspaceConfig = {
        user_id: userId,
        created_at: new Date().toISOString(),
        projects: []
      }
      
      await this.saveConfig(userId, config)
      
      // Create .gitignore
      const gitignore = `node_modules/
.next/
.env.local
.DS_Store
*.log
dist/
build/
`
      await fs.writeFile(
        path.join(workspacePath, '.gitignore'),
        gitignore,
        'utf-8'
      )
    } catch (error) {
      throw new Error(`Failed to initialize workspace: ${error}`)
    }
  }

  /**
   * Create a new project in user's workspace
   */
  async createProject(
    userId: string,
    projectId: string,
    projectName: string,
    description?: string
  ): Promise<Project> {
    const workspacePath = this.getUserWorkspacePath(userId)
    const projectPath = this.getProjectPath(userId, projectId)
    
    try {
      // Ensure workspace exists
      await fs.mkdir(workspacePath, { recursive: true })
      
      // Create project directory
      await fs.mkdir(projectPath, { recursive: true })
      
      // Create project
      const project: Project = {
        id: projectId,
        name: projectName,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        path: projectPath
      }
      
      // Update config
      const config = await this.getConfig(userId)
      config.projects.push(project)
      await this.saveConfig(userId, config)
      
      return project
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`)
    }
  }

  /**
   * Get workspace config
   */
  async getConfig(userId: string): Promise<WorkspaceConfig> {
    const configPath = path.join(
      this.getUserWorkspacePath(userId),
      '.workspace_config.json'
    )
    
    try {
      const content = await fs.readFile(configPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      // If config doesn't exist, initialize workspace
      await this.initializeWorkspace(userId)
      return this.getConfig(userId)
    }
  }

  /**
   * Save workspace config
   */
  async saveConfig(userId: string, config: WorkspaceConfig): Promise<void> {
    const configPath = path.join(
      this.getUserWorkspacePath(userId),
      '.workspace_config.json'
    )
    
    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    )
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    userId: string,
    projectId: string,
    status: Project['status']
  ): Promise<void> {
    const config = await this.getConfig(userId)
    const project = config.projects.find(p => p.id === projectId)
    
    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }
    
    project.status = status
    project.updated_at = new Date().toISOString()
    
    await this.saveConfig(userId, config)
  }

  /**
   * List all projects for a user
   */
  async listProjects(userId: string): Promise<Project[]> {
    const config = await this.getConfig(userId)
    return config.projects
  }

  /**
   * Get a specific project
   */
  async getProject(userId: string, projectId: string): Promise<Project | null> {
    const config = await this.getConfig(userId)
    return config.projects.find(p => p.id === projectId) || null
  }

  /**
   * Delete a project
   */
  async deleteProject(userId: string, projectId: string): Promise<void> {
    const config = await this.getConfig(userId)
    const projectIndex = config.projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      throw new Error(`Project ${projectId} not found`)
    }
    
    const projectPath = this.getProjectPath(userId, projectId)
    
    try {
      // Remove project directory
      await fs.rm(projectPath, { recursive: true, force: true })
      
      // Remove from config
      config.projects.splice(projectIndex, 1)
      await this.saveConfig(userId, config)
    } catch (error) {
      throw new Error(`Failed to delete project: ${error}`)
    }
  }

  /**
   * Execute command in project directory
   */
  async executeCommand(
    userId: string,
    projectId: string,
    command: string
  ): Promise<{ stdout: string; stderr: string }> {
    const projectPath = this.getProjectPath(userId, projectId)
    
    try {
      const result = await execAsync(command, {
        cwd: projectPath,
        env: { ...process.env }
      })
      
      return result
    } catch (error: any) {
      throw new Error(`Command failed: ${error.message}`)
    }
  }

  /**
   * Write file to project
   */
  async writeFile(
    userId: string,
    projectId: string,
    filePath: string,
    content: string
  ): Promise<void> {
    const projectPath = this.getProjectPath(userId, projectId)
    const fullPath = path.join(projectPath, filePath)
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    
    // Write file
    await fs.writeFile(fullPath, content, 'utf-8')
  }

  /**
   * Read file from project
   */
  async readFile(
    userId: string,
    projectId: string,
    filePath: string
  ): Promise<string> {
    const projectPath = this.getProjectPath(userId, projectId)
    const fullPath = path.join(projectPath, filePath)
    
    return await fs.readFile(fullPath, 'utf-8')
  }

  /**
   * List files in project directory
   */
  async listFiles(
    userId: string,
    projectId: string,
    dirPath: string = '.'
  ): Promise<string[]> {
    const projectPath = this.getProjectPath(userId, projectId)
    const fullPath = path.join(projectPath, dirPath)
    
    const entries = await fs.readdir(fullPath, { withFileTypes: true })
    
    return entries.map(entry => {
      const name = entry.name
      return entry.isDirectory() ? `${name}/` : name
    })
  }

  /**
   * Get project size
   */
  async getProjectSize(userId: string, projectId: string): Promise<number> {
    const projectPath = this.getProjectPath(userId, projectId)
    
    try {
      const { stdout } = await execAsync(`du -sb "${projectPath}"`)
      const size = parseInt(stdout.split('\t')[0])
      return size
    } catch (error) {
      return 0
    }
  }

  /**
   * Archive project (zip)
   */
  async archiveProject(
    userId: string,
    projectId: string
  ): Promise<string> {
    const projectPath = this.getProjectPath(userId, projectId)
    const workspacePath = this.getUserWorkspacePath(userId)
    const archivePath = path.join(workspacePath, `${projectId}.zip`)
    
    try {
      await execAsync(
        `cd "${path.dirname(projectPath)}" && zip -r "${archivePath}" "${path.basename(projectPath)}"`
      )
      
      return archivePath
    } catch (error) {
      throw new Error(`Failed to archive project: ${error}`)
    }
  }
}

// Singleton instance
export const workspaceManager = new WorkspaceManager()
