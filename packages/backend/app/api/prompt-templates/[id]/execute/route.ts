import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/prompt-templates/[id]/execute - Execute a prompt template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get prompt template
    const { data: template, error: templateError } = await supabase
      .from("prompt_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    // Get inputs from request
    const body = await request.json();
    const { inputs, provider, model } = body;

    // Validate inputs
    if (!inputs || typeof inputs !== "object") {
      return NextResponse.json(
        { error: "Invalid inputs" },
        { status: 400 }
      );
    }

    // Substitute variables in template
    let promptText = template.template;
    for (const [key, value] of Object.entries(inputs)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      promptText = promptText.replace(regex, String(value));
    }

    // Check if all variables are substituted
    const remainingVariables = promptText.match(/{{[^}]+}}/g);
    if (remainingVariables && remainingVariables.length > 0) {
      return NextResponse.json(
        { error: `Missing required variables: ${remainingVariables.join(", ")}` },
        { status: 400 }
      );
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from("executions")
      .insert({
        user_id: user.id,
        execution_type: "prompt",
        template_id: id,
        inputs,
        status: "running"
      })
      .select()
      .single();

    if (executionError) {
      console.error("Error creating execution:", executionError);
      return NextResponse.json(
        { error: "Failed to create execution" },
        { status: 500 }
      );
    }

    // Execute prompt via chat API
    const startTime = Date.now();
    
    try {
      const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("cookie") || ""
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: promptText
            }
          ],
          provider: provider || "openai",
          model: model || "gpt-4",
          stream: false
        })
      });

      if (!chatResponse.ok) {
        throw new Error(`Chat API returned ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      const executionTime = Date.now() - startTime;

      // Update execution with results
      await supabase
        .from("executions")
        .update({
          outputs: chatData,
          status: "completed",
          execution_time_ms: executionTime,
          completed_at: new Date().toISOString()
        })
        .eq("id", execution.id);

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "execute_prompt_template",
        resource_type: "prompt_template",
        resource_id: id,
        details: { 
          template_title: template.title,
          execution_time_ms: executionTime
        }
      });

      return NextResponse.json({
        execution_id: execution.id,
        result: chatData,
        execution_time_ms: executionTime
      });

    } catch (error) {
      console.error("Error executing prompt:", error);
      
      // Update execution with error
      await supabase
        .from("executions")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          completed_at: new Date().toISOString()
        })
        .eq("id", execution.id);

      return NextResponse.json(
        { error: "Failed to execute prompt" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
