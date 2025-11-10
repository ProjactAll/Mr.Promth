export interface Agent1Output {
  project_type: string;
  features: string[];
  pages: string[];
  tech_stack: {
    frontend: string;
    styling: string;
    database: string;
    payment?: string;
  };
  design_style: string;
  expanded_prompt: string;
}

export interface Agent2Output {
  database_schema: {
    tables: Array<{
      name: string;
      columns: string[];
    }>;
  };
  folder_structure: {
    app: string[];
    components: string[];
    lib: string[];
  };
  api_endpoints: string[];
  dependencies: Record<string, string>;
}

export interface AgentChainResultPayload {
  agent1_output: Agent1Output;
  agent2_output: Agent2Output;
  final_project: {
    code: Record<string, string>;
    database: string;
    deployment: Record<string, unknown>;
  } | null;
}

export interface AgentLogRecord {
  id: string;
  project_id: string;
  agent_number: number;
  agent_name: string;
  status: string;
  output: unknown;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
}

export interface ProjectRecord {
  id: string;
  user_id: string;
  name: string;
  user_prompt: string;
  status: string;
  current_agent: number | null;
  agent_outputs: unknown;
  final_output: AgentChainResultPayload | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
