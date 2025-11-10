import { createClient } from '@/lib/database'
import { NextResponse } from 'next/server'

/**
 * POST /api/extension/capture
 * 
 * Screenshot Capture Endpoint
 * 
 * Headers:
 * X-API-Key: string
 * 
 * Request Body:
 * {
 *   screenshot: string (data URL)
 *   url: string
 *   dom: object
 *   clickable: array
 *   session_id?: string
 *   metadata?: object
 * }
 * 
 * Response:
 * {
 *   screenshot_id: string
 *   storage_url: string
 *   session_id: string
 * }
 */
export async function POST(request: Request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Get user ID from API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    const userId = keyData.user_id

    // Parse request body
    const body = await request.json()
    const { screenshot, url, dom, clickable, session_id, metadata } = body

    if (!screenshot || !url) {
      return NextResponse.json(
        { error: 'Screenshot and URL are required' },
        { status: 400 }
      )
    }

    // Create or get session
    let sessionId = session_id

    if (!sessionId) {
      // Create new session
      const { data: sessionData, error: sessionError } = await supabase
        .from('extension_sessions')
        .insert({
          user_id: userId,
          browser_info: metadata?.browser || {},
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        )
      }

      sessionId = sessionData.id
    }

    // Convert data URL to blob
    const base64Data = screenshot.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate storage path
    const timestamp = Date.now()
    const storagePath = `${userId}/${sessionId}/${timestamp}.png`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('screenshots')
      .upload(storagePath, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading screenshot:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload screenshot' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('screenshots')
      .getPublicUrl(storagePath)

    // Save screenshot metadata to database
    const { data: screenshotData, error: screenshotError } = await supabase
      .from('screenshots')
      .insert({
        user_id: userId,
        session_id: sessionId,
        url: url,
        storage_path: storagePath,
        width: metadata?.width,
        height: metadata?.height,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (screenshotError) {
      console.error('Error saving screenshot metadata:', screenshotError)
      return NextResponse.json(
        { error: 'Failed to save screenshot metadata' },
        { status: 500 }
      )
    }

    const screenshotId = screenshotData.id

    // Save DOM snapshot if provided
    if (dom || clickable) {
      const { error: domError } = await supabase
        .from('dom_snapshots')
        .insert({
          screenshot_id: screenshotId,
          dom_structure: dom || {},
          clickable_elements: clickable || [],
          form_fields: metadata?.forms || [],
        })

      if (domError) {
        console.error('Error saving DOM snapshot:', domError)
        // Don't fail the request, just log the error
      }
    }

    // Return success response
    return NextResponse.json({
      screenshot_id: screenshotId,
      storage_url: urlData.publicUrl,
      session_id: sessionId,
    })

  } catch (error) {
    console.error('Screenshot capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/extension/capture
 * 
 * Get user's screenshots
 * 
 * Headers:
 * X-API-Key: string
 * 
 * Query Parameters:
 * limit?: number (default: 10)
 * offset?: number (default: 0)
 * session_id?: string
 * 
 * Response:
 * {
 *   screenshots: array
 *   total: number
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Get user ID from API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    const userId = keyData.user_id

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sessionId = searchParams.get('session_id')

    // Build query
    let query = supabase
      .from('screenshots')
      .select('*, dom_snapshots(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching screenshots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch screenshots' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      screenshots: data || [],
      total: count || 0,
    })

  } catch (error) {
    console.error('Get screenshots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
