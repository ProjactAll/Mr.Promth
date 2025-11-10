import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/settings
 * Get all system settings (Admin only)
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

    // Get all settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key')

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings
 * Update a system setting (Admin only)
 */
export async function PUT(request: NextRequest) {
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
    const { setting_key, setting_value } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: 'Validation error', message: 'กรุณาระบุ setting_key และ setting_value' },
        { status: 400 }
      )
    }

    // Get old value for logging
    const { data: oldSetting } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', setting_key)
      .single()

    // Update setting
    const { data: setting, error } = await supabase
      .from('system_settings')
      .update({
        setting_value,
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', setting_key)
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
      action: 'update_system_setting',
      resource_type: 'system_setting',
      resource_id: setting.id,
      details: {
        setting_key,
        old_value: oldSetting?.setting_value,
        new_value: setting_value
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'อัปเดตการตั้งค่าสำเร็จ',
      setting
    })
  } catch (error: any) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/settings
 * Create a new system setting (Admin only)
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
    const { setting_key, setting_value, description } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: 'Validation error', message: 'กรุณาระบุ setting_key และ setting_value' },
        { status: 400 }
      )
    }

    // Create setting
    const { data: setting, error } = await supabase
      .from('system_settings')
      .insert({
        setting_key,
        setting_value,
        description,
        updated_by: session.user.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Duplicate key', message: 'การตั้งค่านี้มีอยู่แล้ว' },
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
      action: 'create_system_setting',
      resource_type: 'system_setting',
      resource_id: setting.id,
      details: { setting_key, setting_value, description },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'สร้างการตั้งค่าสำเร็จ',
      setting
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating setting:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
