import { createLogger } from '@/lib/utils/logger'
import {
  createServiceClient,
  getApiKeyByKey,
  createExtensionSession,
  createScreenshot,
  createDomSnapshot,
  getUserScreenshots,
  getSessionScreenshots,
} from '@/lib/database'

import { NextResponse } from 'next/server'

const logger = createLogger({ module: 'capture-route' });

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

    // Get user ID from API key
    let keyData = null
    try {
      keyData = await getApiKeyByKey(apiKey)
    } catch (error) {
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

    // Validate screenshot is a data URL
    if (!screenshot.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Screenshot must be a data URL' },
        { status: 400 }
      )
    }

    // Create or get session
    let sessionId = session_id

    if (!sessionId) {
      // Create new session
      try {
        const sessionData = await createExtensionSession(userId, {
          browser: metadata?.browser || 'Unknown',
          initial_url: url,
        })
        sessionId = sessionData.id
      } catch (error) {
        logger.error('Error creating session:', error instanceof Error ? error : new Error(String(error)))
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        )
      }
    }

    // Convert data URL to blob
    const base64Data = screenshot.split(',')[1]
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid screenshot data' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(base64Data, 'base64')

    // Generate storage path
    const timestamp = Date.now()
    const storagePath = `${userId}/${sessionId}/${timestamp}.png`

    // Upload to Supabase Storage
    const supabase = createServiceClient()
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('screenshots')
      .upload(storagePath, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      logger.error('Error uploading screenshot:', uploadError instanceof Error ? uploadError : new Error(String(uploadError)))
      return NextResponse.json(
        { error: 'Failed to upload screenshot' },
        { status: 500 }
      )
    }

    // Get public URL (or signed URL for private bucket)
    const { data: urlData } = supabase
      .storage
      .from('screenshots')
      .getPublicUrl(storagePath)

    // Save screenshot metadata to database
    let screenshotData = null
    try {
      screenshotData = await createScreenshot(
        userId,
        sessionId,
        url,
        storagePath, // Use storage path, not URL
        {
          width: metadata?.width,
          height: metadata?.height,
          browser: metadata?.browser,
          ...metadata,
        }
      )
    } catch (error) {
      logger.error('Error saving screenshot metadata:', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Failed to save screenshot metadata' },
        { status: 500 }
      )
    }

    const screenshotId = screenshotData.id

    // Save DOM snapshot if provided
    if (dom || clickable) {
      try {
        await createDomSnapshot(
          screenshotId,
          dom || {},
          clickable || [],
          metadata?.forms || []
        )
      } catch (error) {
        logger.error('Error saving DOM snapshot:', error instanceof Error ? error : new Error(String(error)))
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
    logger.error('Screenshot capture error:', error instanceof Error ? error : new Error(String(error)))
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

    // Get user ID from API key
    let keyData = null
    try {
      keyData = await getApiKeyByKey(apiKey)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    const userId = keyData.user_id

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const sessionId = searchParams.get('session_id')

    // Get screenshots
    let screenshots = []
    try {
      if (sessionId) {
        screenshots = await getSessionScreenshots(sessionId)
      } else {
        screenshots = await getUserScreenshots(userId, limit)
      }
    } catch (error) {
      logger.error('Error fetching screenshots:', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Failed to fetch screenshots' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      screenshots: screenshots || [],
      total: screenshots?.length || 0,
    })

  } catch (error) {
    logger.error('Get screenshots error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
