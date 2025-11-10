import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/files?project_id=xxx - Get all files for a project
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project_id from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get files
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('path', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/files - Create or update file
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { project_id, path, content, mime_type } = body;

    if (!project_id || !path) {
      return NextResponse.json(
        { error: 'project_id and path are required' },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if file exists
    const { data: existingFile } = await supabase
      .from('files')
      .select('id')
      .eq('project_id', project_id)
      .eq('path', path)
      .single();

    let file;
    if (existingFile) {
      // Update existing file
      const { data, error } = await supabase
        .from('files')
        .update({
          content,
          size: content?.length || 0,
          mime_type
        })
        .eq('id', existingFile.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      file = data;
    } else {
      // Create new file
      const { data, error } = await supabase
        .from('files')
        .insert({
          project_id,
          path,
          content,
          size: content?.length || 0,
          mime_type
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      file = data;
    }

    return NextResponse.json({ file });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/files?id=xxx - Delete file
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get file_id from query params
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Verify user owns the file (through project)
    const { data: file } = await supabase
      .from('files')
      .select('id, project_id, projects(user_id)')
      .eq('id', fileId)
      .single();

    if (!file || (file.projects as any)?.user_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete file
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
