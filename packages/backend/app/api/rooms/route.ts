import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

/**
 * GET /api/rooms
 * Get all rooms for the current user
 */
export async function GET(request: NextRequest) {
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

    // Get rooms where user is owner or member
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_members!inner(user_id, role)
      `)
      .eq('room_members.user_id', session.user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ rooms })
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms
 * Create a new room
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { name, description, type = 'private', settings = {} } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Validation error', message: 'กรุณาระบุชื่อ room' },
        { status: 400 }
      )
    }

    // Create room
    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        name,
        description,
        owner_id: session.user.id,
        type,
        settings
      })
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
      action: 'create_room',
      resource_type: 'room',
      resource_id: room.id,
      details: { name, type },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'สร้าง room สำเร็จ',
      room
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
