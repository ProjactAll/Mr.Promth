import { createClient, createServiceClient, getExtensionApiKey, createExtensionApiKey, updateApiKeyLastUsed, getUserProfile } from '@/lib/database'
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

    // Create Supabase client with anon key for authentication
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

    // Check if user already has an API key for extension (using service client)
    let existingKey = null
    try {
      existingKey = await getExtensionApiKey(userId)
    } catch (error) {
      // No existing key, will create new one
    }

    let apiKey: string

    if (existingKey) {
      // Return existing API key
      apiKey = existingKey.key
      
      // Update last used timestamp
      await updateApiKeyLastUsed(apiKey)
    } else {
      // Generate new API key
      apiKey = `mrp_${randomBytes(32).toString('hex')}`

      // Store API key in database (using service client)
      try {
        await createExtensionApiKey(userId, apiKey)
      } catch (error) {
        console.error('Error creating API key:', error)
        return NextResponse.json(
          { error: 'Failed to create API key' },
          { status: 500 }
        )
      }
    }

    // Get user profile
    let userProfile = null
    try {
      userProfile = await getUserProfile(userId)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }

    // Return API key and user info
    return NextResponse.json({
      api_key: apiKey,
      user_id: userId,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        display_name: userProfile?.display_name || authData.user.user_metadata?.display_name || authData.user.email,
        avatar_url: userProfile?.avatar_url || authData.user.user_metadata?.avatar_url,
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

    // Verify API key (using service client)
    let keyData = null
    try {
      const { data } = await createServiceClient()
        .from('api_keys')
        .select('user_id')
        .eq('key', apiKey)
        .eq('name', 'Extension')
        .single()
      
      keyData = data
    } catch (error) {
      return NextResponse.json(
        { valid: false, error: 'Invalid API key' },
        { status: 401 }
      )
    }

    if (!keyData) {
      return NextResponse.json(
        { valid: false, error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Update last_used_at
    await updateApiKeyLastUsed(apiKey)

    // Get user profile
    let userData = null
    try {
      userData = await getUserProfile(keyData.user_id)
    } catch (error) {
      console.error('Error fetching user:', error)
    }

    return NextResponse.json({
      valid: true,
      user_id: keyData.user_id,
      user: userData,
    })

  } catch (error) {
    console.error('API key verification error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
