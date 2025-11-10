'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkflowProgress } from '@/lib/hooks/useWorkflowStream'

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

const STEP_DETAILS = [
  { name: 'Initializing', icon: '', description: 'Setting up workflow environment' },
  { name: 'Analyzing Prompt', icon: '🔍', description: 'Understanding your requirements with AI' },
  { name: 'Expanding Requirements', icon: '', description: 'Creating detailed specifications' },
  { name: 'Generating Backend', icon: '⚙️', description: 'Creating API routes and database schema' },
  { name: 'Generating Frontend', icon: '🎨', description: 'Building UI components and pages' },
  { name: 'Running Tests', icon: '', description: 'Generating and running automated tests' },
  { name: 'Deploying', icon: '🚢', description: 'Deploying to Vercel' },
  { name: 'Setting up Monitoring', icon: '', description: 'Configuring health checks and monitoring' }
]

export default function WorkflowStatusPageEnhanced({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  
  // Use SSE for real-time updates
  const { progress: realtimeProgress, status, isComplete, error: streamError } = useWorkflowProgress(params.id)
  
  // Fetch initial workflow state
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch(`/api/workflow/${params.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch workflow status')
        }
        
        setWorkflow(data.workflow)
        setLoading(false)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }
    
    fetchInitialState()
  }, [params.id])
  
  // Update workflow state from real-time progress
  useEffect(() => {
    if (realtimeProgress && workflow) {
      setWorkflow(prev => prev ? {
        ...prev,
        currentStep: realtimeProgress.step,
        progress: realtimeProgress.progress,
        status: realtimeProgress.status
      } : null)
      
      setStatusMessage(realtimeProgress.message)
      
      // Add to logs
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${realtimeProgress.message}`])
    }
  }, [realtimeProgress, workflow])
  
  // Handle stream errors
  useEffect(() => {
    if (streamError) {
      setError(streamError)
    }
  }, [streamError])
  
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
  
  const handleDownload = async () => {
    if (!workflow?.results?.package?.downloadUrl) {
      alert('Project files are not ready yet')
      return
    }
    
    window.open(workflow.results.package.downloadUrl, '_blank')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading workflow...</p>
        </div>
      </div>
    )
  }
  
  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Workflow not found'}
            </p>
            <button
              onClick={() => router.push('/generate')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Back to Generate
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const isCompleted = workflow.status === 'completed' || isComplete
  const isFailed = workflow.status === 'failed'
  const isInProgress = !isCompleted && !isFailed
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <span className="text-4xl"></span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {workflow.projectName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Workflow ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{workflow.id}</code>
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
                {/* Overall Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Overall Progress
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {workflow.progress}%
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        isFailed ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}
                      style={{ width: `${workflow.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Current Status Message */}
                {statusMessage && isInProgress && (
                  <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <p className="text-blue-900 dark:text-blue-300 font-medium">
                        {statusMessage}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Steps */}
                <div className="space-y-3">
                  {STEP_DETAILS.map((step, index) => {
                    const stepNumber = index + 1
                    const isCurrentStep = stepNumber === workflow.currentStep
                    const isCompletedStep = stepNumber < workflow.currentStep
                    const isFutureStep = stepNumber > workflow.currentStep
                    
                    return (
                      <div
                        key={index}
                        className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                          isCurrentStep ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105' :
                          isCompletedStep ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                          'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 opacity-60'
                        }`}
                      >
                        {/* Step Icon */}
                        <div className={`text-4xl mr-4 ${
                          isCurrentStep ? 'animate-bounce' : ''
                        }`}>
                          {isCompletedStep ? '' : step.icon}
                        </div>
                        
                        {/* Step Content */}
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${
                            isCurrentStep ? 'text-blue-900 dark:text-blue-300' :
                            isCompletedStep ? 'text-green-900 dark:text-green-300' :
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            {step.name}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            isCurrentStep ? 'text-blue-700 dark:text-blue-400' :
                            isCompletedStep ? 'text-green-700 dark:text-green-400' :
                            'text-gray-500 dark:text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                        
                        {/* Loading Spinner */}
                        {isCurrentStep && (
                          <div className="ml-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                          </div>
                        )}
                        
                        {/* Checkmark */}
                        {isCompletedStep && (
                          <div className="ml-4 text-green-600 text-2xl">
                            ✓
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Final Status */}
                <div className="mt-8">
                  {isCompleted && (
                    <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl"></span>
                        <div>
                          <h3 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-1">
                            Workflow Completed!
                          </h3>
                          <p className="text-green-700 dark:text-green-400">
                            Your project is ready to download and deploy.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isFailed && (
                    <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-500">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl"></span>
                        <div>
                          <h3 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-1">
                            Workflow Failed
                          </h3>
                          <p className="text-red-700 dark:text-red-400">
                            Something went wrong. Check the errors below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Errors */}
                {workflow.errors.length > 0 && (
                  <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                      <span className="text-xl"></span>
                      Errors:
                    </h3>
                    <ul className="space-y-2">
                      {workflow.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-400">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {isInProgress && (
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel Workflow
                    </button>
                  )}
                  
                  {isCompleted && (
                    <>
                      <button
                        onClick={() => router.push(`/editor/${params.id}`)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
                      >
                        ✏️ Edit in Browser
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
                      >
                        📦 Download Project
                      </button>
                      <button
                        onClick={() => router.push('/generate')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Generate Another
                      </button>
                    </>
                  )}
                  
                  {isFailed && (
                    <button
                      onClick={() => router.push('/generate')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workflow Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Workflow Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                      isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      isFailed ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Created:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(workflow.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Last Updated:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(workflow.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Step:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {workflow.currentStep} / {workflow.totalSteps}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Live Logs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-xl"></span>
                  Live Logs
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">Waiting for logs...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-green-400 mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Results Preview */}
              {workflow.results?.package && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📦</span>
                    Project Package
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Files:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {workflow.results.package.fileCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(workflow.results.package.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
