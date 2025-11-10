# 🛠️ Mr.Promth Implementation Guide

## 📋 สารบัญ

1. [ภาพรวมการ Implement](#ภาพรวมการ-implement)
2. [VanchinAI Integration](#vanchinai-integration)
3. [Agent Implementation Details](#agent-implementation-details)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Deployment](#deployment)

---

## 1. ภาพรวมการ Implement

### Project Structure:

```
mrphomth/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                 # Main dashboard
│   ├── api/
│   │   ├── agent-chain/
│   │   │   └── route.ts             # Agent chain orchestrator endpoint
│   │   ├── projects/
│   │   │   └── route.ts             # Project CRUD
│   │   └── vanchin/
│   │       └── route.ts             # VanchinAI proxy
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── AgentChainProgress.tsx       # Agent chain progress UI
│   ├── PromptInput.tsx              # User prompt input
│   ├── ProjectOutput.tsx            # Display generated project
│   └── ui/                          # Reusable UI components
├── lib/
│   ├── agents/
│   │   ├── Agent1.ts                # Prompt Expander
│   │   ├── Agent2.ts                # Architecture Designer
│   │   ├── Agent3.ts                # Database & Backend Developer
│   │   ├── Agent4.ts                # Frontend Component Developer
│   │   ├── Agent5.ts                # Integration & Logic Developer
│   │   ├── Agent6.ts                # Testing & QA
│   │   ├── Agent7.ts                # Optimization & Deployment
│   │   └── orchestrator.ts          # Agent Chain Orchestrator
│   ├── vanchin.ts                   # VanchinAI client
│   ├── database.ts                  # Supabase client
│   └── utils.ts
├── database/
│   └── migrations/
│       └── 001_mrphomth_schema.sql
└── public/
    └── logo.svg                     # Mr.Promth logo
```

---

## 2. VanchinAI Integration

### 2.1 VanchinAI Client

สร้างไฟล์ `lib/vanchin.ts`:

```typescript
import { OpenAI } from 'openai';

// VanchinAI configuration
const VANCHIN_BASE_URL = "https://vanchin.streamlake.ai/api/gateway/v1/endpoints";

// Agent endpoint IDs (14 agents)
export const AGENT_ENDPOINTS = {
  agent1: "ep-lpvcnv-1761467347624133479",
  agent2: "ep-j9pysc-1761467653839114083",
  agent3: "ep-2uyob4-1761467835762653881",
  agent4: "ep-nqjal5-1762460264139958733",
  agent5: "ep-mhsvw6-1762460362477023705",
  agent6: "ep-h614n9-1762460436283699679",
  agent7: "ep-ohxawl-1762460514611065743",
  // ... more agents
};

// Agent API keys (จะดึงจาก database)
export async function getAgentApiKey(agentId: string): Promise<string> {
  // TODO: Implement database query to get encrypted API key
  // TODO: Decrypt API key
  // For now, return from env
  return process.env[`VANCHIN_AGENT_${agentId.toUpperCase()}_KEY`] || "";
}

// VanchinAI client factory
export function createVanchinClient(apiKey: string) {
  return new OpenAI({
    baseURL: VANCHIN_BASE_URL,
    apiKey: apiKey,
  });
}

// Call VanchinAI agent
export async function callAgent(
  agentId: string,
  prompt: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }
): Promise<string> {
  const apiKey = await getAgentApiKey(agentId);
  const client = createVanchinClient(apiKey);
  const endpointId = AGENT_ENDPOINTS[agentId as keyof typeof AGENT_ENDPOINTS];

  const completion = await client.chat.completions.create({
    model: endpointId,
    messages: [
      {
        role: "system",
        content: "You are a world-class software developer. Always respond with valid JSON when requested.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: options?.temperature || 0.7,
    max_tokens: options?.max_tokens || 4000,
    stream: options?.stream || false,
  });

  return completion.choices[0].message.content || "";
}

// Parse JSON response from agent
export function parseAgentResponse<T>(response: string): T {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`Failed to parse agent response: ${error}`);
  }
}
```

### 2.2 Environment Variables

สร้างไฟล์ `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# VanchinAI Agent Keys
VANCHIN_AGENT_AGENT1_KEY=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VANCHIN_AGENT_AGENT2_KEY=3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk
VANCHIN_AGENT_AGENT3_KEY=npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50
VANCHIN_AGENT_AGENT4_KEY=l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU
VANCHIN_AGENT_AGENT5_KEY=Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8
VANCHIN_AGENT_AGENT6_KEY=vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg
VANCHIN_AGENT_AGENT7_KEY=pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k
```

---

## 3. Agent Implementation Details

### 3.1 Agent 1: Prompt Expander

สร้างไฟล์ `lib/agents/Agent1.ts`:

```typescript
import { callAgent, parseAgentResponse } from '../vanchin';

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

export async function executeAgent1(userPrompt: string): Promise<Agent1Output> {
  const prompt = `
You are a world-class software architect. Your task is to expand a simple user prompt into a detailed project specification for a web application. The output must be a JSON object.

User Prompt: "${userPrompt}"

Generate a JSON object with the following structure:
{
  "project_type": "<project_type>",
  "features": ["<feature_1>", "<feature_2>", ...],
  "pages": ["<page_1>", "<page_2>", ...],
  "tech_stack": {
    "frontend": "Next.js 14",
    "styling": "Tailwind CSS",
    "database": "Supabase",
    "payment": "<payment_provider_if_needed>"
  },
  "design_style": "<design_style>",
  "expanded_prompt": "<detailed_project_description>"
}

Rules:
- Be specific and detailed
- Include all necessary features for the project type
- List all pages that should be created
- Use modern, production-ready technologies
- The expanded_prompt should be a comprehensive description of the project

Respond with ONLY the JSON object, no additional text.
  `.trim();

  const response = await callAgent('agent1', prompt, {
    temperature: 0.8,
    max_tokens: 2000,
  });

  return parseAgentResponse<Agent1Output>(response);
}
```

### 3.2 Agent 2: Architecture Designer

สร้างไฟล์ `lib/agents/Agent2.ts`:

```typescript
import { callAgent, parseAgentResponse } from '../vanchin';
import { Agent1Output } from './Agent1';

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

export async function executeAgent2(agent1Output: Agent1Output): Promise<Agent2Output> {
  const prompt = `
You are a senior software engineer. Based on the following project specification, design the system architecture. The output must be a JSON object.

Project Specification:
${JSON.stringify(agent1Output, null, 2)}

Generate a JSON object with the following structure:
{
  "database_schema": {
    "tables": [
      {
        "name": "<table_name>",
        "columns": ["<column_1>", "<column_2>", ...]
      }
    ]
  },
  "folder_structure": {
    "app": ["<folder_1>", "<folder_2>", ...],
    "components": ["<component_1>", "<component_2>", ...],
    "lib": ["<lib_1>", "<lib_2>", ...]
  },
  "api_endpoints": ["<endpoint_1>", "<endpoint_2>", ...],
  "dependencies": {
    "<dependency_1>": "<version>",
    "<dependency_2>": "<version>",
    ...
  }
}

Rules:
- Design a scalable and maintainable architecture
- Include all necessary database tables with proper columns
- Organize folders logically
- Define clear API endpoints
- Use latest stable versions of dependencies

Respond with ONLY the JSON object, no additional text.
  `.trim();

  const response = await callAgent('agent2', prompt, {
    temperature: 0.7,
    max_tokens: 2500,
  });

  return parseAgentResponse<Agent2Output>(response);
}
```

### 3.3 Agent Chain Orchestrator

สร้างไฟล์ `lib/agents/orchestrator.ts`:

```typescript
import { executeAgent1, Agent1Output } from './Agent1';
import { executeAgent2, Agent2Output } from './Agent2';
// ... import other agents

export interface AgentChainProgress {
  current_agent: number;
  total_agents: number;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: any;
  error?: string;
}

export type ProgressCallback = (progress: AgentChainProgress) => void;

export interface AgentChainResult {
  agent1_output: Agent1Output;
  agent2_output: Agent2Output;
  // ... other agent outputs
  final_project: {
    code: Record<string, string>;
    database: string;
    deployment: any;
  };
}

export class AgentChainOrchestrator {
  private onProgress?: ProgressCallback;

  constructor(onProgress?: ProgressCallback) {
    this.onProgress = onProgress;
  }

  private reportProgress(progress: AgentChainProgress) {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }

  async execute(userPrompt: string): Promise<AgentChainResult> {
    const result: Partial<AgentChainResult> = {};

    try {
      // Agent 1: Prompt Expander
      this.reportProgress({
        current_agent: 1,
        total_agents: 7,
        agent_name: 'Prompt Expander & Analyzer',
        status: 'running',
      });

      const agent1Output = await executeAgent1(userPrompt);
      result.agent1_output = agent1Output;

      this.reportProgress({
        current_agent: 1,
        total_agents: 7,
        agent_name: 'Prompt Expander & Analyzer',
        status: 'completed',
        output: agent1Output,
      });

      // Agent 2: Architecture Designer
      this.reportProgress({
        current_agent: 2,
        total_agents: 7,
        agent_name: 'Architecture Designer',
        status: 'running',
      });

      const agent2Output = await executeAgent2(agent1Output);
      result.agent2_output = agent2Output;

      this.reportProgress({
        current_agent: 2,
        total_agents: 7,
        agent_name: 'Architecture Designer',
        status: 'completed',
        output: agent2Output,
      });

      // TODO: Implement agents 3-7

      // Compile final project
      result.final_project = {
        code: {}, // TODO: Collect all generated code
        database: '', // TODO: Collect SQL migrations
        deployment: {}, // TODO: Deployment config
      };

      return result as AgentChainResult;
    } catch (error) {
      this.reportProgress({
        current_agent: 0,
        total_agents: 7,
        agent_name: 'Error',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}
```

---

## 4. Database Schema

### 4.1 Projects Table

```sql
-- Projects created by users
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, error
  current_agent INTEGER DEFAULT 1,
  agent_outputs JSONB DEFAULT '{}'::jsonb,
  final_output JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### 4.2 Agent Logs Table

```sql
-- Logs for each agent execution
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_number INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL, -- running, completed, error
  input JSONB,
  output JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_agent_logs_project_id ON agent_logs(project_id);

-- RLS policies
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their projects"
  ON agent_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = agent_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );
```

---

## 5. API Endpoints

### 5.1 Agent Chain Endpoint

สร้างไฟล์ `app/api/agent-chain/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AgentChainOrchestrator } from '@/lib/agents/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user prompt from request
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    // Create project record
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: prompt.substring(0, 100), // Use first 100 chars as name
        user_prompt: prompt,
        status: 'running',
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Execute agent chain (in background)
    executeAgentChainInBackground(project.id, prompt, supabase);

    // Return project ID immediately
    return NextResponse.json({
      project_id: project.id,
      status: 'running',
      message: 'Agent chain started',
    });
  } catch (error) {
    console.error('Agent chain error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function executeAgentChainInBackground(
  projectId: string,
  prompt: string,
  supabase: any
) {
  const orchestrator = new AgentChainOrchestrator(async (progress) => {
    // Update project status in database
    await supabase
      .from('projects')
      .update({
        status: progress.status,
        current_agent: progress.current_agent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    // Log agent execution
    if (progress.status === 'completed' || progress.status === 'error') {
      await supabase.from('agent_logs').insert({
        project_id: projectId,
        agent_number: progress.current_agent,
        agent_name: progress.agent_name,
        status: progress.status,
        output: progress.output,
        error_message: progress.error,
      });
    }
  });

  try {
    const result = await orchestrator.execute(prompt);

    // Update project with final result
    await supabase
      .from('projects')
      .update({
        status: 'completed',
        final_output: result,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
  } catch (error) {
    // Update project with error
    await supabase
      .from('projects')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
  }
}
```

### 5.2 Project Status Endpoint

สร้างไฟล์ `app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get agent logs
    const { data: logs } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      project,
      logs: logs || [],
    });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 6. Frontend Components

### 6.1 Dashboard Page

สร้างไฟล์ `app/dashboard/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { AgentChainProgress } from '@/components/AgentChainProgress';
import { ProjectOutput } from '@/components/ProjectOutput';

export default function DashboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/agent-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setProjectId(data.project_id);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Mr.Promth</h1>
          <p className="text-gray-600 text-lg">From Prompt to Production</p>
        </div>

        <PromptInput onGenerate={handleGenerate} isLoading={isGenerating} />

        {projectId && (
          <>
            <AgentChainProgress projectId={projectId} />
            <ProjectOutput projectId={projectId} />
          </>
        )}
      </div>
    </div>
  );
}
```

### 6.2 Prompt Input Component

สร้างไฟล์ `components/PromptInput.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from './ui/button';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
          What would you like to build?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., สร้างเว็บ e-commerce ขายเสื้อผ้า มี cart และ payment"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="mt-4 w-full"
        >
          {isLoading ? 'Generating...' : 'Generate Website'}
        </Button>
      </div>
    </form>
  );
}
```

### 6.3 Agent Chain Progress Component

สร้างไฟล์ `components/AgentChainProgress.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface AgentChainProgressProps {
  projectId: string;
}

interface AgentLog {
  agent_number: number;
  agent_name: string;
  status: string;
}

const AGENTS = [
  'Prompt Expander & Analyzer',
  'Architecture Designer',
  'Database & Backend Developer',
  'Frontend Component Developer',
  'Integration & Logic Developer',
  'Testing & QA',
  'Optimization & Deployment',
];

export function AgentChainProgress({ projectId }: AgentChainProgressProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [currentAgent, setCurrentAgent] = useState(1);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (data.project) {
        setCurrentAgent(data.project.current_agent);
      }

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.project.status === 'completed' || data.project.status === 'error') {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Agent Chain Progress</h2>
      <div className="space-y-4">
        {AGENTS.map((agentName, index) => {
          const agentNumber = index + 1;
          const log = logs.find((l) => l.agent_number === agentNumber);
          const isCompleted = log?.status === 'completed';
          const isRunning = currentAgent === agentNumber;

          return (
            <div key={agentNumber} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : isRunning ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
              <div className="flex-1">
                <div className="font-medium">{agentName}</div>
                {isRunning && (
                  <div className="text-sm text-blue-500">Running...</div>
                )}
                {isCompleted && (
                  <div className="text-sm text-green-500">Completed</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 7. Deployment

### 7.1 Vercel Deployment

1. Push โค้ดขึ้น GitHub
2. เชื่อม GitHub repository กับ Vercel
3. ตั้งค่า environment variables ใน Vercel dashboard
4. Deploy

### 7.2 Environment Variables (Production)

ใน Vercel dashboard, เพิ่ม environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VANCHIN_AGENT_AGENT1_KEY=...
VANCHIN_AGENT_AGENT2_KEY=...
... (all agent keys)
```

---

**Implementation Guide Version:** 1.0  
**Last Updated:** 7 พฤศจิกายน 2025
