/**
 * useWorkflowStream Hook
 * React hook for subscribing to real-time workflow updates via SSE
 */

import { useEffect, useState, useCallback } from 'react'

export interface WorkflowEvent {
  workflowId: string
  type: 'progress' | 'status' | 'error' | 'complete'
  data: any
  timestamp: string
}

export interface WorkflowProgress {
  step: number
  totalSteps: number
  status: string
  message: string
  progress: number
}

export interface UseWorkflowStreamOptions {
  onProgress?: (progress: WorkflowProgress) => void
  onStatus?: (status: any) => void
  onError?: (error: any) => void
  onComplete?: (complete: any) => void
  onEvent?: (event: WorkflowEvent) => void
}

export function useWorkflowStream(workflowId: string | null, options: UseWorkflowStreamOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WorkflowEvent | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const connect = useCallback(() => {
    if (!workflowId) return
    
    console.log('[WorkflowStream] Connecting to workflow:', workflowId)
    
    const eventSource = new EventSource(`/api/workflow/${workflowId}/stream`)
    
    eventSource.onopen = () => {
      console.log('[WorkflowStream] Connected')
      setIsConnected(true)
      setError(null)
    }
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Skip heartbeat messages
        if (data.type === 'heartbeat') {
          return
        }
        
        const workflowEvent = data as WorkflowEvent
        setLastEvent(workflowEvent)
        
        // Call appropriate callback
        switch (workflowEvent.type) {
          case 'progress':
            options.onProgress?.(workflowEvent.data)
            break
          case 'status':
            options.onStatus?.(workflowEvent.data)
            break
          case 'error':
            options.onError?.(workflowEvent.data)
            break
          case 'complete':
            options.onComplete?.(workflowEvent.data)
            break
        }
        
        // Call general event callback
        options.onEvent?.(workflowEvent)
        
      } catch (err) {
        console.error('[WorkflowStream] Error parsing event:', err)
      }
    }
    
    eventSource.onerror = (err) => {
      console.error('[WorkflowStream] Error:', err)
      setError(new Error('Connection error'))
      setIsConnected(false)
      eventSource.close()
    }
    
    return eventSource
  }, [workflowId, options])
  
  useEffect(() => {
    if (!workflowId) return
    
    const eventSource = connect()
    
    return () => {
      if (eventSource) {
        console.log('[WorkflowStream] Disconnecting')
        eventSource.close()
        setIsConnected(false)
      }
    }
  }, [workflowId, connect])
  
  return {
    isConnected,
    lastEvent,
    error,
    reconnect: connect
  }
}

/**
 * Hook for tracking workflow progress
 */
export function useWorkflowProgress(workflowId: string | null) {
  const [progress, setProgress] = useState<WorkflowProgress | null>(null)
  const [status, setStatus] = useState<string>('pending')
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useWorkflowStream(workflowId, {
    onProgress: (p) => {
      setProgress(p)
      setStatus(p.status)
    },
    onStatus: (s) => {
      setStatus(s.status)
    },
    onError: (e) => {
      setError(e.error)
    },
    onComplete: (c) => {
      setIsComplete(true)
      if (!c.success) {
        setError('Workflow failed')
      }
    }
  })
  
  return {
    progress,
    status,
    isComplete,
    error
  }
}
