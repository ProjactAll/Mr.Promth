import { createClient } from '@/lib/database'
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
    const { screenshot_id, analysis_type = 'quick', custom_prompt } = body

    if (!screenshot_id) {
      return NextResponse.json(
        { error: 'Screenshot ID is required' },
        { status: 400 }
      )
    }

    // Fetch screenshot and DOM data
    const { data: screenshotData, error: screenshotError } = await supabase
      .from('screenshots')
      .select('*, dom_snapshots(*)')
      .eq('id', screenshot_id)
      .eq('user_id', userId)
      .single()

    if (screenshotError || !screenshotData) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    // Build analysis prompt
    const domSnapshot = screenshotData.dom_snapshots?.[0]
    
    let prompt = custom_prompt || `Analyze this webpage and generate a production-ready clone.

URL: ${screenshotData.url}
Dimensions: ${screenshotData.width}x${screenshotData.height}

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
        }

        suggestions = [
          'Project structure designed',
          'Database schema created',
          'API endpoints defined',
          'Ready for code generation',
        ]

        confidenceScore = 0.85

      } else {
        // Quick analysis (Agent 1 only)
        const agent1Output = await executeAgent1(prompt)

        analysisResults = {
          agent1: agent1Output,
        }

        suggestions = [
          'Project type identified',
          'Features extracted',
          'Tech stack recommended',
          'Run full analysis for complete architecture',
        ]

        confidenceScore = 0.75
      }

    } catch (error) {
      console.error('AI analysis error:', error)
      return NextResponse.json(
        { error: 'AI analysis failed', details: (error as Error).message },
        { status: 500 }
      )
    }

    const processingTime = Date.now() - startTime

    // Save analysis results to database
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        screenshot_id: screenshot_id,
        agent_type: analysis_type,
        analysis_data: analysisResults,
        suggestions: suggestions,
        confidence_score: confidenceScore,
        processing_time: processingTime,
      })
      .select()
      .single()

    if (analysisError) {
      console.error('Error saving analysis results:', analysisError)
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
    console.error('Analysis endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/extension/analyze/:screenshot_id
 * 
 * Get analysis results for a screenshot
 * 
 * Headers:
 * X-API-Key: string
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

    // Get screenshot_id from query params
    const { searchParams } = new URL(request.url)
    const screenshotId = searchParams.get('screenshot_id')

    if (!screenshotId) {
      return NextResponse.json(
        { error: 'Screenshot ID is required' },
        { status: 400 }
      )
    }

    // Verify screenshot belongs to user
    const { data: screenshotData, error: screenshotError } = await supabase
      .from('screenshots')
      .select('id')
      .eq('id', screenshotId)
      .eq('user_id', userId)
      .single()

    if (screenshotError || !screenshotData) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    // Get all analysis results for this screenshot
    const { data: analyses, error: analysesError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('screenshot_id', screenshotId)
      .order('created_at', { ascending: false })

    if (analysesError) {
      console.error('Error fetching analyses:', analysesError)
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analyses: analyses || [],
    })

  } catch (error) {
    console.error('Get analyses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
