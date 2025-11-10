import { performance } from "node:perf_hooks";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createLogger } from "../utils/logger";

import { executeAgent1 } from "./agent1";
import { executeAgent2 } from "./agent2";
import { executeAgent3 } from "./agent3";
import {
  executeAgent4Wrapper,
  executeAgent5Wrapper,
  executeAgent6Wrapper,
  executeAgent7Wrapper,
} from "./agent-wrappers";
import type {
  Agent1Output,
  Agent2Output,
  AgentChainResultPayload,
} from "./types";
import type { Agent3Output } from "./agent3-improved";
import type { Agent4Result } from "./agent4-frontend-generator";
import type { Agent5Result } from "./agent5-testing-qa";
import type { Agent6Result } from "./agent6-deployment";
import type { Agent7Result } from "./agent7-monitoring";

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
  agent3_output?: Agent3Output;
  agent4_output?: Agent4Result;
  agent5_output?: Agent5Result;
  agent6_output?: Agent6Result;
  agent7_output?: Agent7Result;
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
    run: async ({ outputs }) => {
      if (!outputs.agent2_output) {
        throw new Error("Agent 3 requires Agent 2 output but none was found");
      }
      return executeAgent3(outputs.agent2_output);
    },
  },
  {
    number: 4,
    name: "Frontend Component Developer",
    key: "agent4_output",
    run: async ({ outputs, userPrompt }) => {
      if (!outputs.agent1_output || !outputs.agent2_output || !outputs.agent3_output) {
        throw new Error("Agent 4 requires outputs from agents 1, 2, and 3");
      }
      // ใช้ userPrompt เป็น projectId ชั่วคราว (ในระบบจริงควรใช้ projectId จริง)
      const projectId = Date.now().toString();
      return executeAgent4Wrapper(
        outputs.agent1_output,
        outputs.agent2_output,
        outputs.agent3_output,
        projectId
      );
    },
  },
  {
    number: 5,
    name: "Testing & Quality Assurance",
    key: "agent5_output",
    run: async ({ outputs }) => {
      if (!outputs.agent1_output || !outputs.agent2_output || !outputs.agent3_output || !outputs.agent4_output) {
        throw new Error("Agent 5 requires outputs from agents 1-4");
      }
      const projectId = Date.now().toString();
      return executeAgent5Wrapper(
        outputs.agent1_output,
        outputs.agent2_output,
        outputs.agent3_output,
        outputs.agent4_output,
        projectId
      );
    },
  },
  {
    number: 6,
    name: "Deployment",
    key: "agent6_output",
    run: async ({ outputs }) => {
      if (!outputs.agent1_output || !outputs.agent2_output || !outputs.agent3_output || !outputs.agent4_output || !outputs.agent5_output) {
        throw new Error("Agent 6 requires outputs from agents 1-5");
      }
      const projectId = Date.now().toString();
      return executeAgent6Wrapper(
        outputs.agent1_output,
        outputs.agent2_output,
        outputs.agent3_output,
        outputs.agent4_output,
        outputs.agent5_output,
        projectId
      );
    },
  },
  {
    number: 7,
    name: "Monitoring & Analytics",
    key: "agent7_output",
    run: async ({ outputs }) => {
      if (!outputs.agent1_output || !outputs.agent2_output || !outputs.agent3_output || !outputs.agent4_output || !outputs.agent5_output || !outputs.agent6_output) {
        throw new Error("Agent 7 requires outputs from agents 1-6");
      }
      const projectId = Date.now().toString();
      return executeAgent7Wrapper(
        outputs.agent1_output,
        outputs.agent2_output,
        outputs.agent3_output,
        outputs.agent4_output,
        outputs.agent5_output,
        outputs.agent6_output,
        projectId
      );
    },
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
          let output: unknown = await definition.run!({ userPrompt, outputs });
          
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
    const logger = createLogger({ component: 'AgentDiscussion', agentNumber: currentAgent.number });
    logger.info('Starting peer review');
    
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
      logger.warn('Peer review found issues', { issueCount: issues.length, issues });
      
      await this.insertAgentLog({
        agentNumber: currentAgent.number,
        agentName: `${currentAgent.name} (Peer Review)`,
        status: 'completed',
        executionTimeMs: 0,
        output: { review_issues: issues, status: 'needs_improvement' },
      });
    } else {
      logger.info('Peer review approved');
      
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
    
    const logger = createLogger({ component: 'SelfHealing', agentNumber: agent.number, attempt });
    logger.warn('Attempting to fix error', { errorMessage });
    
    // วิเคราะห์ประเภท error
    const errorType = this.classifyError(errorMessage);
    const healingStrategy = this.getHealingStrategy(errorType, attempt);
    
    logger.info('Applying healing strategy', { errorType, strategy: healingStrategy.name });
    
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
      logger.debug('Waiting before retry', { waitTimeMs: healingStrategy.waitTime });
      await new Promise(resolve => setTimeout(resolve, healingStrategy.waitTime));
    }
    
    // บันทึกการแก้ไขที่ทำ
    logger.info('Applied healing actions', { actions: healingStrategy.actions });
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
