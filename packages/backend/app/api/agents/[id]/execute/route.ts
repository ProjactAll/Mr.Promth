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

async function executeWebSearch(params: any): Promise<{ results: any[] }> {
  try {
    const query = params.query || params.q || '';
    if (!query) {
      return { results: [] };
    }

    // ใช้ DuckDuckGo API (ไม่ต้อง API key)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    
    if (!response.ok) {
      console.error('Web search failed:', response.statusText);
      return { results: [] };
    }

    const data = await response.json();
    
    // แปลง DuckDuckGo results เป็น format ที่ใช้งานง่าย
    const results = [
      ...(data.RelatedTopics || []).slice(0, 5).map((topic: any) => ({
        title: topic.Text || '',
        url: topic.FirstURL || '',
        snippet: topic.Text || ''
      }))
    ].filter(r => r.title && r.url);

    return { results };
  } catch (error) {
    console.error('Error in web search:', error);
    return { results: [] };
  }
}

async function executeCode(params: any): Promise<{ output: string; error?: string }> {
  try {
    const code = params.code || '';
    const language = params.language || 'javascript';
    
    if (!code) {
      return { output: '', error: 'No code provided' };
    }

    // รองรับเฉพาะ JavaScript/TypeScript เท่านั้น
    if (language === 'javascript' || language === 'typescript') {
      // สร้าง sandbox ด้วย VM2 หรือ isolated-vm
      // สำหรับ demo ใช้ Function constructor แบบจำกัด
      
      // จำกัด dangerous operations
      const dangerousPatterns = [
        /require\s*\(/,
        /import\s+/,
        /eval\s*\(/,
        /Function\s*\(/,
        /process\./,
        /child_process/,
        /fs\./,
        /__dirname/,
        /__filename/,
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          return { 
            output: '', 
            error: `Security: Code contains dangerous pattern: ${pattern}` 
          };
        }
      }
      
      // Execute ใน limited context
      const sandbox = {
        console: {
          log: (...args: any[]) => args.join(' '),
        },
        Math,
        Date,
        JSON,
      };
      
      const func = new Function(...Object.keys(sandbox), `
        'use strict';
        let output = [];
        const originalLog = console.log;
        console.log = (...args) => output.push(args.join(' '));
        try {
          ${code}
        } catch (e) {
          output.push('Error: ' + e.message);
        }
        return output.join('\\n');
      `);
      
      const output = func(...Object.values(sandbox));
      return { output: String(output) };
    }
    
    // สำหรับภาษาอื่นๆ ให้ return error
    return { 
      output: '', 
      error: `Language '${language}' is not supported yet. Only JavaScript is supported.` 
    };
    
  } catch (error) {
    return { 
      output: '', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

async function processFile(params: any): Promise<{ processed: boolean; result?: any; error?: string }> {
  try {
    const { action, filePath, content, data } = params;
    
    if (!action) {
      return { processed: false, error: 'No action specified' };
    }

    switch (action) {
      case 'read':
        // อ่านไฟล์จาก storage หรือ database
        if (!filePath) {
          return { processed: false, error: 'File path required for read action' };
        }
        // TODO: Implement actual file reading from Supabase Storage
        return { 
          processed: true, 
          result: { content: 'File content here', path: filePath } 
        };
        
      case 'write':
        // เขียนไฟล์ไป storage
        if (!filePath || !content) {
          return { processed: false, error: 'File path and content required for write action' };
        }
        // TODO: Implement actual file writing to Supabase Storage
        return { 
          processed: true, 
          result: { path: filePath, size: content.length } 
        };
        
      case 'parse':
        // Parse ไฟล์ (JSON, CSV, etc.)
        if (!content && !data) {
          return { processed: false, error: 'Content or data required for parse action' };
        }
        
        const contentToParse = content || data;
        const fileType = params.type || 'json';
        
        if (fileType === 'json') {
          try {
            const parsed = JSON.parse(contentToParse);
            return { processed: true, result: parsed };
          } catch (e) {
            return { processed: false, error: 'Invalid JSON format' };
          }
        } else if (fileType === 'csv') {
          // Simple CSV parsing
          const lines = contentToParse.split('\n');
          const headers = lines[0].split(',');
          const rows = lines.slice(1).map((line: string) => {
            const values = line.split(',');
            return headers.reduce((obj: any, header: string, index: number) => {
              obj[header.trim()] = values[index]?.trim();
              return obj;
            }, {});
          });
          return { processed: true, result: rows };
        }
        
        return { processed: false, error: `Unsupported file type: ${fileType}` };
        
      case 'delete':
        // ลบไฟล์
        if (!filePath) {
          return { processed: false, error: 'File path required for delete action' };
        }
        // TODO: Implement actual file deletion from Supabase Storage
        return { processed: true, result: { deleted: filePath } };
        
      default:
        return { processed: false, error: `Unknown action: ${action}` };
    }
  } catch (error) {
    return { 
      processed: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
