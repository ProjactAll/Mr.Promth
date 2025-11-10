import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/github/connect - Connect GitHub account
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
    const { access_token, username } = body;

    if (!access_token || !username) {
      return NextResponse.json(
        { error: 'access_token and username are required' },
        { status: 400 }
      );
    }

    // Check if connection exists
    const { data: existing } = await supabase
      .from('github_connections')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let connection;
    if (existing) {
      // Update existing connection
      const { data, error } = await supabase
        .from('github_connections')
        .update({
          github_username: username,
          access_token
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      connection = data;
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from('github_connections')
        .insert({
          user_id: user.id,
          github_username: username,
          access_token
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      connection = data;
    }

    return NextResponse.json({ connection });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/github/repos - Get user's GitHub repositories
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Fetch repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: response.status }
      );
    }

    const repos = await response.json();

    return NextResponse.json({ repos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
