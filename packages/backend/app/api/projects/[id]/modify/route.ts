import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { analyzeModification, applyModifications } from '@/lib/ai/project-modifier';

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
    const { instruction, currentFiles } = body;

    if (!instruction) {
      return NextResponse.json(
        { error: 'Missing instruction' },
        { status: 400 }
      );
    }

    // Analyze modification request
    const result = await analyzeModification({
      projectId: params.id,
      userId: user.id,
      instruction,
      currentFiles: currentFiles || [],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.summary },
        { status: 500 }
      );
    }

    // Apply modifications
    const applyResult = await applyModifications(params.id, result.modifications);

    if (!applyResult.success) {
      return NextResponse.json(
        { error: applyResult.message },
        { status: 500 }
      );
    }

    // Update workflow record
    await supabase
      .from('workflows')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      modifications: result.modifications,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Error modifying project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
