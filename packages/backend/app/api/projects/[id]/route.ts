import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  if (!projectId) {
    return NextResponse.json({ error: "Project id is required" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: logs, error: logsError } = await supabase
    .from("agent_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (logsError) {
    return NextResponse.json({ error: "Failed to load agent logs" }, { status: 500 });
  }

  return NextResponse.json({ project, logs: logs ?? [] });
}
