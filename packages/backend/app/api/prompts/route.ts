import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";

export const dynamic = 'force-dynamic';


const promptInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parseResult = promptInputSchema.safeParse(json);

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  const payload = parseResult.data;

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      user_id: session.user.id,
      title: payload.title,
      description: payload.description ?? null,
      content: payload.content,
      tags: payload.tags ?? [],
      is_public: payload.is_public ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
