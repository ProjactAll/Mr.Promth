import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator'

export const dynamic = 'force-dynamic';

/**
 * POST /api/workflow
 * Start a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { projectName, prompt, options } = body
    
    // Validate input
    if (!projectName || !prompt) {
      return NextResponse.json(
        { error: 'Project name and prompt are required' },
        { status: 400 }
      )
    }
    
    // Create workflow orchestrator
    const orchestrator = new WorkflowOrchestrator({
      userId: session.user.id,
      projectName,
      prompt,
      options
    })
    
    // Start workflow (async - don't wait)
    // In production, this should be a background job
    orchestrator.execute(prompt, options).catch(error => {
      console.error('[API] Workflow error:', error)
    })
    
    // Return workflow ID immediately
    const state = orchestrator.getState()
    
    return NextResponse.json({
      success: true,
      workflowId: state.id,
      status: state.status,
      message: 'Workflow started successfully'
    })
    
  } catch (error) {
    console.error('[API] Error starting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to start workflow' },
      { status: 500 }
    )
  }
}
