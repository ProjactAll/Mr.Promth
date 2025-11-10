import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GitHubClient } from '@/lib/github/github-client';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { githubToken, owner, repo, files, message } = body;

    if (!githubToken || !owner || !repo || !files || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create GitHub client
    const github = new GitHubClient({
      token: githubToken,
      owner,
      repo,
    });

    // Commit files
    const result = await github.createCommit({
      message,
      files: files.map((f: any) => ({
        path: f.path.startsWith('/') ? f.path.slice(1) : f.path,
        content: f.content,
      })),
    });

    // Update workflow record
    await supabase
      .from('workflows')
      .update({
        github_repo: `${owner}/${repo}`,
        github_commit_sha: result.sha,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      commitSha: result.sha,
      commitUrl: result.html_url,
    });
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
