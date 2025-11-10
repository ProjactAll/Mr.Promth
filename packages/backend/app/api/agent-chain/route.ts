import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { AgentChainOrchestrator } from "@/lib/agents/orchestrator";
import { createServiceRoleSupabaseClient } from "@/lib/database";

export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const projectName = prompt.length > 80 ? `${prompt.slice(0, 77)}...` : prompt;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: projectName,
      user_prompt: prompt,
      status: "pending",
      agent_outputs: {},
    })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  runAgentChainInBackground({ projectId: project.id, prompt, userId: user.id }).catch((error) => {
    console.error("Agent chain execution failed:", error);
  });

  return NextResponse.json({ project_id: project.id, status: "pending" });
}

async function runAgentChainInBackground({
  projectId,
  prompt,
  userId,
}: {
  projectId: string;
  prompt: string;
  userId: string;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const orchestrator = new AgentChainOrchestrator({
    supabase,
    projectId,
    userId,
  });

  try {
    await orchestrator.execute(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown agent chain error";
    await supabase
      .from("projects")
      .update({
        status: "error",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", userId);
  }
}
