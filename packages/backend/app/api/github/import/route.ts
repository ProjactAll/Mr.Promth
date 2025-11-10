import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { GitHubIntegration } from '@/lib/github-integration';

export const dynamic = 'force-dynamic';

// POST /api/github/import - Import files from GitHub repository
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
    const { repo, project_id, path = '' } = body;

    if (!repo || !project_id) {
      return NextResponse.json(
        { error: 'repo and project_id are required' },
        { status: 400 }
      );
    }

    // Get GitHub connection
    const { data: connection } = await supabase
      .from('github_connections')
      .select('access_token, github_username')
      .eq('user_id', user.id)
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 404 }
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

    // Parse repo (format: owner/repo)
    const [owner, repoName] = repo.split('/');
    
    // Create GitHub integration
    const github = new GitHubIntegration(
      connection.access_token,
      owner || connection.github_username,
      repoName
    );

    // Import files from GitHub
    const files = await github.importFiles(path);

    // Save files to database
    const savedFiles = [];
    for (const file of files) {
      const { data, error } = await supabase
        .from('files')
        .insert({
          project_id,
          path: file.path,
          content: file.content,
          size: file.content.length,
          mime_type: getMimeType(file.path)
        })
        .select()
        .single();

      if (error) {
        console.error(`Error saving file ${file.path}:`, error);
        continue;
      }

      savedFiles.push(data);
    }

    // Update project with GitHub repo
    await supabase
      .from('projects')
      .update({ github_repo: repo })
      .eq('id', project_id);

    // Log import
    await supabase.from('logs').insert({
      project_id,
      level: 'info',
      message: `Imported ${savedFiles.length} files from GitHub repo ${repo}`,
      metadata: { repo, files_count: savedFiles.length }
    });

    return NextResponse.json({ 
      success: true,
      files: savedFiles,
      count: savedFiles.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'js': 'application/javascript',
    'jsx': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'json': 'application/json',
    'html': 'text/html',
    'css': 'text/css',
    'md': 'text/markdown',
    'txt': 'text/plain',
  };
  return mimeTypes[ext || ''] || 'text/plain';
}
