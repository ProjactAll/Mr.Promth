# 🗺️ Mr.Promth - Implementation Roadmap

**Version:** 2.0  
**Date:** 7 พฤศจิกายน 2025  
**Purpose:** Detailed, week-by-week implementation plan for building Mr.Promth

---

## 📋 Overview

This roadmap provides a comprehensive, step-by-step plan for building the Mr.Promth system. The total estimated time is **12 weeks** for a complete, production-ready system.

### Team Size Assumptions:
-   **1 Full-Stack Developer** (or AI like Codex)
-   **Part-time DevOps** (for deployment and infrastructure)

### Key Milestones:
-   **Week 4:** Core infrastructure complete (CLI + Backend + Database)
-   **Week 8:** Agent chain functional, basic UI complete
-   **Week 12:** Production-ready, deployed, and tested

---

## 🚀 Phase 1: Foundation (Weeks 1-4)

The first phase focuses on building the core infrastructure that everything else depends on. This includes the database, authentication, the CLI tool, and the basic backend orchestrator.

### Week 1: Project Setup & Database

#### Day 1-2: Project Initialization

**Tasks:**
1.  Create a new GitHub repository: `mrphomth`
2.  Initialize the Next.js project:
    ```bash
    npx create-next-app@latest mrphomth --typescript --tailwind --app
    cd mrphomth
    ```
3.  Set up the project structure:
    ```
    mrphomth/
    ├── app/              # Next.js App Router
    ├── components/       # React components
    ├── lib/              # Utilities and logic
    ├── cli/              # CLI tool source code (separate directory)
    ├── database/         # Database migrations
    └── public/           # Static assets
    ```
4.  Install core dependencies:
    ```bash
    npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
    npm install -D @types/node
    ```

#### Day 3-4: Supabase Setup

**Tasks:**
1.  Create a new Supabase project at [supabase.com](https://supabase.com)
2.  Copy the project URL and anon key to `.env.local`:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ```
3.  Install Supabase CLI:
    ```bash
    npm install -g supabase
    supabase login
    supabase link --project-ref your-project-ref
    ```
4.  Create the database schema (see `TECHNICAL_SPECIFICATIONS.md` section 4):
    -   Create migration file: `database/migrations/001_initial_schema.sql`
    -   Define tables: `projects`, `agent_logs`, `cli_sessions`
    -   Apply migration:
        ```bash
        supabase db push
        ```

#### Day 5: Row Level Security (RLS)

**Tasks:**
1.  Enable RLS on all tables
2.  Create RLS policies for `projects`, `agent_logs`, and `cli_sessions`
3.  Test RLS policies using the Supabase dashboard

#### Day 6-7: Authentication

**Tasks:**
1.  Set up Supabase Auth in the Next.js app
2.  Create login page: `app/login/page.tsx`
3.  Create signup page: `app/signup/page.tsx`
4.  Implement auth middleware: `middleware.ts`
5.  Test authentication flow

**Deliverables:**
-   ✅ Supabase project configured
-   ✅ Database schema created
-   ✅ RLS policies in place
-   ✅ Authentication working

---

### Week 2: CLI Tool Development (Part 1)

#### Day 1-2: Technology Selection & Setup

**Decision:** Choose Go, Rust, or Node.js for the CLI.

**Recommendation:** Go (good balance of performance, ease of development, and single-binary distribution).

**Tasks:**
1.  Create a new directory: `cli/`
2.  Initialize a Go module:
    ```bash
    cd cli
    go mod init github.com/yourusername/mr-promth-cli
    ```
3.  Install dependencies:
    ```bash
    go get github.com/spf13/cobra  # CLI framework
    go get github.com/gorilla/websocket  # WebSocket client
    ```
4.  Create the basic CLI structure:
    ```
    cli/
    ├── cmd/
    │   ├── root.go
    │   ├── login.go
    │   └── connect.go
    ├── pkg/
    │   ├── auth/
    │   ├── ws/
    │   └── executor/
    └── main.go
    ```

#### Day 3-4: Implement `login` Command

**Tasks:**
1.  Implement `cmd/login.go`:
    -   Prompt user for email and password
    -   Send credentials to Supabase Auth API
    -   Save JWT token to `~/.mrpromth/config.json`
2.  Implement `pkg/auth/auth.go`:
    -   `Login(email, password string) (string, error)`
    -   `SaveToken(token string) error`
    -   `LoadToken() (string, error)`

**Example Code:**
```go
// cmd/login.go
func loginCmd() *cobra.Command {
    return &cobra.Command{
        Use:   "login",
        Short: "Authenticate with Mr.Promth",
        Run: func(cmd *cobra.Command, args []string) {
            email := promptForInput("Email: ")
            password := promptForPassword("Password: ")
            
            token, err := auth.Login(email, password)
            if err != nil {
                fmt.Println("Login failed:", err)
                return
            }
            
            auth.SaveToken(token)
            fmt.Println("Login successful!")
        },
    }
}
```

#### Day 5-7: Implement WebSocket Connection

**Tasks:**
1.  Implement `pkg/ws/client.go`:
    -   `Connect(url, token string) error`
    -   `Listen() <-chan Message`
    -   `Send(message Message) error`
2.  Implement `cmd/connect.go`:
    -   Load auth token
    -   Connect to backend WebSocket server
    -   Start listening for commands

**Example Code:**
```go
// pkg/ws/client.go
type Client struct {
    conn *websocket.Conn
}

func (c *Client) Connect(url, token string) error {
    header := http.Header{}
    header.Add("Authorization", "Bearer "+token)
    
    conn, _, err := websocket.DefaultDialer.Dial(url, header)
    if err != nil {
        return err
    }
    
    c.conn = conn
    return nil
}

func (c *Client) Listen() <-chan Message {
    messages := make(chan Message)
    
    go func() {
        for {
            var msg Message
            err := c.conn.ReadJSON(&msg)
            if err != nil {
                close(messages)
                return
            }
            messages <- msg
        }
    }()
    
    return messages
}
```

**Deliverables:**
-   ✅ CLI tool with `login` command
-   ✅ CLI tool with `connect` command
-   ✅ WebSocket client implementation

---

### Week 3: CLI Tool Development (Part 2) & Backend WebSocket Server

#### Day 1-3: Implement Tool Executors

**Tasks:**
1.  Implement `pkg/executor/executor.go`:
    -   `ExecuteCommand(cmd Command) (*Result, error)`
2.  Implement `writeFile` tool:
    ```go
    func writeFile(path, content string) error {
        // Validate path
        if !isWithinProjectDir(path) {
            return errors.New("permission denied")
        }
        return ioutil.WriteFile(path, []byte(content), 0644)
    }
    ```
3.  Implement `runCommand` tool:
    ```go
    func runCommand(command string, timeout int) (*Result, error) {
        ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
        defer cancel()
        
        cmd := exec.CommandContext(ctx, "sh", "-c", command)
        
        var stdout, stderr bytes.Buffer
        cmd.Stdout = &stdout
        cmd.Stderr = &stderr
        
        err := cmd.Run()
        
        return &Result{
            Stdout: stdout.String(),
            Stderr: stderr.String(),
            ExitCode: cmd.ProcessState.ExitCode(),
        }, err
    }
    ```
4.  Implement the command execution loop in `cmd/connect.go`:
    ```go
    for msg := range wsClient.Listen() {
        if msg.Type == "command" {
            result := executor.ExecuteCommand(msg)
            wsClient.Send(Message{
                Type: "result",
                CommandID: msg.CommandID,
                Result: result,
            })
        }
    }
    ```

#### Day 4-5: Backend WebSocket Server

**Tasks:**
1.  Create `app/api/ws/route.ts` (Next.js API route for WebSocket)
2.  Implement WebSocket server using `ws` library:
    ```bash
    npm install ws @types/ws
    ```
3.  Implement connection handling:
    -   Verify JWT token
    -   Store active connections in memory
    -   Handle incoming messages from CLI

**Example Code:**
```typescript
// app/api/ws/route.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  const token = request.headers.authorization?.replace('Bearer ', '');
  
  // Verify token
  const user = await verifyToken(token);
  if (!user) {
    ws.close();
    return;
  }
  
  // Store connection
  activeConnections.set(user.id, ws);
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    handleCLIMessage(user.id, message);
  });
});
```

#### Day 6-7: Testing & Integration

**Tasks:**
1.  Test the full flow:
    -   Run `mr-promth-cli login`
    -   Run `mr-promth-cli connect`
    -   Send a test command from the backend
    -   Verify the CLI executes it and sends back the result
2.  Fix any bugs

**Deliverables:**
-   ✅ CLI tool can execute `writeFile` and `runCommand`
-   ✅ Backend WebSocket server is functional
-   ✅ CLI and Backend can communicate

---

### Week 4: Agent Chain Orchestrator (Backend Logic)

#### Day 1-2: Orchestrator Setup

**Tasks:**
1.  Create `lib/orchestrator.ts`
2.  Define the `AgentChain` class:
    ```typescript
    class AgentChain {
      private projectId: string;
      private userPrompt: string;
      
      constructor(projectId: string, userPrompt: string) {
        this.projectId = projectId;
        this.userPrompt = userPrompt;
      }
      
      async execute(): Promise<void> {
        await this.runAgent1();
        await this.runAgent2();
        await this.runAgents3to7();
      }
      
      private async runAgent1(): Promise<void> { /* ... */ }
      private async runAgent2(): Promise<void> { /* ... */ }
      private async runAgents3to7(): Promise<void> { /* ... */ }
    }
    ```

#### Day 3-4: Implement Agent 1 & 2

**Tasks:**
1.  Implement `runAgent1()`:
    -   Call VanchinAI API with the user prompt
    -   Parse the response (expanded prompt + project details)
    -   Save to `agent_logs` table
2.  Implement `runAgent2()`:
    -   Call VanchinAI API with Agent 1's output
    -   Parse the response (architecture design)
    -   Save to `agent_logs` table

**Example Code:**
```typescript
private async runAgent1(): Promise<AgentOutput> {
  const prompt = `You are Agent 1: Prompt Expander. Expand this prompt: "${this.userPrompt}"`;
  
  const response = await callVanchinAI(prompt);
  const output = JSON.parse(response);
  
  await saveAgentLog(this.projectId, 1, 'Prompt Expander', output);
  
  return output;
}
```

#### Day 5-7: Implement Agents 3-7 Logic

**Tasks:**
1.  For each agent (3-7), implement the logic to:
    -   Generate a prompt based on previous agents' outputs
    -   Call VanchinAI API
    -   Parse the response (list of tool commands)
    -   Send each command to the CLI via WebSocket
    -   Wait for the CLI to respond
    -   Save logs to the database
2.  Implement error handling and retries

**Example Code:**
```typescript
private async runAgent3(): Promise<void> {
  const agent2Output = await getAgentOutput(this.projectId, 2);
  
  const prompt = `You are Agent 3: Backend Developer. Create the backend based on this architecture: ${JSON.stringify(agent2Output)}. Output a list of tool commands.`;
  
  const response = await callVanchinAI(prompt);
  const commands = JSON.parse(response).commands;
  
  for (const cmd of commands) {
    const result = await sendCommandToCLI(this.projectId, cmd);
    if (!result.success) {
      throw new Error(`Command failed: ${result.error}`);
    }
  }
  
  await saveAgentLog(this.projectId, 3, 'Backend Developer', { commands });
}
```

**Deliverables:**
-   ✅ Orchestrator can run all 7 agents
-   ✅ Agents can send commands to the CLI
-   ✅ End-to-end flow works (prompt → agents → CLI → website)

---

## 🎨 Phase 2: User Interface (Weeks 5-8)

The second phase focuses on building the user-facing web interface and refining the agent chain.

### Week 5: Dashboard & Project Management

#### Day 1-3: Dashboard UI

**Tasks:**
1.  Create `app/dashboard/page.tsx`
2.  Fetch user's projects from Supabase:
    ```typescript
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    ```
3.  Display projects in a grid or list
4.  Add status indicators (pending, running, completed, error)
5.  Add quick actions (view, delete)

#### Day 4-5: Project Creation Flow

**Tasks:**
1.  Create `components/PromptInput.tsx`
2.  Add a multi-line text input for the prompt
3.  Add a "Create Project" button
4.  Implement the `POST /api/projects` endpoint:
    ```typescript
    // app/api/projects/route.ts
    export async function POST(request: Request) {
      const { prompt } = await request.json();
      
      const project = await createProject(user.id, prompt);
      
      // Start agent chain in background
      startAgentChain(project.id, prompt);
      
      return NextResponse.json({ project_id: project.id });
    }
    ```

#### Day 6-7: Project Detail Page

**Tasks:**
1.  Create `app/projects/[id]/page.tsx`
2.  Fetch project details and agent logs
3.  Display basic project information

**Deliverables:**
-   ✅ Dashboard with project list
-   ✅ Project creation flow
-   ✅ Project detail page (basic)

---

### Week 6: Real-Time UI Components

#### Day 1-3: Terminal Viewer

**Tasks:**
1.  Create `components/TerminalViewer.tsx`
2.  Connect to the backend via WebSocket to receive real-time `stdout`/`stderr` from the CLI
3.  Display the output in a terminal-like UI with ANSI color support
4.  Implement auto-scrolling

**Example Code:**
```typescript
// components/TerminalViewer.tsx
export function TerminalViewer({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.mrpromth.com/ws/logs/${projectId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, data.output]);
    };
    
    return () => ws.close();
  }, [projectId]);
  
  return (
    <div className="bg-black text-green-400 p-4 font-mono text-sm">
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
}
```

#### Day 4-5: Agent Progress Timeline

**Tasks:**
1.  Create `components/AgentTimeline.tsx`
2.  Fetch agent logs from the database
3.  Display a visual timeline with status indicators
4.  Update in real-time as agents complete

**Example Code:**
```typescript
// components/AgentTimeline.tsx
const agents = [
  { number: 1, name: 'Prompt Expander' },
  { number: 2, name: 'Architecture Designer' },
  // ... 7 agents
];

export function AgentTimeline({ projectId }: { projectId: string }) {
  const { data: logs } = useQuery(['agent-logs', projectId], () =>
    fetchAgentLogs(projectId)
  );
  
  return (
    <div className="space-y-4">
      {agents.map((agent) => {
        const log = logs?.find((l) => l.agent_number === agent.number);
        const status = log?.status || 'pending';
        
        return (
          <div key={agent.number} className="flex items-center gap-4">
            <StatusIcon status={status} />
            <div>
              <div className="font-semibold">{agent.name}</div>
              {log && <div className="text-sm text-gray-500">{log.execution_time_ms}ms</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

#### Day 6-7: Integration & Polish

**Tasks:**
1.  Integrate the Terminal Viewer and Agent Timeline into the Project Detail page
2.  Add loading states and error handling
3.  Polish the UI

**Deliverables:**
-   ✅ Real-time terminal viewer
-   ✅ Agent progress timeline
-   ✅ Polished project detail page

---

### Week 7: VanchinAI Integration & Agent Refinement

#### Day 1-2: VanchinAI Client

**Tasks:**
1.  Create `lib/vanchin.ts`
2.  Implement the VanchinAI API client:
    ```typescript
    import OpenAI from 'openai';
    
    const vanchinClients = [
      new OpenAI({
        baseURL: 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints',
        apiKey: process.env.VANCHIN_API_KEY_1,
      }),
      // ... 14 clients
    ];
    
    let currentClientIndex = 0;
    
    export async function callVanchinAI(prompt: string): Promise<string> {
      const client = vanchinClients[currentClientIndex];
      currentClientIndex = (currentClientIndex + 1) % vanchinClients.length;
      
      const response = await client.chat.completions.create({
        model: process.env.VANCHIN_ENDPOINT_1,
        messages: [{ role: 'user', content: prompt }],
      });
      
      return response.choices[0].message.content;
    }
    ```
3.  Implement load balancing and failover

#### Day 3-5: Agent Prompt Engineering

**Tasks:**
1.  Refine the prompts for each agent to produce better outputs
2.  Test each agent individually
3.  Iterate on the prompts based on the results

**Example Refined Prompt for Agent 3:**
```
You are Agent 3: Backend Developer.

Your task is to create the backend for a web application based on the following architecture:

{Agent 2 Output}

You must output ONLY a valid JSON object with the following structure:

{
  "commands": [
    {
      "tool_name": "writeFile",
      "parameters": {
        "path": "./relative/path/to/file.ts",
        "content": "The full content of the file"
      }
    },
    {
      "tool_name": "runCommand",
      "parameters": {
        "command": "npm install",
        "timeout": 300
      }
    }
  ]
}

Do not include any other text. Only output the JSON.
```

#### Day 6-7: End-to-End Testing

**Tasks:**
1.  Test the full flow with various prompts:
    -   "Create a personal blog"
    -   "Create an e-commerce website"
    -   "Create a portfolio website"
2.  Identify and fix bugs
3.  Measure execution time and token usage

**Deliverables:**
-   ✅ VanchinAI integration complete
-   ✅ Agent prompts refined
-   ✅ End-to-end system tested

---

### Week 8: Token Management & Billing

#### Day 1-3: Token Tracking

**Tasks:**
1.  Implement token counting for each VanchinAI API call
2.  Save token usage to the `agent_logs` table
3.  Display total token usage on the project detail page

#### Day 4-5: Subscription Plans (Basic)

**Tasks:**
1.  Define subscription plans:
    -   **Free:** 10,000 tokens/month
    -   **Pro:** 100,000 tokens/month ($10/month)
    -   **Enterprise:** Unlimited tokens ($50/month)
2.  Add a `subscription_plan` column to the `users` table
3.  Implement token limit checks in the orchestrator

#### Day 6-7: Billing UI (Basic)

**Tasks:**
1.  Create `app/settings/page.tsx`
2.  Display current token usage
3.  Display subscription plan
4.  Add a "Upgrade" button (link to a payment page, to be implemented later)

**Deliverables:**
-   ✅ Token tracking implemented
-   ✅ Subscription plans defined
-   ✅ Basic billing UI

---

## 🚢 Phase 3: Production Readiness (Weeks 9-12)

The final phase focuses on testing, optimization, deployment, and documentation.

### Week 9: Testing & Quality Assurance

#### Day 1-3: Unit Tests

**Tasks:**
1.  Write unit tests for critical functions:
    -   `lib/orchestrator.ts`
    -   `lib/vanchin.ts`
    -   CLI tool executors
2.  Use Jest for Next.js tests, Go's built-in testing for CLI tests
3.  Aim for 70%+ code coverage

#### Day 4-5: Integration Tests

**Tasks:**
1.  Write integration tests for the full agent chain
2.  Test the CLI-Backend communication
3.  Test the WebSocket connection

#### Day 6-7: End-to-End Tests

**Tasks:**
1.  Use Playwright or Cypress for E2E tests
2.  Test the full user flow:
    -   Login
    -   Create project
    -   Watch progress
    -   View result

**Deliverables:**
-   ✅ Unit tests written
-   ✅ Integration tests written
-   ✅ E2E tests written

---

### Week 10: Performance Optimization

#### Day 1-2: Frontend Optimization

**Tasks:**
1.  Optimize bundle size (code splitting, tree shaking)
2.  Optimize images (use Next.js Image component)
3.  Implement caching strategies
4.  Run Lighthouse audits and fix issues

#### Day 3-4: Backend Optimization

**Tasks:**
1.  Optimize database queries (add indexes if needed)
2.  Implement caching for frequently accessed data (Redis or in-memory)
3.  Optimize VanchinAI API calls (batching, parallel execution where possible)

#### Day 5-7: Load Testing

**Tasks:**
1.  Use tools like k6 or Artillery to simulate load
2.  Test with 10, 50, 100 concurrent users
3.  Identify bottlenecks and optimize

**Deliverables:**
-   ✅ Frontend optimized (Lighthouse 90+)
-   ✅ Backend optimized
-   ✅ Load testing complete

---

### Week 11: Security & Deployment

#### Day 1-2: Security Audit

**Tasks:**
1.  Review all authentication and authorization logic
2.  Ensure RLS policies are correct
3.  Review CLI sandboxing logic
4.  Test for common vulnerabilities (SQL injection, XSS, etc.)

#### Day 3-4: Deployment Setup

**Tasks:**
1.  Deploy the Next.js app to Vercel:
    ```bash
    vercel --prod
    ```
2.  Set up environment variables on Vercel
3.  Deploy the database migrations to Supabase:
    ```bash
    supabase db push
    ```
4.  Set up a custom domain (optional)

#### Day 5-7: CLI Distribution

**Tasks:**
1.  Build the CLI for all platforms:
    ```bash
    # macOS
    GOOS=darwin GOARCH=amd64 go build -o mr-promth-cli-macos
    # Windows
    GOOS=windows GOARCH=amd64 go build -o mr-promth-cli-windows.exe
    # Linux
    GOOS=linux GOARCH=amd64 go build -o mr-promth-cli-linux
    ```
2.  Upload binaries to GitHub Releases
3.  Create installation scripts:
    -   `https://install.mrpromth.com` (shell script)
    -   `https://install.mrpromth.com/windows` (PowerShell script)

**Deliverables:**
-   ✅ Security audit complete
-   ✅ Application deployed to production
-   ✅ CLI binaries distributed

---

### Week 12: Documentation & Launch

#### Day 1-3: User Documentation

**Tasks:**
1.  Write a comprehensive user guide:
    -   How to sign up
    -   How to install the CLI
    -   How to create a project
    -   How to interpret the results
2.  Create video tutorials (optional)
3.  Write FAQs

#### Day 4-5: Developer Documentation

**Tasks:**
1.  Write API documentation
2.  Write CLI documentation
3.  Write contribution guidelines (if open-source)

#### Day 6: Soft Launch

**Tasks:**
1.  Invite a small group of beta testers
2.  Gather feedback
3.  Fix critical bugs

#### Day 7: Public Launch

**Tasks:**
1.  Announce on social media, Product Hunt, Hacker News, etc.
2.  Monitor for issues
3.  Celebrate! 🎉

**Deliverables:**
-   ✅ User documentation complete
-   ✅ Developer documentation complete
-   ✅ Soft launch successful
-   ✅ Public launch

---

## 📊 Summary

### Total Time: 12 Weeks

| Phase | Weeks | Key Deliverables |
|-------|-------|------------------|
| **Phase 1: Foundation** | 1-4 | Database, Auth, CLI, Backend Orchestrator |
| **Phase 2: User Interface** | 5-8 | Dashboard, Real-time UI, VanchinAI Integration, Token Management |
| **Phase 3: Production Readiness** | 9-12 | Testing, Optimization, Deployment, Documentation |

### Critical Path:
1.  Database & Auth (Week 1)
2.  CLI Tool (Weeks 2-3)
3.  Backend Orchestrator (Week 4)
4.  Agent Chain (Week 7)
5.  Deployment (Week 11)

### Risks & Mitigation:
-   **Risk:** VanchinAI API is slow or unreliable.
    -   **Mitigation:** Implement robust error handling, retries, and failover.
-   **Risk:** CLI security vulnerabilities.
    -   **Mitigation:** Thorough security audit, sandboxing, and user permissions.
-   **Risk:** Agent outputs are inconsistent.
    -   **Mitigation:** Extensive prompt engineering and testing.

---

**This roadmap is your guide. Follow it step by step, and you will build a production-ready Mr.Promth system in 12 weeks.**

**Good luck, Codex!** 🚀
