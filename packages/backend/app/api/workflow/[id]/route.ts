import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getWorkflowStatus, cancelWorkflow } from '@/lib/workflow/orchestrator'

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflow/[id]
 * Get workflow status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Get workflow status
    const status = await getWorkflowStatus(params.id)
    
    if (!status) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }
    
    // Check if user owns this workflow
    if (status.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      success: true,
      workflow: status
    })
    
  } catch (error) {
    console.error('[API] Error getting workflow status:', error)
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workflow/[id]
 * Cancel workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Get workflow to check ownership
    const status = await getWorkflowStatus(params.id)
    
    if (!status) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }
    
    if (status.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Cancel workflow
    const success = await cancelWorkflow(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cancel workflow' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workflow cancelled successfully'
    })
    
  } catch (error) {
    console.error('[API] Error cancelling workflow:', error)
    return NextResponse.json(
      { error: 'Failed to cancel workflow' },
      { status: 500 }
    )
  }
}
