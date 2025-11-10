import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

/**
 * PUT /api/admin/users/[id]
 * Update user (Admin only)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_active) {
      return NextResponse.json(
        { error: 'Account disabled', message: 'บัญชีของคุณถูกระงับ' },
        { status: 403 }
      )
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { role, is_active, full_name } = body

    // Validate role
    if (role && !['user', 'admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Role ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Prevent admin from disabling themselves
    if (params.id === session.user.id && is_active === false) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่สามารถระงับบัญชีของตัวเองได้' },
        { status: 403 }
      )
    }

    // Prevent admin from changing their own role
    if (params.id === session.user.id && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่สามารถเปลี่ยน Role ของตัวเองได้' },
        { status: 403 }
      )
    }

    // Get old user data for logging
    const { data: oldUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!oldUser) {
      return NextResponse.json(
        { error: 'Not found', message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Update user
    const updateData: any = { updated_at: new Date().toISOString() }
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active
    if (full_name !== undefined) updateData.full_name = full_name

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', params.id)
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
      action: 'update_user',
      resource_type: 'user',
      resource_id: params.id,
      details: {
        old_data: oldUser,
        new_data: user,
        changes: updateData
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'อัปเดตผู้ใช้สำเร็จ',
      user
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (Admin only)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_active) {
      return NextResponse.json(
        { error: 'Account disabled', message: 'บัญชีของคุณถูกระงับ' },
        { status: 403 }
      )
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' },
        { status: 403 }
      )
    }

    // Prevent admin from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่สามารถลบบัญชีของตัวเองได้' },
        { status: 403 }
      )
    }

    // Get user data for logging
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'Not found', message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Delete user from profiles (will cascade to auth.users)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: 'delete_user',
      resource_type: 'user',
      resource_id: params.id,
      details: { deleted_user: user },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ'
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
