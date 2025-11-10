/**
 * Workflow Stream API
 * Server-Sent Events (SSE) endpoint for real-time workflow updates
 */

import { NextRequest } from 'next/server'
import { workflowEvents, type WorkflowEvent } from '@/lib/workflow/events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/workflow/[id]/stream
 * Stream real-time updates for a specific workflow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const workflowId = params.id
  
  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Send initial connection message
      const sendEvent = (event: WorkflowEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }
      
      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`
        controller.enqueue(encoder.encode(heartbeat))
      }, 30000)
      
      // Subscribe to workflow events
      const unsubscribe = workflowEvents.subscribeToWorkflow(workflowId, (event) => {
        sendEvent(event)
        
        // Close stream when workflow is complete or failed
        if (event.type === 'complete') {
          setTimeout(() => {
            clearInterval(heartbeatInterval)
            unsubscribe()
            controller.close()
          }, 1000)
        }
      })
      
      // Send initial connection message
      const connectionEvent: WorkflowEvent = {
        workflowId,
        type: 'status',
        data: { status: 'connected', message: 'Connected to workflow stream' },
        timestamp: new Date().toISOString()
      }
      sendEvent(connectionEvent)
      
      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        unsubscribe()
        controller.close()
      })
    }
  })
  
  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    }
  })
}
