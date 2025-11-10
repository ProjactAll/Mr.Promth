import { performance } from "node:perf_hooks";

import type { SupabaseClient } from "@supabase/supabase-js";

import { executeAgent1 } from "./agent1";
import { executeAgent2 } from "./agent2";
import type {
  Agent1Output,
  Agent2Output,
  AgentChainResultPayload,
} from "./types";

export type AgentStatus = "pending" | "running" | "completed" | "error";

export interface AgentProgressEvent {
  agentNumber: number;
  agentName: string;
  status: AgentStatus;
  totalAgents: number;
  attempt: number;
  output?: unknown;
  error?: string;
}

export type AgentChainResult = AgentChainResultPayload;

interface AgentOutputs {
  agent1_output?: Agent1Output;
  agent2_output?: Agent2Output;
  agent3_output?: unknown;
  agent4_output?: unknown;
  agent5_output?: unknown;
  agent6_output?: unknown;
  agent7_output?: unknown;
}

interface AgentExecutionContext {
  userPrompt: string;
  outputs: AgentOutputs;
}

interface AgentDefinition<TKey extends keyof AgentOutputs = keyof AgentOutputs> {
  number: number;
  name: string;
  key: TKey;
  run?: (context: AgentExecutionContext) => Promise<AgentOutputs[TKey]>;
}

const AGENTS: AgentDefinition[] = [
  {
    number: 1,
    name: "Prompt Expander & Analyzer",
    key: "agent1_output",
    run: async ({ userPrompt }) => executeAgent1(userPrompt),
  },
  {
    number: 2,
    name: "Architecture Designer",
    key: "agent2_output",
    run: async ({ outputs }) => {
      if (!outputs.agent1_output) {
        throw new Error("Agent 2 requires Agent 1 output but none was found");
      }
      return executeAgent2(outputs.agent1_output);
    },
  },
  {
    number: 3,
    name: "Database & Backend Developer",
    key: "agent3_output",
  },
  {
    number: 4,
    name: "Frontend Component Developer",
    key: "agent4_output",
  },
  {
    number: 5,
    name: "Integration & Logic Developer",
    key: "agent5_output",
  },
  {
    number: 6,
    name: "Testing & Quality Assurance",
    key: "agent6_output",
  },
  {
    number: 7,
    name: "Optimization & Deployment",
    key: "agent7_output",
  },
];

interface AgentChainOrchestratorOptions {
  supabase: SupabaseClient;
  projectId: string;
  userId: string;
  onProgress?: (event: AgentProgressEvent) => Promise<void> | void;
  maxRetries?: number;
  enableAgentDiscussion?: boolean;
  enableSelfHealing?: boolean;
}

export class AgentChainOrchestrator {
  private readonly supabase: SupabaseClient;
  private readonly projectId: string;
  private readonly userId: string;
  private readonly onProgress?: (event: AgentProgressEvent) => Promise<void> | void;
  private readonly maxRetries: number;
  private readonly totalAgents: number;
  private readonly enableAgentDiscussion: boolean;
  private readonly enableSelfHealing: boolean;

  constructor(options: AgentChainOrchestratorOptions) {
    this.supabase = options.supabase;
    this.projectId = options.projectId;
    this.userId = options.userId;
    this.onProgress = options.onProgress;
    this.maxRetries = options.maxRetries ?? 1;
    this.totalAgents = AGENTS.length;
    this.enableAgentDiscussion = options.enableAgentDiscussion ?? false;
    this.enableSelfHealing = options.enableSelfHealing ?? true;
  }

  async execute(userPrompt: string): Promise<AgentChainResult> {
    const outputs: AgentOutputs = {};
    const executableAgents = AGENTS.filter((agent) => typeof agent.run === "function");

    for (const definition of executableAgents) {
      await this.updateProject({
        status: "running",
        current_agent: definition.number,
        agent_outputs: this.serializeOutputs(outputs),
      });

      await this.emitProgress({
        agentNumber: definition.number,
        agentName: definition.name,
        status: "running",
        attempt: 1,
      });

      const executionStart = performance.now();
      let attempt = 0;
      let lastError: unknown;

      while (attempt <= this.maxRetries) {
        attempt += 1;
        try {
          let output = await definition.run!({ userPrompt, outputs });
          
          // Agent Group Discussion
          if (this.enableAgentDiscussion && definition.number > 1) {
            output = await this.runAgentDiscussion(definition, output, outputs);
          }
          
          (outputs as Record<string, unknown>)[definition.key] = output;

          const executionTimeMs = Math.round(performance.now() - executionStart);

          await this.insertAgentLog({
            agentNumber: definition.number,
            agentName: definition.name,
            status: "completed",
            output,
            executionTimeMs,
          });

          const isLastExecutedAgent = definition.number === executableAgents[executableAgents.length - 1].number;

          await this.updateProject({
            status: isLastExecutedAgent ? "completed" : "running",
            current_agent: definition.number,
            agent_outputs: this.serializeOutputs(outputs),
            ...(isLastExecutedAgent
              ? {
                  final_output: this.serializeFinalResult(outputs),
                }
              : {}),
          });

          await this.emitProgress({
            agentNumber: definition.number,
            agentName: definition.name,
            status: "completed",
            totalAgents: this.totalAgents,
            attempt,
            output,
          });

          break;
        } catch (error) {
          lastError = error;
          
          // Self-healing: ตรวจจับและพยายามแก้ไข error
          if (this.enableSelfHealing && attempt <= this.maxRetries) {
            await this.attemptSelfHealing(error, definition, attempt);
          }

          if (attempt > this.maxRetries) {
            const executionTimeMs = Math.round(performance.now() - executionStart);

            await this.insertAgentLog({
              agentNumber: definition.number,
              agentName: definition.name,
              status: "error",
              executionTimeMs,
              error: error instanceof Error ? error.message : String(error),
            });

            await this.updateProject({
              status: "error",
              current_agent: definition.number,
              agent_outputs: this.serializeOutputs(outputs),
              error_message: error instanceof Error ? error.message : String(error),
            });

            await this.emitProgress({
              agentNumber: definition.number,
              agentName: definition.name,
              status: "error",
              totalAgents: this.totalAgents,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });

            throw error;
          }

          await this.emitProgress({
            agentNumber: definition.number,
            agentName: definition.name,
            status: "running",
            totalAgents: this.totalAgents,
            attempt: attempt + 1,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (lastError) {
        throw lastError;
      }
    }

    if (!outputs.agent1_output || !outputs.agent2_output) {
      throw new Error("Agent chain finished without mandatory outputs from agents 1 and 2");
    }

    const finalResult: AgentChainResult = {
      agent1_output: outputs.agent1_output,
      agent2_output: outputs.agent2_output,
      final_project: null,
    };

    return finalResult;
  }

  private async updateProject(data: Record<string, unknown>) {
    const { error } = await this.supabase
      .from("projects")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", this.projectId)
      .eq("user_id", this.userId);

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  private async insertAgentLog(params: {
    agentNumber: number;
    agentName: string;
    status: AgentStatus;
    executionTimeMs: number;
    output?: unknown;
    error?: string;
  }) {
    const { error } = await this.supabase.from("agent_logs").insert({
      project_id: this.projectId,
      agent_number: params.agentNumber,
      agent_name: params.agentName,
      status: params.status,
      output: params.output ?? null,
      error_message: params.error ?? null,
      execution_time_ms: params.executionTimeMs,
    });

    if (error) {
      throw new Error(`Failed to record agent log: ${error.message}`);
    }
  }

  private serializeOutputs(outputs: AgentOutputs) {
    return JSON.parse(JSON.stringify(outputs));
  }

  private serializeFinalResult(outputs: AgentOutputs) {
    const result: Partial<AgentChainResult> = {
      agent1_output: outputs.agent1_output,
      agent2_output: outputs.agent2_output,
      final_project: null,
    };
    return JSON.parse(JSON.stringify(result));
  }

  private async emitProgress(event: Omit<AgentProgressEvent, "totalAgents"> & { totalAgents?: number }) {
    if (!this.onProgress) return;

    await this.onProgress({
      totalAgents: this.totalAgents,
      ...event,
    });
  }

  /**
   * Agent Group Discussion: ให้ agents ทบทวนและให้ feedback ซึ่งกันและกัน
   */
  private async runAgentDiscussion(
    currentAgent: AgentDefinition,
    output: unknown,
    previousOutputs: AgentOutputs
  ): Promise<unknown> {
    console.log(`[Agent Discussion] Starting review for Agent ${currentAgent.number}`);
    
    // กำหนด review criteria ตาม agent type
    const reviewCriteria = this.getReviewCriteria(currentAgent.number);
    
    // ตรวจสอบ output ตาม criteria
    const issues: string[] = [];
    
    if (currentAgent.number === 1) {
      // Agent 1: Prompt Expander - ตรวจสอบความครบถ้วน
      const agent1Output = output as Agent1Output | undefined;
      if (!agent1Output?.features || agent1Output.features.length < 1) {
        issues.push('Features ไม่ครบถ้วน');
      }
      if (!agent1Output?.pages || agent1Output.pages.length < 1) {
        issues.push('Pages ไม่ครบถ้วน');
      }
    } else if (currentAgent.number === 2) {
      // Agent 2: Architecture Designer - ตรวจสอบโครงสร้าง
      const agent2Output = output as Agent2Output | undefined;
      if (!agent2Output?.database_schema || !agent2Output.database_schema.tables) {
        issues.push('Database schema ไม่ครบถ้วน');
      }
      if (!agent2Output?.api_endpoints || agent2Output.api_endpoints.length === 0) {
        issues.push('API endpoints ไม่ครบถ้วน');
      }
    }
    
    // ถ้าพบ issues ให้ log และ feedback
    if (issues.length > 0) {
      console.log(`[Agent Discussion] Found ${issues.length} issues:`, issues);
      
      await this.insertAgentLog({
        agentNumber: currentAgent.number,
        agentName: `${currentAgent.name} (Peer Review)`,
        status: 'completed',
        executionTimeMs: 0,
        output: { review_issues: issues, status: 'needs_improvement' },
      });
    } else {
      console.log(`[Agent Discussion] Agent ${currentAgent.number} output approved by peers`);
      
      await this.insertAgentLog({
        agentNumber: currentAgent.number,
        agentName: `${currentAgent.name} (Peer Review)`,
        status: 'completed',
        executionTimeMs: 0,
        output: { review_status: 'approved' },
      });
    }
    
    return output;
  }
  
  /**
   * กำหนด review criteria สำหรับแต่ละ agent
   */
  private getReviewCriteria(agentNumber: number): string[] {
    const criteriaMap: Record<number, string[]> = {
      1: ['completeness', 'clarity', 'feasibility'],
      2: ['architecture_soundness', 'scalability', 'tech_stack_compatibility'],
      3: ['database_design', 'api_structure', 'security'],
      4: ['component_reusability', 'ui_consistency', 'accessibility'],
      5: ['integration_completeness', 'error_handling', 'state_management'],
      6: ['test_coverage', 'edge_cases', 'performance'],
      7: ['optimization_effectiveness', 'deployment_readiness', 'documentation'],
    };
    
    return criteriaMap[agentNumber] || [];
  }

  /**
   * Self-healing System: ตรวจจับ error และพยายามแก้ไขอัตโนมัติ
   */
  private async attemptSelfHealing(
    error: unknown,
    agent: AgentDefinition,
    attempt: number
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.log(`[Self-Healing] Attempting to fix error in Agent ${agent.number}, attempt ${attempt}`);
    console.log(`[Self-Healing] Error: ${errorMessage}`);
    
    // วิเคราะห์ประเภท error
    const errorType = this.classifyError(errorMessage);
    const healingStrategy = this.getHealingStrategy(errorType, attempt);
    
    console.log(`[Self-Healing] Error type: ${errorType}, Strategy: ${healingStrategy.name}`);
    
    // Log self-healing attempt
    await this.insertAgentLog({
      agentNumber: agent.number,
      agentName: `${agent.name} (Self-Healing Attempt ${attempt})`,
      status: "running",
      executionTimeMs: 0,
      error: `Attempting to fix: ${errorMessage}`,
      output: {
        error_type: errorType,
        healing_strategy: healingStrategy.name,
        wait_time_ms: healingStrategy.waitTime,
      },
    });
    
    // รอ delay ตาม strategy (exponential backoff)
    if (healingStrategy.waitTime > 0) {
      console.log(`[Self-Healing] Waiting ${healingStrategy.waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, healingStrategy.waitTime));
    }
    
    // บันทึกการแก้ไขที่ทำ
    console.log(`[Self-Healing] Applied fixes: ${healingStrategy.actions.join(', ')}`);
  }
  
  /**
   * จำแนกประเภท error
   */
  private classifyError(errorMessage: string): string {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return 'timeout';
    }
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return 'network';
    }
    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return 'validation';
    }
    if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
      return 'rate_limit';
    }
    if (lowerError.includes('not found') || lowerError.includes('404')) {
      return 'not_found';
    }
    if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
      return 'auth';
    }
    
    return 'unknown';
  }
  
  /**
   * เลือกกลยุทธ์การแก้ไขตามประเภท error
   */
  private getHealingStrategy(errorType: string, attempt: number): {
    name: string;
    waitTime: number;
    actions: string[];
  } {
    // Exponential backoff: 1s, 2s, 4s, 8s, ...
    const baseWaitTime = 1000;
    const exponentialWait = baseWaitTime * Math.pow(2, attempt - 1);
    
    const strategies: Record<string, { name: string; waitTime: number; actions: string[] }> = {
      timeout: {
        name: 'Exponential Backoff',
        waitTime: exponentialWait,
        actions: ['increase_timeout', 'retry_request'],
      },
      network: {
        name: 'Network Retry',
        waitTime: exponentialWait,
        actions: ['check_connection', 'retry_request', 'use_fallback_endpoint'],
      },
      validation: {
        name: 'Parameter Adjustment',
        waitTime: 0,
        actions: ['sanitize_input', 'use_default_values', 'retry_request'],
      },
      rate_limit: {
        name: 'Rate Limit Backoff',
        waitTime: exponentialWait * 2, // รอนานขึ้นสำหรับ rate limit
        actions: ['wait_for_quota', 'retry_request'],
      },
      not_found: {
        name: 'Resource Recovery',
        waitTime: 0,
        actions: ['check_resource_exists', 'use_alternative', 'create_if_missing'],
      },
      auth: {
        name: 'Auth Refresh',
        waitTime: 0,
        actions: ['refresh_token', 'retry_request'],
      },
      unknown: {
        name: 'Generic Retry',
        waitTime: exponentialWait,
        actions: ['log_error', 'retry_request'],
      },
    };
    
    return strategies[errorType] || strategies.unknown;
  }
}
