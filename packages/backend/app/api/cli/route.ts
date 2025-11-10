import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * CLI API - สำหรับ mrpromth CLI tool
 */

// POST /api/cli - สร้างโปรเจกต์ใหม่
export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, options = {} } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Use "mrpromth login" to authenticate.' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ตรวจสอบ API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .single();

    if (apiKeyError || !apiKeyData || !apiKeyData.is_active) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }

    const userId = apiKeyData.user_id;

    // สร้างโปรเจกต์ใหม่
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: options.name || `CLI Project ${Date.now()}`,
        description: prompt,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError?.message },
        { status: 500 }
      );
    }

    // เริ่ม agent chain (async)
    // ในการ implement จริง จะเรียก agent chain orchestrator
    // ตอนนี้ return project ID ให้ CLI poll status

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        created_at: project.created_at,
      },
      message: 'Project created successfully. Use "mrpromth status <project-id>" to check progress.',
    });
  } catch (error) {
    console.error('CLI create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/cli?action=status&project_id=xxx - ตรวจสอบสถานะโปรเจกต์
// GET /api/cli?action=list - แสดงรายการโปรเจกต์
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const projectId = searchParams.get('project_id');
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ตรวจสอบ API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .single();

    if (apiKeyError || !apiKeyData || !apiKeyData.is_active) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }

    const userId = apiKeyData.user_id;

    // Action: status
    if (action === 'status') {
      if (!projectId) {
        return NextResponse.json(
          { error: 'project_id is required for status action' },
          { status: 400 }
        );
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // ดึง agent logs
      const { data: logs } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      return NextResponse.json({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          current_agent: project.current_agent,
          created_at: project.created_at,
          updated_at: project.updated_at,
          error_message: project.error_message,
        },
        logs: logs || [],
        progress: project.current_agent ? Math.round((project.current_agent / 7) * 100) : 0,
      });
    }

    // Action: list
    if (action === 'list') {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (projectsError) {
        return NextResponse.json(
          { error: 'Failed to fetch projects', details: projectsError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        projects: projects || [],
        total: projects?.length || 0,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "status" or "list".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('CLI get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
