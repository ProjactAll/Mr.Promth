import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

/**
 * POST /api/rooms/[id]/members
 * Add member to room
 */
export async function POST(
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
    const { user_id, role = 'member' } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'Validation error', message: 'กรุณาระบุ user_id' },
        { status: 400 }
      )
    }

    // Check if user has permission to add members
    const { data: room } = await supabase
      .from('rooms')
      .select('owner_id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json(
        { error: 'Not found', message: 'ไม่พบ room นี้' },
        { status: 404 }
      )
    }

    // Check if current user is owner or admin
    const isOwner = room.owner_id === session.user.id
    
    const { data: membership } = await supabase
      .from('room_members')
      .select('role')
      .eq('room_id', roomId)
      .eq('user_id', session.user.id)
      .single()

    const isAdmin = membership?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เพิ่มสมาชิก' },
        { status: 403 }
      )
    }

    // Add member
    const { data: member, error } = await supabase
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id,
        role
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Duplicate', message: 'ผู้ใช้นี้เป็นสมาชิกอยู่แล้ว' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: 'add_room_member',
      resource_type: 'room',
      resource_id: roomId,
      details: { added_user_id: user_id, role },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'เพิ่มสมาชิกสำเร็จ',
      member
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rooms/[id]/members/[userId]
 * Remove member from room
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'กรุณาระบุ user_id' },
        { status: 400 }
      )
    }

    // Check permissions
    const { data: room } = await supabase
      .from('rooms')
      .select('owner_id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json(
        { error: 'Not found', message: 'ไม่พบ room นี้' },
        { status: 404 }
      )
    }

    const isOwner = room.owner_id === session.user.id
    const isSelf = userId === session.user.id

    // Users can remove themselves, or owner/admin can remove others
    if (!isOwner && !isSelf) {
      const { data: membership } = await supabase
        .from('room_members')
        .select('role')
        .eq('room_id', roomId)
        .eq('user_id', session.user.id)
        .single()

      if (membership?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์ลบสมาชิก' },
          { status: 403 }
        )
      }
    }

    // Remove member
    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: 'remove_room_member',
      resource_type: 'room',
      resource_id: roomId,
      details: { removed_user_id: userId },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'ลบสมาชิกสำเร็จ'
    })
  } catch (error: any) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
