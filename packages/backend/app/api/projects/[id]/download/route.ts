/**
 * API Route: Download Project as ZIP
 * GET /api/projects/[id]/download
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createProjectZip, uploadZipToStorage } from '@/lib/utils/zip-generator'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { createReadStream } from 'fs'

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    
    // Get user from session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get workflow/project details
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    
    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Get project files from database
    const { data: files, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('workflow_id', projectId)
    
    if (filesError) {
      return NextResponse.json(
        { error: 'Failed to fetch project files' },
        { status: 500 }
      )
    }
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files found for this project' },
        { status: 404 }
      )
    }
    
    // Create temporary directory for project
    const tempDir = join('/tmp', 'projects', projectId)
    await mkdir(tempDir, { recursive: true })
    
    // Write files to temp directory
    const { writeFile: writeFileAsync, mkdir: mkdirAsync } = await import('fs/promises')
    for (const file of files) {
      const filePath = join(tempDir, file.file_path)
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/'))
      
      // Create directory if needed
      await mkdir(fileDir, { recursive: true })
      
      // Write file content
      await writeFileAsync(filePath, file.content || '', 'utf-8')
    }
    
    // Create ZIP file
    const zipPath = join('/tmp', 'zips', `${projectId}.zip`)
    await mkdir(join('/tmp', 'zips'), { recursive: true })
    
    const zipResult = await createProjectZip({
      projectPath: tempDir,
      outputPath: zipPath,
      projectName: workflow.project_name || 'project',
      excludePatterns: []
    })
    
    if (!zipResult.success) {
      return NextResponse.json(
        { error: 'Failed to create ZIP file', details: zipResult.error },
        { status: 500 }
      )
    }
    
    // Option 1: Stream ZIP file directly
    const fileStream = createReadStream(zipPath)
    const chunks: Buffer[] = []
    
    for await (const chunk of fileStream) {
      chunks.push(chunk as Buffer)
    }
    
    const fileBuffer = Buffer.concat(chunks)
    
    // Return ZIP file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${workflow.project_name || 'project'}.zip"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('[Download API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Alternative: Upload to Supabase Storage and return URL
 * POST /api/projects/[id]/download
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    
    // Get user from session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get workflow/project details
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    
    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Get project files
    const { data: files, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('workflow_id', projectId)
    
    if (filesError || !files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files found' },
        { status: 404 }
      )
    }
    
    // Create temp directory and write files
    const tempDir = join('/tmp', 'projects', projectId)
    await mkdir(tempDir, { recursive: true })
    
    const { writeFile: writeFileAsync, mkdir: mkdirAsync } = await import('fs/promises')
    for (const file of files) {
      const filePath = join(tempDir, file.file_path)
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/'))
      await mkdir(fileDir, { recursive: true })
      await writeFileAsync(filePath, file.content || '', 'utf-8')
    }
    
    // Create ZIP
    const zipPath = join('/tmp', 'zips', `${projectId}.zip`)
    await mkdir(join('/tmp', 'zips'), { recursive: true })
    
    const zipResult = await createProjectZip({
      projectPath: tempDir,
      outputPath: zipPath,
      projectName: workflow.project_name || 'project'
    })
    
    if (!zipResult.success) {
      return NextResponse.json(
        { error: 'Failed to create ZIP', details: zipResult.error },
        { status: 500 }
      )
    }
    
    // Upload to Supabase Storage
    const uploadResult = await uploadZipToStorage(
      zipPath,
      projectId,
      user.id
    )
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Failed to upload ZIP', details: uploadResult.error },
        { status: 500 }
      )
    }
    
    // Update workflow with download URL
    await supabase
      .from('workflows')
      .update({ 
        download_url: uploadResult.url,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
    
    return NextResponse.json({
      success: true,
      downloadUrl: uploadResult.url,
      fileCount: files.length,
      size: zipResult.size
    })
    
  } catch (error) {
    console.error('[Download API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
