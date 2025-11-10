import { createLogger } from '@/lib/utils/logger'
import {
  getApiKeyByKey,
  getScreenshot,
  getDomSnapshot,
  createAnalysisResult,
  getAnalysisResults,
} from '@/lib/database'
import { NextResponse } from 'next/server'
import { executeAgent1 } from '@/lib/agents/agent1'
import { executeAgent2 } from '@/lib/agents/agent2'

/**
 * POST /api/extension/analyze
 * 
 * AI Analysis Endpoint
 * 
 * Headers:
 * X-API-Key: string
 * 
 * Request Body:
 * {
 *   screenshot_id: string
 *   analysis_type?: 'full' | 'quick' (default: 'quick')
 *   custom_prompt?: string
 * }
 * 
 * Response:
 * {
 *   analysis_id: string
 *   results: object
 *   suggestions: array
 *   confidence_score: number
 *   processing_time: number
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
    const { screenshot_id, analysis_type = 'quick', custom_prompt } = body

    if (!screenshot_id) {
      return NextResponse.json(
        { error: 'Screenshot ID is required' },
        { status: 400 }
      )
    }

    // Fetch screenshot
    let screenshotData = null
    try {
      screenshotData = await getScreenshot(screenshot_id)
    } catch (error) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    // Verify screenshot belongs to user
    if (screenshotData.user_id !== userId) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    // Fetch DOM snapshot
    let domSnapshot = null
    try {
      domSnapshot = await getDomSnapshot(screenshot_id)
    } catch (error) {
      logger.info('No DOM snapshot found for screenshot:', { data: screenshot_id })
    }

    // Build analysis prompt
    let prompt = custom_prompt || `Analyze this webpage and generate a production-ready clone.

URL: ${screenshotData.url}
Dimensions: ${screenshotData.metadata?.width || 'unknown'}x${screenshotData.metadata?.height || 'unknown'}

DOM Structure:
${JSON.stringify(domSnapshot?.dom_structure || {}, null, 2)}

Clickable Elements:
${JSON.stringify(domSnapshot?.clickable_elements || [], null, 2)}

Form Fields:
${JSON.stringify(domSnapshot?.form_fields || [], null, 2)}

Please provide:
1. Project type and features
2. Recommended tech stack
3. Component structure
4. API endpoints needed
5. Database schema
`

    const startTime = Date.now()

    // Run AI analysis
    let analysisResults: any = {}
    let suggestions: any[] = []
    let confidenceScore = 0

    try {
      if (analysis_type === 'full') {
        // Run full agent chain (Agent 1 + 2)
        const agent1Output = await executeAgent1(prompt)
        const agent2Output = await executeAgent2(agent1Output)

        analysisResults = {
          agent1: agent1Output,
          agent2: agent2Output,
          analysis_type: 'full',
          screenshot_url: screenshotData.url,
        }

        suggestions = [
          'Project structure designed',
          'Database schema created',
          'API endpoints defined',
          'Component architecture planned',
          'Ready for code generation (Agent 3-7)',
        ]

        confidenceScore = 0.85

      } else {
        // Quick analysis (Agent 1 only)
        const agent1Output = await executeAgent1(prompt)

        analysisResults = {
          agent1: agent1Output,
          analysis_type: 'quick',
          screenshot_url: screenshotData.url,
        }

        suggestions = [
          'Project type identified',
          'Features extracted',
          'Tech stack recommended',
          'Basic structure outlined',
          'Run full analysis for complete architecture',
        ]

        confidenceScore = 0.75
      }

    } catch (error) {
      logger.error('AI analysis error:', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'AI analysis failed', details: (error as Error).message },
        { status: 500 }
      )
    }

    const processingTime = Date.now() - startTime

    // Save analysis results to database
    let analysisData = null
    try {
      analysisData = await createAnalysisResult(
        screenshot_id,
        analysis_type,
        analysisResults,
        suggestions,
        confidenceScore,
        processingTime
      )
    } catch (error) {
      logger.error('Error saving analysis results:', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Failed to save analysis results' },
        { status: 500 }
      )
    }

    // Return analysis results
    return NextResponse.json({
      analysis_id: analysisData.id,
      results: analysisResults,
      suggestions: suggestions,
      confidence_score: confidenceScore,
      processing_time: processingTime,
    })

  } catch (error) {
    logger.error('Analysis endpoint error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/extension/analyze
 * 
 * Get analysis results for a screenshot
 * 
 * Headers:
 * X-API-Key: string
 * 
 * Query Parameters:
 * screenshot_id: string
 * 
 * Response:
 * {
 *   analyses: array
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

    // Get screenshot_id from query params
    const { searchParams } = new URL(request.url)
    const screenshotId = searchParams.get('screenshot_id')

    if (!screenshotId) {
      return NextResponse.json(
        { error: 'Screenshot ID is required' },
        { status: 400 }
      )
    }

    // Fetch screenshot and verify ownership
    let screenshotData = null
    try {
      screenshotData = await getScreenshot(screenshotId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    if (screenshotData.user_id !== userId) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    // Get all analysis results for this screenshot
    let analyses = []
    try {
      analyses = await getAnalysisResults(screenshotId)
    } catch (error) {
      logger.error('Error fetching analyses:', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analyses: analyses || [],
    })

  } catch (error) {
    logger.error('Get analyses error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
