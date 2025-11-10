import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getErrorStats } from '@/lib/middleware/error-tracking';

export const dynamic = 'force-dynamic';

// GET /api/admin/errors - Get error logs and statistics
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('range') as '1h' | '24h' | '7d' | '30d') || '24h';

    // Get error statistics
    const stats = await getErrorStats(timeRange);

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
