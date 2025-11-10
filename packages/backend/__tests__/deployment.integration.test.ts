/**
 * Deployment Integration Tests
 * Tests GitHub and Vercel deployment functionality
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { createGitHubClient } from '@/lib/integrations/github-client'
import { createVercelClient } from '@/lib/integrations/vercel-client'

describe('GitHub Integration Tests', () => {
  let githubClient: ReturnType<typeof createGitHubClient>
  const testRepoName = `test-repo-${Date.now()}`
  let createdRepoName: string | null = null

  beforeAll(() => {
    // Skip tests if no GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.warn('Skipping GitHub tests: GITHUB_TOKEN not set')
      return
    }
    
    githubClient = createGitHubClient(process.env.GITHUB_TOKEN)
  })

  describe('GitHub Client', () => {
    it('should authenticate and get user info', async () => {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping: No GitHub token')
        return
      }

      const user = await githubClient.getAuthenticatedUser()
      expect(user).toBeDefined()
      expect(user.login).toBeDefined()
      expect(typeof user.login).toBe('string')
    }, 10000)

    it('should create a repository', async () => {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping: No GitHub token')
        return
      }

      const result = await githubClient.createRepository({
        name: testRepoName,
        description: 'Test repository created by Mr.Prompt integration tests',
        private: true,
        autoInit: true
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.url).toBeDefined()
        expect(result.cloneUrl).toBeDefined()
        createdRepoName = testRepoName
      }
    }, 15000)

    it('should push files to repository', async () => {
      if (!process.env.GITHUB_TOKEN || !createdRepoName) {
        console.log('Skipping: No GitHub token or repo not created')
        return
      }

      const user = await githubClient.getAuthenticatedUser()
      
      const files = [
        {
          path: 'README.md',
          content: '# Test Repository\n\nThis is a test.'
        },
        {
          path: 'src/index.ts',
          content: 'console.log("Hello, World!");'
        }
      ]

      // Wait a bit for GitHub to initialize the repo
      await new Promise(resolve => setTimeout(resolve, 3000))

      const result = await githubClient.pushFiles({
        owner: user.login,
        repo: createdRepoName,
        files,
        message: 'Test commit from integration tests'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.commitSha).toBeDefined()
      }
    }, 20000)

    it('should get repository details', async () => {
      if (!process.env.GITHUB_TOKEN || !createdRepoName) {
        console.log('Skipping: No GitHub token or repo not created')
        return
      }

      const user = await githubClient.getAuthenticatedUser()
      const result = await githubClient.getRepository(user.login, createdRepoName)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.repo).toBeDefined()
        expect(result.repo.name).toBe(createdRepoName)
      }
    }, 10000)

    it('should handle repository not found', async () => {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping: No GitHub token')
        return
      }

      const user = await githubClient.getAuthenticatedUser()
      const result = await githubClient.getRepository(user.login, 'non-existent-repo-12345')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Repository not found')
    }, 10000)

    it('should delete test repository (cleanup)', async () => {
      if (!process.env.GITHUB_TOKEN || !createdRepoName) {
        console.log('Skipping: No GitHub token or repo not created')
        return
      }

      const user = await githubClient.getAuthenticatedUser()
      const result = await githubClient.deleteRepository(user.login, createdRepoName)

      expect(result.success).toBe(true)
    }, 10000)
  })
})

describe('Vercel Integration Tests', () => {
  let vercelClient: ReturnType<typeof createVercelClient>
  const testProjectName = `test-project-${Date.now()}`
  let createdProjectId: string | null = null

  beforeAll(() => {
    // Skip tests if no Vercel token is available
    if (!process.env.VERCEL_TOKEN) {
      console.warn('Skipping Vercel tests: VERCEL_TOKEN not set')
      return
    }
    
    vercelClient = createVercelClient(process.env.VERCEL_TOKEN)
  })

  describe('Vercel Client', () => {
    it('should list projects', async () => {
      if (!process.env.VERCEL_TOKEN) {
        console.log('Skipping: No Vercel token')
        return
      }

      const result = await vercelClient.listProjects(5)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.projects).toBeDefined()
        expect(Array.isArray(result.projects)).toBe(true)
      }
    }, 10000)

    it('should create a project', async () => {
      if (!process.env.VERCEL_TOKEN) {
        console.log('Skipping: No Vercel token')
        return
      }

      const result = await vercelClient.createProject({
        name: testProjectName,
        framework: 'nextjs',
        environmentVariables: [
          {
            key: 'TEST_VAR',
            value: 'test-value',
            target: ['production', 'preview']
          }
        ]
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.project).toBeDefined()
        expect(result.project.id).toBeDefined()
        expect(result.url).toBeDefined()
        createdProjectId = result.project.id
      }
    }, 15000)

    it('should get project details', async () => {
      if (!process.env.VERCEL_TOKEN || !createdProjectId) {
        console.log('Skipping: No Vercel token or project not created')
        return
      }

      const result = await vercelClient.getProject(createdProjectId)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.project).toBeDefined()
        expect(result.project.id).toBe(createdProjectId)
      }
    }, 10000)

    it('should handle project not found', async () => {
      if (!process.env.VERCEL_TOKEN) {
        console.log('Skipping: No Vercel token')
        return
      }

      const result = await vercelClient.getProject('non-existent-project-12345')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Project not found')
    }, 10000)

    it('should delete test project (cleanup)', async () => {
      if (!process.env.VERCEL_TOKEN || !createdProjectId) {
        console.log('Skipping: No Vercel token or project not created')
        return
      }

      const result = await vercelClient.deleteProject(createdProjectId)
      expect(result.success).toBe(true)
    }, 10000)
  })
})

describe('Deploy API Endpoint Tests', () => {
  it('should validate required fields', async () => {
    const response = await fetch('http://localhost:3000/api/projects/test-123/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing githubToken
        repoName: 'test-repo'
      })
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toContain('GitHub token')
  })

  it('should validate Vercel token when deployToVercel is true', async () => {
    const response = await fetch('http://localhost:3000/api/projects/test-123/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        githubToken: 'test-token',
        deployToVercel: true
        // Missing vercelToken
      })
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toContain('Vercel token')
  })
})

describe('Error Handling Tests', () => {
  describe('GitHub Error Handling', () => {
    it('should handle invalid GitHub token', async () => {
      try {
        const invalidClient = createGitHubClient('invalid-token-12345')
        await invalidClient.getAuthenticatedUser()
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    }, 10000)

    it('should handle repository already exists', async () => {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping: No GitHub token')
        return
      }

      const githubClient = createGitHubClient(process.env.GITHUB_TOKEN)
      const repoName = 'existing-repo-test'

      // Create repository first time
      const firstResult = await githubClient.createRepository({
        name: repoName,
        private: true
      })

      if (firstResult.success) {
        // Try to create again
        const secondResult = await githubClient.createRepository({
          name: repoName,
          private: true
        })

        expect(secondResult.success).toBe(false)
        expect(secondResult.code).toBe('REPO_EXISTS')

        // Cleanup
        const user = await githubClient.getAuthenticatedUser()
        await githubClient.deleteRepository(user.login, repoName)
      }
    }, 20000)
  })

  describe('Vercel Error Handling', () => {
    it('should handle invalid Vercel token', async () => {
      try {
        const invalidClient = createVercelClient('invalid-token-12345')
        await invalidClient.listProjects()
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    }, 10000)
  })
})
