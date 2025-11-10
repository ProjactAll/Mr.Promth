import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";

export const dynamic = 'force-dynamic';


const promptUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
});

async function getAuthorizedContext() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError) {
    return {
      errorResponse: NextResponse.json({ error: authError.message }, { status: 500 }),
    } as const;
  }

  if (!session) {
    return {
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  return { supabase, sessionUserId: session.user.id } as const;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const context = await getAuthorizedContext();
  if ("errorResponse" in context) {
    return context.errorResponse;
  }

  const { supabase, sessionUserId } = context;

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", sessionUserId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getAuthorizedContext();
  if ("errorResponse" in context) {
    return context.errorResponse;
  }

  const { supabase, sessionUserId } = context;
  const payload = await request.json();
  const parseResult = promptUpdateSchema.safeParse(payload);

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  const updates = parseResult.data;

  const { data, error } = await supabase
    .from("prompts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("user_id", sessionUserId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const context = await getAuthorizedContext();
  if ("errorResponse" in context) {
    return context.errorResponse;
  }

  const { supabase, sessionUserId } = context;

  const { error } = await supabase
    .from("prompts")
    .delete()
    .eq("id", params.id)
    .eq("user_id", sessionUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
