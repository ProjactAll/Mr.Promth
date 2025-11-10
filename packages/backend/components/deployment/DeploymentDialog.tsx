"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { Loader2, Github, ExternalLink, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface DeploymentDialogProps {
  projectId: string
  projectName: string
  onClose: () => void
}

interface DeploymentStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
  url?: string
}

export function DeploymentDialog({ projectId, projectName, onClose }: DeploymentDialogProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [config, setConfig] = useState({
    githubToken: '',
    vercelToken: '',
    repoName: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    repoPrivate: false,
    deployToVercel: true
  })
  
  const [steps, setSteps] = useState<DeploymentStep[]>([
    { id: 'github-repo', name: 'Create GitHub Repository', status: 'pending' },
    { id: 'github-push', name: 'Push Code to GitHub', status: 'pending' },
    { id: 'vercel-project', name: 'Create Vercel Project', status: 'pending' },
    { id: 'vercel-deploy', name: 'Deploy to Vercel', status: 'pending' }
  ])

  const updateStep = (stepId: string, updates: Partial<DeploymentStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const handleDeploy = async () => {
    if (!config.githubToken) {
      toast.error('GitHub token is required')
      return
    }

    if (config.deployToVercel && !config.vercelToken) {
      toast.error('Vercel token is required for deployment')
      return
    }

    try {
      setIsDeploying(true)

      // Step 1: Create GitHub repository
      updateStep('github-repo', { status: 'running', message: 'Creating repository...' })
      
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Deployment failed')
      }

      const result = await response.json()

      // Update GitHub steps
      if (result.github) {
        updateStep('github-repo', { 
          status: 'success', 
          message: 'Repository created',
          url: result.github.url
        })
        updateStep('github-push', { 
          status: 'success', 
          message: 'Code pushed successfully',
          url: result.github.commitUrl
        })
      }

      // Update Vercel steps
      if (config.deployToVercel) {
        if (result.vercel && !result.vercel.error) {
          updateStep('vercel-project', { 
            status: 'success', 
            message: 'Project created',
            url: result.vercel.url
          })
          updateStep('vercel-deploy', { 
            status: 'success', 
            message: 'Deployment successful',
            url: result.vercel.deploymentUrl
          })
        } else {
          updateStep('vercel-project', { 
            status: 'error', 
            message: result.vercel?.error || 'Vercel deployment failed'
          })
          updateStep('vercel-deploy', { status: 'pending' })
        }
      } else {
        // Skip Vercel steps
        updateStep('vercel-project', { status: 'pending', message: 'Skipped' })
        updateStep('vercel-deploy', { status: 'pending', message: 'Skipped' })
      }

      toast.success('Deployment completed!')

    } catch (error) {
      console.error('Deployment error:', error)
      toast.error(error instanceof Error ? error.message : 'Deployment failed')
      
      // Mark current running step as error
      setSteps(prev => prev.map(step => 
        step.status === 'running' 
          ? { ...step, status: 'error', message: error instanceof Error ? error.message : 'Failed' }
          : step
      ))
    } finally {
      setIsDeploying(false)
    }
  }

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Github className="w-6 h-6" />
              Deploy to GitHub & Vercel
            </h2>
            <button
              onClick={onClose}
              disabled={isDeploying}
              className="text-gray-400 hover:text-white disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub Personal Access Token *
              </label>
              <input
                type="password"
                value={config.githubToken}
                onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                placeholder="ghp_..."
                disabled={isDeploying}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Create a token with <code className="text-blue-400">repo</code> scope at{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Repository Name
              </label>
              <input
                type="text"
                value={config.repoName}
                onChange={(e) => setConfig({ ...config, repoName: e.target.value })}
                placeholder="my-project"
                disabled={isDeploying}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="repoPrivate"
                checked={config.repoPrivate}
                onChange={(e) => setConfig({ ...config, repoPrivate: e.target.checked })}
                disabled={isDeploying}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700"
              />
              <label htmlFor="repoPrivate" className="text-sm text-gray-300">
                Make repository private
              </label>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="deployToVercel"
                  checked={config.deployToVercel}
                  onChange={(e) => setConfig({ ...config, deployToVercel: e.target.checked })}
                  disabled={isDeploying}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                />
                <label htmlFor="deployToVercel" className="text-sm font-medium text-gray-300">
                  Deploy to Vercel
                </label>
              </div>

              {config.deployToVercel && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vercel Token *
                  </label>
                  <input
                    type="password"
                    value={config.vercelToken}
                    onChange={(e) => setConfig({ ...config, vercelToken: e.target.value })}
                    placeholder="vercel_..."
                    disabled={isDeploying}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Create a token at{' '}
                    <a
                      href="https://vercel.com/account/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      vercel.com/account/tokens
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Deployment Steps */}
          {isDeploying && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Deployment Progress</h3>
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded">
                  <div className="mt-0.5">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{step.name}</p>
                      {step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {step.message && (
                      <p className="text-xs text-gray-400 mt-1">{step.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || !config.githubToken || (config.deployToVercel && !config.vercelToken)}
              className="flex-1"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Deploy Now
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isDeploying}
            >
              {isDeploying ? 'Close' : 'Cancel'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">What happens during deployment:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Creates a new GitHub repository with your code</li>
                  <li>Pushes all project files to the repository</li>
                  {config.deployToVercel && (
                    <>
                      <li>Creates a Vercel project linked to GitHub</li>
                      <li>Deploys your application to Vercel</li>
                      <li>Sets up automatic deployments on push</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
