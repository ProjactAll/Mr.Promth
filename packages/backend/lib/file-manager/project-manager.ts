/**
 * Project File Manager
 * Handles project directory creation, file writing, and packaging
 */

import { mkdir, writeFile, readdir, stat, rm, readFile as readFileAsync } from 'fs/promises'
import { join, dirname, relative } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

const execAsync = promisify(exec)

export interface ProjectFile {
  path: string
  content: string
  type?: string
}

export interface ProjectStructure {
  projectId: string
  projectName: string
  userId: string
  files: ProjectFile[]
  dependencies?: string[]
}

export interface ProjectPackage {
  projectId: string
  projectPath: string
  zipPath: string
  downloadUrl?: string
  size: number
  fileCount: number
}

/**
 * Project Manager Class
 */
export class ProjectManager {
  private supabase: ReturnType<typeof createClient<Database>>
  private baseProjectPath: string
  
  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.baseProjectPath = '/tmp/projects'
  }
  
  /**
   * Create project directory structure
   */
  async createProjectStructure(structure: ProjectStructure): Promise<string> {
    const projectPath = join(
      this.baseProjectPath,
      structure.userId,
      this.sanitizeName(structure.projectName)
    )
    
    console.log('[ProjectManager] Creating project structure:', projectPath)
    
    // Create base directory
    await mkdir(projectPath, { recursive: true })
    
    // Create standard Next.js structure
    await this.createStandardStructure(projectPath)
    
    // Write all generated files
    for (const file of structure.files) {
      await this.writeProjectFile(projectPath, file)
    }
    
    // Create package.json
    await this.createPackageJson(projectPath, structure.projectName, structure.dependencies)
    
    // Create .env.example
    await this.createEnvExample(projectPath)
    
    // Create README.md
    await this.createReadme(projectPath, structure.projectName)
    
    // Create .gitignore
    await this.createGitignore(projectPath)
    
    console.log('[ProjectManager]  Project structure created')
    
    return projectPath
  }
  
  /**
   * Create standard Next.js directory structure
   */
  private async createStandardStructure(projectPath: string): Promise<void> {
    const dirs = [
      'app',
      'app/api',
      'components',
      'lib',
      'lib/utils',
      'public',
      'supabase',
      'supabase/migrations',
      'types',
      '__tests__'
    ]
    
    for (const dir of dirs) {
      await mkdir(join(projectPath, dir), { recursive: true })
    }
  }
  
  /**
   * Write a single project file
   */
  private async writeProjectFile(projectPath: string, file: ProjectFile): Promise<void> {
    // Handle absolute paths (remove project path prefix if present)
    let relativePath = file.path
    if (file.path.startsWith(projectPath)) {
      relativePath = relative(projectPath, file.path)
    }
    
    const fullPath = join(projectPath, relativePath)
    const dir = dirname(fullPath)
    
    // Create directory if it doesn't exist
    await mkdir(dir, { recursive: true })
    
    // Write file
    await writeFile(fullPath, file.content, 'utf-8')
    
    console.log('[ProjectManager]  Written:', relativePath)
  }
  
  /**
   * Create package.json
   */
  private async createPackageJson(
    projectPath: string,
    projectName: string,
    dependencies?: string[]
  ): Promise<void> {
    const packageJson = {
      name: this.sanitizeName(projectName),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        test: 'vitest'
      },
      dependencies: {
        'next': '^14.2.0',
        'react': '^18.3.0',
        'react-dom': '^18.3.0',
        '@supabase/supabase-js': '^2.45.0',
        '@supabase/auth-helpers-nextjs': '^0.10.0',
        ...(dependencies && this.parseDependencies(dependencies))
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        'typescript': '^5.0.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.2.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0',
        'tailwindcss': '^3.4.0',
        'vitest': '^1.0.0'
      }
    }
    
    await writeFile(
      join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    )
  }
  
  /**
   * Parse dependencies array to object
   */
  private parseDependencies(deps: string[]): Record<string, string> {
    const result: Record<string, string> = {}
    for (const dep of deps) {
      // Remove duplicates and extract package name
      const pkgName = dep.replace(/^@/, '').split('/')[0]
      if (!result[dep]) {
        result[dep] = 'latest'
      }
    }
    return result
  }
  
  /**
   * Create .env.example
   */
  private async createEnvExample(projectPath: string): Promise<void> {
    const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Other API Keys
# OPENAI_API_KEY=your_openai_api_key
`
    
    await writeFile(join(projectPath, '.env.example'), envExample, 'utf-8')
  }
  
  /**
   * Create README.md
   */
  private async createReadme(projectPath: string, projectName: string): Promise<void> {
    const readme = `# ${projectName}

Generated by Mr.Prompt - AI-Powered Full-Stack Generator

## Getting Started

1. Install dependencies:
\`\`\`bash
pnpm install
# or
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` and add your Supabase credentials.

3. Run the development server:
\`\`\`bash
pnpm dev
# or
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- \`/app\` - Next.js App Router pages and API routes
- \`/components\` - React components
- \`/lib\` - Utility functions and helpers
- \`/supabase/migrations\` - Database migrations
- \`/types\` - TypeScript type definitions

## Database Setup

Run migrations in Supabase:

\`\`\`bash
# Using Supabase CLI
supabase db push
\`\`\`

Or manually run the SQL files in \`/supabase/migrations\` in your Supabase dashboard.

## Testing

\`\`\`bash
pnpm test
\`\`\`

## Deployment

Deploy to Vercel:

\`\`\`bash
vercel
\`\`\`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Mr.Prompt](https://mrprompt.dev)
`
    
    await writeFile(join(projectPath, 'README.md'), readme, 'utf-8')
  }
  
  /**
   * Create .gitignore
   */
  private async createGitignore(projectPath: string): Promise<void> {
    const gitignore = `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`
    
    await writeFile(join(projectPath, '.gitignore'), gitignore, 'utf-8')
  }
  
  /**
   * Save project files to database
   */
  async saveFilesToDatabase(projectPath: string, workflowId: string): Promise<void> {
    console.log('[ProjectManager] Saving files to database for workflow:', workflowId)
    
    try {
      const files = await this.getAllFiles(projectPath)
      
      // Save each file to database
      for (const file of files) {
        const relativePath = relative(projectPath, file.fullPath)
        const content = await readFileAsync(file.fullPath, 'utf-8')
        
        const { error } = await (this.supabase as any)
          .from('project_files')
          .upsert({
            workflow_id: workflowId,
            file_path: relativePath,
            content: content
          }, {
            onConflict: 'workflow_id,file_path'
          })
        
        if (error) {
          console.error('[ProjectManager] Error saving file:', relativePath, error)
        } else {
          console.log('[ProjectManager]  Saved:', relativePath)
        }
      }
      
      console.log('[ProjectManager]  All files saved to database')
    } catch (error) {
      console.error('[ProjectManager] Error saving files to database:', error)
      throw error
    }
  }
  
  /**
   * Get all files in directory recursively
   */
  private async getAllFiles(dir: string): Promise<Array<{ fullPath: string; relativePath: string }>> {
    const files: Array<{ fullPath: string; relativePath: string }> = []
    
    const items = await readdir(dir, { withFileTypes: true })
    
    for (const item of items) {
      // Skip node_modules, .next, and other build directories
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(item.name)) {
        continue
      }
      
      const fullPath = join(dir, item.name)
      
      if (item.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath)
        files.push(...subFiles)
      } else {
        files.push({
          fullPath,
          relativePath: relative(dir, fullPath)
        })
      }
    }
    
    return files
  }
  
  /**
   * Package project as ZIP
   */
  async packageProject(projectPath: string, projectId: string): Promise<ProjectPackage> {
    console.log('[ProjectManager] Packaging project:', projectPath)
    
    const zipPath = `${projectPath}.zip`
    
    // Create ZIP using system zip command
    const projectDir = dirname(projectPath)
    const projectName = projectPath.split('/').pop()!
    
    await execAsync(`cd "${projectDir}" && zip -r "${projectName}.zip" "${projectName}" -x "*/node_modules/*" "*/.next/*"`)
    
    // Get file count and size
    const fileCount = await this.countFiles(projectPath)
    const zipStats = await stat(zipPath)
    
    console.log('[ProjectManager]  Project packaged:', zipPath)
    console.log('[ProjectManager] Size:', (zipStats.size / 1024 / 1024).toFixed(2), 'MB')
    console.log('[ProjectManager] Files:', fileCount)
    
    // NEW: Save files to database
    try {
      await this.saveFilesToDatabase(projectPath, projectId)
    } catch (error) {
      console.error('[ProjectManager] Warning: Failed to save files to database:', error)
      // Don't throw - packaging should continue even if DB save fails
    }
    
    return {
      projectId,
      projectPath,
      zipPath,
      size: zipStats.size,
      fileCount
    }
  }
  
  /**
   * Upload project to Supabase Storage
   */
  async uploadToStorage(pkg: ProjectPackage, userId: string): Promise<string> {
    console.log('[ProjectManager] Uploading to Supabase Storage...')
    
    const fileName = `${userId}/${pkg.projectId}.zip`
    
    // Read ZIP file
    const zipBuffer = await readFileAsync(pkg.zipPath)
    
    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('projects')
      .upload(fileName, zipBuffer, {
        contentType: 'application/zip',
        upsert: true
      })
    
    if (error) {
      console.error('[ProjectManager] Upload error:', error)
      throw new Error(`Failed to upload project: ${error.message}`)
    }
    
    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('projects')
      .getPublicUrl(fileName)
    
    console.log('[ProjectManager]  Uploaded to:', urlData.publicUrl)
    
    return urlData.publicUrl
  }
  
  /**
   * Clean up project files
   */
  async cleanup(projectPath: string): Promise<void> {
    console.log('[ProjectManager] Cleaning up:', projectPath)
    
    try {
      await rm(projectPath, { recursive: true, force: true })
      await rm(`${projectPath}.zip`, { force: true })
      console.log('[ProjectManager]  Cleaned up')
    } catch (error) {
      console.error('[ProjectManager] Cleanup error:', error)
    }
  }
  
  /**
   * Count files in directory
   */
  private async countFiles(dir: string): Promise<number> {
    let count = 0
    
    const files = await readdir(dir, { withFileTypes: true })
    
    for (const file of files) {
      if (file.name === 'node_modules' || file.name === '.next') continue
      
      if (file.isDirectory()) {
        count += await this.countFiles(join(dir, file.name))
      } else {
        count++
      }
    }
    
    return count
  }
  
  /**
   * Sanitize project name for file system
   */
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
