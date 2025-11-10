"use client"

import { CheckCircle2, Circle, Loader2, XCircle, Clock } from 'lucide-react'

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress?: number
  startTime?: Date
  endTime?: Date
  error?: string
}

interface ProgressTrackerProps {
  steps: WorkflowStep[]
  currentStep?: number
  showTimeline?: boolean
  compact?: boolean
}

export function ProgressTracker({ 
  steps, 
  currentStep = 0,
  showTimeline = true,
  compact = false
}: ProgressTrackerProps) {
  const getStepIcon = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle2 className="w-6 h-6 text-green-500" />
    } else if (step.status === 'running') {
      return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    } else if (step.status === 'error') {
      return <XCircle className="w-6 h-6 text-red-500" />
    } else {
      return (
        <Circle 
          className={`w-6 h-6 ${index <= currentStep ? 'text-gray-400' : 'text-gray-600'}`}
        />
      )
    }
  }

  const getStepColor = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') return 'border-green-500 bg-green-500/10'
    if (step.status === 'running') return 'border-blue-500 bg-blue-500/10'
    if (step.status === 'error') return 'border-red-500 bg-red-500/10'
    if (index <= currentStep) return 'border-gray-600 bg-gray-800'
    return 'border-gray-700 bg-gray-900'
  }

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return null
    const endTime = end || new Date()
    const duration = endTime.getTime() - start.getTime()
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              {getStepIcon(step, index)}
              <span className="text-sm text-gray-300">{step.name}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-700 mx-2" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Timeline connector */}
          {showTimeline && index < steps.length - 1 && (
            <div 
              className={`absolute left-3 top-12 w-0.5 h-full ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'
              }`}
            />
          )}

          {/* Step card */}
          <div className={`border rounded-lg p-4 ${getStepColor(step, index)}`}>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getStepIcon(step, index)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-medium">
                    {index + 1}. {step.name}
                  </h3>
                  
                  {step.status === 'running' && step.progress !== undefined && (
                    <span className="text-sm text-blue-400 font-medium">
                      {step.progress}%
                    </span>
                  )}
                </div>

                {step.description && (
                  <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                )}

                {/* Progress bar for running step */}
                {step.status === 'running' && step.progress !== undefined && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {step.status === 'error' && step.error && (
                  <div className="bg-red-900/20 border border-red-800 rounded p-3 mb-2">
                    <p className="text-sm text-red-400">{step.error}</p>
                  </div>
                )}

                {/* Duration */}
                {(step.startTime || step.endTime) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(step.startTime, step.endTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  completedSteps: number[]
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${completedSteps.includes(index) 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400'
                }
              `}
            >
              {completedSteps.includes(index) ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="text-xs text-gray-400 mt-2 text-center max-w-[80px]">
              {step}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-gray-700 mx-2">
              <div
                className={`h-full ${
                  completedSteps.includes(index) ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

interface ProgressSummaryProps {
  totalSteps: number
  completedSteps: number
  currentStep: string
  estimatedTimeRemaining?: number
}

export function ProgressSummary({ 
  totalSteps, 
  completedSteps, 
  currentStep,
  estimatedTimeRemaining
}: ProgressSummaryProps) {
  const percentage = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Workflow Progress</h3>
        <span className="text-2xl font-bold text-blue-500">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Current Step</p>
          <p className="text-white font-medium">{currentStep}</p>
        </div>
        <div>
          <p className="text-gray-400">Completed</p>
          <p className="text-white font-medium">{completedSteps} / {totalSteps}</p>
        </div>
        {estimatedTimeRemaining !== undefined && (
          <div className="col-span-2">
            <p className="text-gray-400">Estimated Time Remaining</p>
            <p className="text-white font-medium">
              {Math.ceil(estimatedTimeRemaining / 60)} minutes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
