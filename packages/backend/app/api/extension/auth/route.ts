import { createClient } from '@/lib/database'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

/**
 * POST /api/extension/auth
 * 
 * Extension Authentication Endpoint
 * 
 * Request Body:
 * {
 *   email: string
 *   password: string
 * }
 * 
 * Response:
 * {
 *   api_key: string
 *   user_id: string
 *   user: { ... }
 * }
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const userId = authData.user.id

    // Check if user already has an API key for extension
    const { data: existingKeys, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('name', 'Extension')
      .limit(1)

    if (fetchError) {
      console.error('Error fetching API keys:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    let apiKey: string

    if (existingKeys && existingKeys.length > 0) {
      // Return existing API key
      apiKey = existingKeys[0].key
    } else {
      // Generate new API key
      apiKey = `mrp_${randomBytes(32).toString('hex')}`

      // Store API key in database
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          name: 'Extension',
          key: apiKey,
        })

      if (insertError) {
        console.error('Error creating API key:', insertError)
        return NextResponse.json(
          { error: 'Failed to create API key' },
          { status: 500 }
        )
      }
    }

    // Return API key and user info
    return NextResponse.json({
      api_key: apiKey,
      user_id: userId,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        display_name: authData.user.user_metadata?.display_name || authData.user.email,
      },
    })

  } catch (error) {
    console.error('Extension auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/extension/auth
 * 
 * Verify API Key
 * 
 * Headers:
 * X-API-Key: string
 * 
 * Response:
 * {
 *   valid: boolean
 *   user_id?: string
 *   user?: { ... }
 * }
 */
export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Verify API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .limit(1)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json(
        { valid: false, error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey)

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', keyData.user_id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
    }

    return NextResponse.json({
      valid: true,
      user_id: keyData.user_id,
      user: userData || null,
    })

  } catch (error) {
    console.error('API key verification error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
