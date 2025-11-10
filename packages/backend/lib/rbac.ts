/**
 * Role-Based Access Control (RBAC) Utilities
 * Handles authentication and authorization for Mr.Prompt
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export type UserRole = 'user' | 'admin' | 'moderator'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: UserRole
  is_active: boolean
  created_at: string
  last_sign_in_at?: string
}

/**
 * Get current user's profile with role information
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return profile
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}

/**
 * Check if user is moderator or admin
 */
export function isModerator(userRole: UserRole): boolean {
  return userRole === 'moderator' || userRole === 'admin'
}

/**
 * Middleware: Require authentication
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return null
}

/**
 * Middleware: Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<NextResponse | null> {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!profile.is_active) {
    return NextResponse.redirect(new URL('/account-disabled', request.url))
  }

  if (!hasRole(profile.role as UserRole, allowedRoles)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return null
}

/**
 * API Helper: Require authentication for API routes
 */
export async function requireAuthAPI(request: NextRequest): Promise<{
  error?: NextResponse
  session?: any
  profile?: UserProfile
}> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'กรุณา Login ก่อนใช้งาน' },
        { status: 401 }
      )
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return {
      error: NextResponse.json(
        { error: 'Profile not found', message: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      )
    }
  }

  if (!profile.is_active) {
    return {
      error: NextResponse.json(
        { error: 'Account disabled', message: 'บัญชีของคุณถูกระงับ' },
        { status: 403 }
      )
    }
  }

  return { session, profile }
}

/**
 * API Helper: Require specific role for API routes
 */
export async function requireRoleAPI(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{
  error?: NextResponse
  session?: any
  profile?: UserProfile
}> {
  const authResult = await requireAuthAPI(request)
  
  if (authResult.error) {
    return authResult
  }

  const { profile } = authResult

  if (!hasRole(profile!.role, allowedRoles)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' },
        { status: 403 }
      )
    }
  }

  return authResult
}

/**
 * Log user activity
 */
export async function logActivity(params: {
  user_id: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
}) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    await supabase.from('activity_logs').insert({
      user_id: params.user_id,
      action: params.action,
      resource_type: params.resource_type,
      resource_id: params.resource_id,
      details: params.details,
      ip_address: params.ip_address,
      user_agent: params.user_agent,
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
