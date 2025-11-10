import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface AgentStep {
  id: string;
  type: "prompt" | "tool" | "condition" | "loop";
  name: string;
  config: any;
  next?: string | { condition: string; true: string; false: string };
}

// POST /api/agents/[id]/execute - Execute an agent
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

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Get inputs from request
    const body = await request.json();
    const { inputs } = body;

    // Validate inputs against schema
    // TODO: Add JSON Schema validation

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from("executions")
      .insert({
        user_id: user.id,
        execution_type: "agent",
        agent_id: id,
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

    // Execute agent steps
    const startTime = Date.now();
    const stepResults: any[] = [];
    let context = { ...inputs };

    try {
      const steps: AgentStep[] = agent.steps;
      
      for (const step of steps) {
        const stepStartTime = Date.now();
        
        let stepResult: any;
        
        switch (step.type) {
          case "prompt":
            stepResult = await executePromptStep(step, context, request);
            break;
          case "tool":
            stepResult = await executeToolStep(step, context);
            break;
          case "condition":
            stepResult = await executeConditionStep(step, context);
            break;
          case "loop":
            stepResult = await executeLoopStep(step, context, request);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        const stepExecutionTime = Date.now() - stepStartTime;
        
        stepResults.push({
          step_id: step.id,
          step_name: step.name,
          step_type: step.type,
          result: stepResult,
          execution_time_ms: stepExecutionTime
        });

        // Update context with step result
        context = {
          ...context,
          [step.id]: stepResult
        };
      }

      const executionTime = Date.now() - startTime;

      // Update execution with results
      await supabase
        .from("executions")
        .update({
          outputs: {
            steps: stepResults,
            final_result: context
          },
          status: "completed",
          execution_time_ms: executionTime,
          completed_at: new Date().toISOString()
        })
        .eq("id", execution.id);

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "execute_agent",
        resource_type: "agent",
        resource_id: id,
        details: { 
          agent_name: agent.name,
          execution_time_ms: executionTime,
          steps_count: steps.length
        }
      });

      return NextResponse.json({
        execution_id: execution.id,
        steps: stepResults,
        result: context,
        execution_time_ms: executionTime
      });

    } catch (error) {
      console.error("Error executing agent:", error);
      
      // Update execution with error
      await supabase
        .from("executions")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          outputs: { steps: stepResults },
          completed_at: new Date().toISOString()
        })
        .eq("id", execution.id);

      return NextResponse.json(
        { 
          error: "Failed to execute agent",
          details: error instanceof Error ? error.message : "Unknown error",
          completed_steps: stepResults
        },
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

// Helper function to execute prompt step
async function executePromptStep(step: AgentStep, context: any, request: NextRequest) {
  const { prompt_template, variables } = step.config;
  
  // Substitute variables in prompt
  let promptText = prompt_template;
  for (const [key, value] of Object.entries(variables || {})) {
    const contextValue = getNestedValue(context, String(value));
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    promptText = promptText.replace(regex, String(contextValue));
  }

  // Call chat API
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
      provider: step.config.provider || "openai",
      model: step.config.model || "gpt-4",
      stream: false
    })
  });

  if (!chatResponse.ok) {
    throw new Error(`Chat API returned ${chatResponse.status}`);
  }

  const chatData = await chatResponse.json();
  return chatData.message || chatData;
}

// Helper function to execute tool step
async function executeToolStep(step: AgentStep, context: any) {
  const { tool_name, parameters } = step.config;
  
  // Resolve parameters from context
  const resolvedParams: any = {};
  for (const [key, value] of Object.entries(parameters || {})) {
    resolvedParams[key] = getNestedValue(context, String(value));
  }

  // Execute tool based on tool_name
  switch (tool_name) {
    case "web_search":
      return await executeWebSearch(resolvedParams);
    case "code_execution":
      return await executeCode(resolvedParams);
    case "file_processing":
      return await processFile(resolvedParams);
    default:
      throw new Error(`Unknown tool: ${tool_name}`);
  }
}

// Helper function to execute condition step
async function executeConditionStep(step: AgentStep, context: any) {
  const { condition } = step.config;
  
  // Evaluate condition
  // TODO: Implement safe condition evaluation
  const result = evaluateCondition(condition, context);
  
  return { condition_met: result };
}

// Helper function to execute loop step
async function executeLoopStep(step: AgentStep, context: any, request: NextRequest) {
  const { iterations, sub_steps } = step.config;
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const loopContext = { ...context, iteration: i };
    
    for (const subStep of sub_steps) {
      const subResult = await executePromptStep(subStep, loopContext, request);
      results.push(subResult);
    }
  }
  
  return results;
}

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function evaluateCondition(condition: string, context: any): boolean {
  // Simple condition evaluation
  // TODO: Implement more robust and safe evaluation
  try {
    const func = new Function('context', `with(context) { return ${condition}; }`);
    return func(context);
  } catch (error) {
    console.error("Error evaluating condition:", error);
    return false;
  }
}

async function executeWebSearch(params: any) {
  // TODO: Implement web search
  return { results: [] };
}

async function executeCode(params: any) {
  // TODO: Implement code execution
  return { output: "" };
}

async function processFile(params: any) {
  // TODO: Implement file processing
  return { processed: true };
}
