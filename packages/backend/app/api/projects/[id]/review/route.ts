import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { reviewCode } from '@/lib/ai/code-reviewer';

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
    const { files, focusAreas } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Review code
    const result = await reviewCode({
      files,
      focusAreas,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Code review failed' },
        { status: 500 }
      );
    }

    // Save review results
    await supabase
      .from('code_reviews')
      .insert({
        workflow_id: params.id,
        user_id: user.id,
        issues: result.issues,
        summary: result.summary,
        overall_score: result.overallScore,
        recommendations: result.recommendations,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reviewing code:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
