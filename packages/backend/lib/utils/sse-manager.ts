/**
 * Server-Sent Events (SSE) Manager
 * Real-time progress updates for workflow execution
 */

export interface ProgressEvent {
  type: 'progress' | 'status' | 'error' | 'complete'
  step: number
  totalSteps: number
  message: string
  data?: any
  timestamp: string
}

export class SSEManager {
  private connections: Map<string, WritableStreamDefaultWriter> = new Map()
  
  /**
   * Create SSE connection
   */
  createConnection(workflowId: string): ReadableStream {
    const stream = new ReadableStream({
      start: (controller) => {
        // Store writer for this workflow
        const writer = controller as any as WritableStreamDefaultWriter
        this.connections.set(workflowId, writer)
        
        // Send initial connection message
        this.sendEvent(workflowId, {
          type: 'status',
          step: 0,
          totalSteps: 7,
          message: 'Connected to workflow stream',
          timestamp: new Date().toISOString()
        })
      },
      cancel: () => {
        // Clean up connection
        this.connections.delete(workflowId)
      }
    })
    
    return stream
  }
  
  /**
   * Send event to specific workflow
   */
  sendEvent(workflowId: string, event: ProgressEvent): boolean {
    const writer = this.connections.get(workflowId)
    
    if (!writer) {
      console.warn(`[SSE] No connection found for workflow: ${workflowId}`)
      return false
    }
    
    try {
      const data = `data: ${JSON.stringify(event)}\n\n`
      const encoder = new TextEncoder()
      writer.write(encoder.encode(data))
      return true
    } catch (error) {
      console.error(`[SSE] Error sending event:`, error)
      return false
    }
  }
  
  /**
   * Send progress update
   */
  sendProgress(
    workflowId: string,
    step: number,
    totalSteps: number,
    message: string,
    data?: any
  ): boolean {
    return this.sendEvent(workflowId, {
      type: 'progress',
      step,
      totalSteps,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }
  
  /**
   * Send status update
   */
  sendStatus(workflowId: string, message: string, data?: any): boolean {
    return this.sendEvent(workflowId, {
      type: 'status',
      step: 0,
      totalSteps: 0,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }
  
  /**
   * Send error
   */
  sendError(workflowId: string, message: string, error?: any): boolean {
    return this.sendEvent(workflowId, {
      type: 'error',
      step: 0,
      totalSteps: 0,
      message,
      data: error,
      timestamp: new Date().toISOString()
    })
  }
  
  /**
   * Send completion
   */
  sendComplete(workflowId: string, message: string, data?: any): boolean {
    const success = this.sendEvent(workflowId, {
      type: 'complete',
      step: 7,
      totalSteps: 7,
      message,
      data,
      timestamp: new Date().toISOString()
    })
    
    // Close connection after completion
    setTimeout(() => {
      this.closeConnection(workflowId)
    }, 1000)
    
    return success
  }
  
  /**
   * Close connection
   */
  closeConnection(workflowId: string): void {
    const writer = this.connections.get(workflowId)
    
    if (writer) {
      try {
        writer.close()
      } catch (error) {
        console.error(`[SSE] Error closing connection:`, error)
      }
      this.connections.delete(workflowId)
    }
  }
  
  /**
   * Get active connections count
   */
  getConnectionCount(): number {
    return this.connections.size
  }
  
  /**
   * Check if workflow has active connection
   */
  hasConnection(workflowId: string): boolean {
    return this.connections.has(workflowId)
  }
}

// Singleton instance
export const sseManager = new SSEManager()
