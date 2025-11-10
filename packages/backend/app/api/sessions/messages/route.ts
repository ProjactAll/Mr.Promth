import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { saveMessage, getMessages } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { session_id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await getMessages(params.session_id);
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const message = await saveMessage(body.session_id, body.role, body.content, body.provider_message_id);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Save message error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}