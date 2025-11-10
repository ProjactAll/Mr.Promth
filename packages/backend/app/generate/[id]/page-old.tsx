'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface WorkflowState {
  id: string
  projectName: string
  status: string
  currentStep: number
  totalSteps: number
  progress: number
  results: any
  errors: string[]
  createdAt: string
  updatedAt: string
}

const STEP_NAMES = [
  'Initializing',
  'Analyzing Prompt',
  'Expanding Requirements',
  'Generating Backend',
  'Generating Frontend',
  'Running Tests',
  'Deploying',
  'Setting up Monitoring'
]

const STEP_ICONS = ['', '🔍', '', '⚙️', '🎨', '', '🚢', '']

export default function WorkflowStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Poll for workflow status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/workflow/${params.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch workflow status')
        }
        
        setWorkflow(data.workflow)
        setLoading(false)
        
        // Stop polling if completed or failed
        if (data.workflow.status === 'completed' || data.workflow.status === 'failed') {
          return true // Stop polling
        }
        
        return false // Continue polling
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
        return true // Stop polling on error
      }
    }
    
    // Initial fetch
    fetchStatus()
    
    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await fetchStatus()
      if (shouldStop) {
        clearInterval(interval)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [params.id])
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this workflow?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/workflow/${params.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to cancel workflow')
      }
      
      router.push('/generate')
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel workflow')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workflow...</p>
        </div>
      </div>
    )
  }
  
  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Workflow not found'}
            </p>
            <button
              onClick={() => router.push('/generate')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Back to Generate
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const isCompleted = workflow.status === 'completed'
  const isFailed = workflow.status === 'failed'
  const isInProgress = !isCompleted && !isFailed
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {workflow.projectName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Workflow ID: {workflow.id}
            </p>
          </div>
          
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {workflow.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-green-600' :
                    isFailed ? 'bg-red-600' :
                    'bg-blue-600'
                  }`}
                  style={{ width: `${workflow.progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Steps */}
            <div className="space-y-4">
              {STEP_NAMES.map((stepName, index) => {
                const stepNumber = index + 1
                const isCurrentStep = stepNumber === workflow.currentStep
                const isCompletedStep = stepNumber < workflow.currentStep
                const isFutureStep = stepNumber > workflow.currentStep
                
                return (
                  <div
                    key={index}
                    className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                      isCurrentStep ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                      isCompletedStep ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'
                    }`}
                  >
                    <div className={`text-3xl mr-4 ${
                      isCurrentStep ? 'animate-bounce' : ''
                    }`}>
                      {isCompletedStep ? '' : STEP_ICONS[index]}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isCurrentStep ? 'text-blue-900 dark:text-blue-300' :
                        isCompletedStep ? 'text-green-900 dark:text-green-300' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stepName}
                      </h3>
                      {isCurrentStep && (
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          In progress...
                        </p>
                      )}
                    </div>
                    {isCurrentStep && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Status Message */}
            <div className="mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
              <p className="text-center text-gray-700 dark:text-gray-300">
                {isCompleted && ' Workflow completed successfully!'}
                {isFailed && ' Workflow failed. Check errors below.'}
                {isInProgress && `⏳ ${STEP_NAMES[workflow.currentStep - 1] || 'Processing'}...`}
              </p>
            </div>
            
            {/* Errors */}
            {workflow.errors.length > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                  Errors:
                </h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-400 space-y-1">
                  {workflow.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-8 flex gap-4">
              {isInProgress && (
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Cancel Workflow
                </button>
              )}
              
              {isCompleted && (
                <>
                  <button
                    onClick={() => router.push(`/projects/${workflow.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    View Project
                  </button>
                  <button
                    onClick={() => router.push('/generate')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Generate Another
                  </button>
                </>
              )}
              
              {isFailed && (
                <button
                  onClick={() => router.push('/generate')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Workflow Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(workflow.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(workflow.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
