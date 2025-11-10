# 🔧 Mr.Promth - Technical Specifications

**Version:** 2.0  
**Date:** 7 พฤศจิกายน 2025  
**Purpose:** Complete technical specifications for the Mr.Promth system

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [CLI Tool Specifications](#cli-tool-specifications)
7. [Agent Specifications](#agent-specifications)
8. [Security](#security)
9. [Performance Requirements](#performance-requirements)
10. [Deployment](#deployment)

---

## 1. System Overview

### 1.1 Purpose

Mr.Promth is an AI-powered development platform designed to automate the creation of production-ready websites from a single user prompt. The system operates through a chain of specialized AI agents that execute commands directly within the user's local terminal environment.

### 1.2 Key Characteristics

The system is characterized by three fundamental principles:

**Local-First Architecture:** Unlike traditional cloud-based code generation tools, Mr.Promth operates primarily within the user's local development environment. This approach provides users with complete control over their codebase and eliminates the constraints of sandboxed environments.

**Tool-Using Agents:** The AI agents do not simply generate large blocks of code. Instead, they utilize a well-defined set of tools to incrementally build projects, mirroring the workflow of human developers. This approach ensures better quality control and allows for real-time feedback.

**Realistic Time Estimates:** The system provides honest time estimates based on project complexity and available tokens. A typical website takes between 2 to 6 hours to complete, depending on the scope and token allocation.

### 1.3 Target Use Cases

The system is optimized for creating the following types of websites:

-   Personal blogs
-   Portfolio websites
-   E-commerce platforms
-   Landing pages
-   Corporate websites
-   Dashboard applications

---

## 2. Architecture

### 2.1 Three-Tier Architecture

The system follows a three-tier architecture consisting of the Frontend (Web UI), Backend (Orchestrator), and Agent Runner (Local CLI).

**Frontend (Web UI):**
-   Technology: Next.js 14, React, TypeScript, Tailwind CSS
-   Deployment: Vercel
-   Purpose: User interface for project management and real-time monitoring

**Backend (Orchestrator):**
-   Technology: Next.js API Routes, Supabase
-   Deployment: Vercel (API Routes) + Supabase (Database & Auth)
-   Purpose: Agent chain orchestration, user management, and real-time communication

**Agent Runner (Local CLI):**
-   Technology: Go, Rust, or Node.js
-   Distribution: Cross-platform binary (macOS, Windows, Linux)
-   Purpose: Execute commands on user's local machine

### 2.2 Communication Flow

The communication between components follows a specific pattern:

1.  User submits a prompt via the Web UI
2.  Frontend sends the prompt to the Backend via HTTP POST
3.  Backend runs Agent 1 and Agent 2 (cloud-based reasoning)
4.  Backend translates subsequent agent plans into tool commands
5.  Backend sends commands to the CLI via WebSocket/gRPC
6.  CLI executes commands and streams results back to Backend
7.  Backend updates the database and streams progress to Frontend
8.  Frontend displays real-time progress to the user

### 2.3 Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Submit Prompt
       ▼
┌─────────────────────────┐
│   Frontend (Web UI)     │
│   - Next.js 14          │
│   - React + TypeScript  │
└──────┬──────────────────┘
       │
       │ 2. HTTP POST /api/projects
       ▼
┌─────────────────────────────────┐
│   Backend (Orchestrator)        │
│   - Agent Chain Logic           │
│   - WebSocket Server            │
│   - Supabase Integration        │
└──────┬──────────────────────────┘
       │
       │ 3. Send Tool Commands via WebSocket
       ▼
┌─────────────────────────────────┐
│   Agent Runner (mr-promth-cli)  │
│   - Command Execution Loop      │
│   - File System Operations      │
│   - Shell Command Execution     │
└─────────────────────────────────┘
```

---

## 3. Components

### 3.1 Frontend Components

#### 3.1.1 Authentication Pages

**Login Page** (`app/login/page.tsx`):
-   Supabase Auth integration
-   Email/password authentication
-   OAuth providers (Google, GitHub)

**Signup Page** (`app/signup/page.tsx`):
-   User registration
-   Email verification

#### 3.1.2 Dashboard

**Project Dashboard** (`app/dashboard/page.tsx`):
-   List of all user projects
-   Project status indicators
-   Quick actions (view, delete, restart)

**Project Detail Page** (`app/projects/[id]/page.tsx`):
-   Real-time terminal output viewer
-   Agent progress timeline
-   File browser
-   Code viewer

#### 3.1.3 Prompt Interface

**Prompt Input Component** (`components/PromptInput.tsx`):
-   Multi-line text input
-   Template selector
-   Token estimate display

#### 3.1.4 Real-Time Viewers

**Terminal Viewer** (`components/TerminalViewer.tsx`):
-   Displays `stdout` and `stderr` from the CLI
-   Auto-scrolling
-   ANSI color support

**Agent Timeline** (`components/AgentTimeline.tsx`):
-   Visual representation of agent progress
-   Status indicators (pending, running, completed, error)
-   Execution time display

### 3.2 Backend Components

#### 3.2.1 API Routes

**`POST /api/projects`**:
-   Creates a new project
-   Starts the agent chain
-   Returns project ID

**`GET /api/projects/[id]`**:
-   Retrieves project details
-   Returns agent logs

**`WebSocket /api/ws`**:
-   Bidirectional communication with CLI
-   Sends tool commands
-   Receives execution results

#### 3.2.2 Agent Chain Orchestrator

**Location:** `lib/orchestrator.ts`

**Responsibilities:**
-   Manages the execution of the 7-agent chain
-   Translates agent plans into tool commands
-   Handles errors and retries
-   Updates database with progress

**Key Functions:**
-   `executeAgentChain(prompt: string, projectId: string): Promise<void>`
-   `sendCommandToCLI(command: Command): Promise<CommandResult>`
-   `handleCLIResponse(response: CommandResult): void`

### 3.3 CLI Tool (`mr-promth-cli`)

#### 3.3.1 Commands

**`mr-promth-cli login`**:
-   Authenticates user with Supabase
-   Saves auth token locally

**`mr-promth-cli connect`**:
-   Establishes WebSocket connection to backend
-   Starts command execution loop

**`mr-promth-cli logout`**:
-   Removes local auth token

#### 3.3.2 Command Execution Loop

**Pseudocode:**
```
while (connected) {
  command = receiveCommandFromBackend()
  
  if (command.tool_name == "writeFile") {
    result = writeFile(command.parameters.path, command.parameters.content)
  } else if (command.tool_name == "runCommand") {
    result = runCommand(command.parameters.command)
  }
  
  sendResultToBackend(result)
}
```

#### 3.3.3 Security Sandbox

The CLI must implement a permission system:

-   **Allowed by default:** Operations within the project directory
-   **Requires permission:** Operations outside the project directory
-   **Blocked by default:** Destructive commands (`rm -rf /`, `sudo`, etc.)

---

## 4. Database Schema

### 4.1 Tables

#### 4.1.1 `users`

Managed by Supabase Auth. No custom schema required.

#### 4.1.2 `projects`

```sql
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
  deployment_url TEXT,
  estimated_time_hours NUMERIC(4,2), -- e.g., 2.5 hours
  actual_time_hours NUMERIC(4,2),
  token_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

#### 4.1.3 `agent_logs`

```sql
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_number INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL, -- running, completed, error
  input JSONB,
  output JSONB,
  tool_commands JSONB, -- Array of tool commands sent to CLI
  error_message TEXT,
  execution_time_ms INTEGER,
  token_usage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_project_id ON agent_logs(project_id);
```

#### 4.1.4 `cli_sessions`

```sql
CREATE TABLE cli_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  machine_id TEXT, -- Unique identifier for the user's machine
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'connected' -- connected, disconnected
);

CREATE INDEX idx_cli_sessions_user_id ON cli_sessions(user_id);
CREATE INDEX idx_cli_sessions_session_token ON cli_sessions(session_token);
```

### 4.2 Row Level Security (RLS)

All tables must have RLS enabled with the following policies:

**`projects` table:**
```sql
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

Similar policies apply to `agent_logs` and `cli_sessions`.

---

## 5. API Specifications

### 5.1 REST API

#### 5.1.1 `POST /api/projects`

**Description:** Creates a new project and starts the agent chain.

**Request:**
```json
{
  "prompt": "Create a personal blog with a clean design"
}
```

**Response:**
```json
{
  "project_id": "uuid-v4",
  "status": "running",
  "estimated_time_hours": 2.5
}
```

#### 5.1.2 `GET /api/projects/[id]`

**Description:** Retrieves project details and agent logs.

**Response:**
```json
{
  "project": {
    "id": "uuid-v4",
    "name": "Personal Blog",
    "status": "running",
    "current_agent": 3,
    "deployment_url": null,
    "created_at": "2025-11-07T00:00:00Z"
  },
  "logs": [
    {
      "agent_number": 1,
      "agent_name": "Prompt Expander",
      "status": "completed",
      "execution_time_ms": 2300
    }
  ]
}
```

### 5.2 WebSocket API

#### 5.2.1 Connection

**URL:** `wss://api.mrpromth.com/ws`

**Authentication:** JWT token in the `Authorization` header.

#### 5.2.2 Message Format (Backend → CLI)

```json
{
  "type": "command",
  "command_id": "uuid-v4",
  "tool_name": "writeFile",
  "parameters": {
    "path": "./src/index.js",
    "content": "console.log('Hello');"
  }
}
```

#### 5.2.3 Message Format (CLI → Backend)

```json
{
  "type": "result",
  "command_id": "uuid-v4",
  "success": true,
  "output": {
    "stdout": "File written successfully",
    "stderr": "",
    "exit_code": 0
  }
}
```

---

## 6. CLI Tool Specifications

### 6.1 Technology

**Preferred:** Go or Rust (for single-binary distribution and performance).

**Alternative:** Node.js (easier development, requires Node.js runtime on user's machine).

### 6.2 Installation

**macOS/Linux:**
```bash
curl -fsSL https://install.mrpromth.com | sh
```

**Windows:**
```powershell
iwr https://install.mrpromth.com/windows | iex
```

### 6.3 Configuration

**Config File:** `~/.mrpromth/config.json`

```json
{
  "auth_token": "jwt-token",
  "api_url": "wss://api.mrpromth.com/ws",
  "project_directory": "./mrpromth-projects"
}
```

### 6.4 Tool Implementations

#### 6.4.1 `writeFile`

```go
func writeFile(path string, content string) error {
    // Validate path is within project directory
    if !isWithinProjectDir(path) {
        return errors.New("Permission denied: path outside project directory")
    }
    
    return ioutil.WriteFile(path, []byte(content), 0644)
}
```

#### 6.4.2 `runCommand`

```go
func runCommand(command string, timeout int) (*CommandResult, error) {
    ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
    defer cancel()
    
    cmd := exec.CommandContext(ctx, "sh", "-c", command)
    
    stdout, _ := cmd.StdoutPipe()
    stderr, _ := cmd.StderrPipe()
    
    cmd.Start()
    
    // Stream stdout and stderr back to backend
    go streamOutput(stdout, "stdout")
    go streamOutput(stderr, "stderr")
    
    err := cmd.Wait()
    
    return &CommandResult{
        ExitCode: cmd.ProcessState.ExitCode(),
    }, err
}
```

---

## 7. Agent Specifications

### 7.1 Agent Chain

The system uses a 7-agent chain. Each agent has a specific role and produces a specific output.

#### Agent 1: Prompt Expander & Analyzer

**Input:** User prompt (string)

**Output:**
```json
{
  "project_type": "blog",
  "features": ["posts", "about", "contact"],
  "pages": ["home", "about", "contact", "post/[slug]"],
  "tech_stack": {
    "frontend": "Next.js 14",
    "styling": "Tailwind CSS",
    "database": "Supabase",
    "cms": "Markdown files"
  },
  "design_style": "clean, minimalist",
  "expanded_prompt": "Create a personal blog website..."
}
```

#### Agent 2: Architecture Designer

**Input:** Agent 1 output

**Output:**
```json
{
  "database_schema": {
    "tables": [...]
  },
  "folder_structure": {
    "app": ["api", "blog", "about"],
    "components": ["Header", "Footer", "PostCard"],
    "lib": ["database", "utils"]
  },
  "api_endpoints": ["GET /api/posts", "GET /api/posts/[slug]"],
  "dependencies": {
    "next": "14.x",
    "@supabase/supabase-js": "latest"
  }
}
```

#### Agent 3-7: Implementation Agents

These agents do not output code directly. Instead, they output a sequence of tool commands.

**Example Output from Agent 3 (Backend Developer):**
```json
{
  "commands": [
    {
      "tool_name": "writeFile",
      "parameters": {
        "path": "./package.json",
        "content": "{ \"name\": \"my-blog\", ... }"
      }
    },
    {
      "tool_name": "runCommand",
      "parameters": {
        "command": "npm install",
        "timeout": 300
      }
    },
    {
      "tool_name": "writeFile",
      "parameters": {
        "path": "./lib/database.ts",
        "content": "import { createClient } from '@supabase/supabase-js'; ..."
      }
    }
  ]
}
```

### 7.2 VanchinAI Integration

All agents use VanchinAI as the LLM provider.

**Configuration:**
-   Base URL: `https://vanchin.streamlake.ai/api/gateway/v1/endpoints`
-   14 Agent Endpoints available (see `VANCHIN_SETUP_GUIDE.md`)
-   Load balancing: Round-robin across available agents
-   Failover: Retry with a different agent on failure

**Prompt Template for Agents:**
```
You are Agent {N}: {Agent Name}.

Your task: {Task Description}

Input:
{Input JSON}

Output:
You must respond with ONLY a valid JSON object. Do not include any other text.

{Output Schema}
```

---

## 8. Security

### 8.1 Authentication

**User Authentication:** Supabase Auth (JWT tokens).

**CLI Authentication:** JWT token stored in `~/.mrpromth/config.json`. Token is sent in the `Authorization` header for WebSocket connections.

### 8.2 Authorization

**Project Access:** RLS policies ensure users can only access their own projects.

**CLI Permissions:** The CLI must implement a permission system to prevent unauthorized file system access.

### 8.3 Secure Communication

**WebSocket:** Use WSS (WebSocket Secure) for all CLI-Backend communication.

**API:** Use HTTPS for all REST API calls.

### 8.4 Sandboxing

The CLI must operate with the principle of least privilege:

-   **Default:** All operations are restricted to the project directory.
-   **User Prompt:** Operations outside the project directory require explicit user permission.
-   **Blocked:** Destructive commands (e.g., `rm -rf /`, `sudo rm`) are blocked by default.

---

## 9. Performance Requirements

### 9.1 Time Estimates

**Realistic Time Estimates:**
-   Simple website (blog, portfolio): 2-3 hours
-   Medium complexity (e-commerce): 4-5 hours
-   Complex website (custom features): 5-6 hours

**Factors Affecting Time:**
-   Project complexity
-   Token allocation
-   VanchinAI API response time
-   User's internet connection speed

### 9.2 Scalability

**Concurrent Projects:**
-   The system should support at least 100 concurrent projects.
-   Each project runs independently.

**Database:**
-   Supabase can scale to millions of records.
-   Indexes are in place for efficient queries.

### 9.3 Reliability

**Uptime Target:** 99.9%

**Error Handling:**
-   Automatic retry (3 attempts) for transient errors.
-   Failover to backup VanchinAI agents.
-   Graceful degradation if CLI disconnects.

---

## 10. Deployment

### 10.1 Frontend & Backend

**Platform:** Vercel

**Configuration:**
-   Next.js 14 (App Router)
-   Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, VanchinAI API keys.

**Deployment:**
```bash
vercel --prod
```

### 10.2 CLI Tool

**Distribution:**
-   Binary releases for macOS, Windows, Linux.
-   Hosted on GitHub Releases or a dedicated CDN.

**Installation Script:**
-   `https://install.mrpromth.com` (shell script for Unix, PowerShell script for Windows).

### 10.3 Database

**Platform:** Supabase (managed PostgreSQL)

**Migrations:**
-   Use Supabase CLI to manage migrations.
-   Migrations are stored in `database/migrations/`.

**Deployment:**
```bash
supabase db push
```

---

## 11. Monitoring & Logging

### 11.1 Application Monitoring

**Tool:** Vercel Analytics + Sentry

**Metrics:**
-   API response times
-   Error rates
-   User activity

### 11.2 Agent Logs

All agent executions are logged to the `agent_logs` table.

**Key Metrics:**
-   Execution time
-   Token usage
-   Success/failure rate

### 11.3 CLI Logs

The CLI should log all executed commands locally for debugging.

**Log File:** `~/.mrpromth/logs/cli.log`

---

**Technical Specifications Version:** 2.0  
**Last Updated:** 7 พฤศจิกายน 2025
