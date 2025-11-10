import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

/**
 * GET /api/rooms/[id]
 * Get room details with members
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
        { error: 'Unauthorized', message: 'กรุณา Login ก่อนใช้งาน' },
        { status: 401 }
      )
    }

    const roomId = params.id

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Not found', message: 'ไม่พบ room นี้' },
        { status: 404 }
      )
    }

    // Get room members
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('room_id', roomId)

    if (membersError) {
      console.error('Error fetching members:', membersError)
    }

    // Get active terminal sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('terminal_sessions')
      .select('*')
      .eq('room_id', roomId)
      .eq('status', 'active')

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
    }

    return NextResponse.json({
      room,
      members: members || [],
      active_sessions: sessions || []
    })
  } catch (error: any) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/rooms/[id]
 * Update room details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'กรุณา Login ก่อนใช้งาน' },
        { status: 401 }
      )
    }

    const roomId = params.id
    const body = await request.json()
    const { name, description, type, settings, is_active } = body

    // Check if user is room owner
    const { data: room } = await supabase
      .from('rooms')
      .select('owner_id')
      .eq('id', roomId)
      .single()

    if (!room || room.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์แก้ไข room นี้' },
        { status: 403 }
      )
    }

    // Update room
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (settings !== undefined) updateData.settings = settings
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: updatedRoom, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: 'update_room',
      resource_type: 'room',
      resource_id: roomId,
      details: updateData,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'อัปเดต room สำเร็จ',
      room: updatedRoom
    })
  } catch (error: any) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rooms/[id]
 * Delete room
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
        { error: 'Unauthorized', message: 'กรุณา Login ก่อนใช้งาน' },
        { status: 401 }
      )
    }

    const roomId = params.id

    // Check if user is room owner
    const { data: room } = await supabase
      .from('rooms')
      .select('owner_id, name')
      .eq('id', roomId)
      .single()

    if (!room || room.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์ลบ room นี้' },
        { status: 403 }
      )
    }

    // Delete room (cascade will handle members and sessions)
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: 'delete_room',
      resource_type: 'room',
      resource_id: roomId,
      details: { name: room.name },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'ลบ room สำเร็จ'
    })
  } catch (error: any) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
