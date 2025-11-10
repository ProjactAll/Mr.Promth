/**
 * Workflow Event Emitter
 * Provides real-time progress updates for workflows
 */

import { EventEmitter } from 'events'

export interface WorkflowEvent {
  workflowId: string
  type: 'progress' | 'status' | 'error' | 'complete'
  data: any
  timestamp: string
}

export interface ProgressEvent {
  step: number
  totalSteps: number
  status: string
  message: string
  progress: number
}

export interface StatusEvent {
  status: 'pending' | 'analyzing' | 'expanding' | 'generating-backend' | 'generating-frontend' | 'testing' | 'deploying' | 'monitoring' | 'completed' | 'failed'
  message?: string
}

export interface ErrorEvent {
  error: string
  step?: number
  recoverable: boolean
}

export interface CompleteEvent {
  success: boolean
  results: any
  duration: number
}

/**
 * Global workflow event emitter
 */
class WorkflowEventEmitter extends EventEmitter {
  private static instance: WorkflowEventEmitter
  
  private constructor() {
    super()
    this.setMaxListeners(100) // Support many concurrent workflows
  }
  
  static getInstance(): WorkflowEventEmitter {
    if (!WorkflowEventEmitter.instance) {
      WorkflowEventEmitter.instance = new WorkflowEventEmitter()
    }
    return WorkflowEventEmitter.instance
  }
  
  /**
   * Emit progress update
   */
  emitProgress(workflowId: string, progress: ProgressEvent): void {
    const event: WorkflowEvent = {
      workflowId,
      type: 'progress',
      data: progress,
      timestamp: new Date().toISOString()
    }
    
    this.emit(`workflow:${workflowId}`, event)
    this.emit('workflow:progress', event)
  }
  
  /**
   * Emit status change
   */
  emitStatus(workflowId: string, status: StatusEvent): void {
    const event: WorkflowEvent = {
      workflowId,
      type: 'status',
      data: status,
      timestamp: new Date().toISOString()
    }
    
    this.emit(`workflow:${workflowId}`, event)
    this.emit('workflow:status', event)
  }
  
  /**
   * Emit error
   */
  emitError(workflowId: string, error: ErrorEvent): void {
    const event: WorkflowEvent = {
      workflowId,
      type: 'error',
      data: error,
      timestamp: new Date().toISOString()
    }
    
    this.emit(`workflow:${workflowId}`, event)
    this.emit('workflow:error', event)
  }
  
  /**
   * Emit completion
   */
  emitComplete(workflowId: string, complete: CompleteEvent): void {
    const event: WorkflowEvent = {
      workflowId,
      type: 'complete',
      data: complete,
      timestamp: new Date().toISOString()
    }
    
    this.emit(`workflow:${workflowId}`, event)
    this.emit('workflow:complete', event)
  }
  
  /**
   * Subscribe to workflow events
   */
  subscribeToWorkflow(workflowId: string, callback: (event: WorkflowEvent) => void): () => void {
    const listener = (event: WorkflowEvent) => callback(event)
    this.on(`workflow:${workflowId}`, listener)
    
    // Return unsubscribe function
    return () => {
      this.off(`workflow:${workflowId}`, listener)
    }
  }
  
  /**
   * Subscribe to all workflow events
   */
  subscribeToAll(callback: (event: WorkflowEvent) => void): () => void {
    const progressListener = (event: WorkflowEvent) => callback(event)
    const statusListener = (event: WorkflowEvent) => callback(event)
    const errorListener = (event: WorkflowEvent) => callback(event)
    const completeListener = (event: WorkflowEvent) => callback(event)
    
    this.on('workflow:progress', progressListener)
    this.on('workflow:status', statusListener)
    this.on('workflow:error', errorListener)
    this.on('workflow:complete', completeListener)
    
    // Return unsubscribe function
    return () => {
      this.off('workflow:progress', progressListener)
      this.off('workflow:status', statusListener)
      this.off('workflow:error', errorListener)
      this.off('workflow:complete', completeListener)
    }
  }
}

// Export singleton instance
export const workflowEvents = WorkflowEventEmitter.getInstance()
