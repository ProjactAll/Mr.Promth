## Mr.Prompt System Architecture

### Overview
Mr.Prompt is composed of a modern web client built with Next.js 14 (App Router) that communicates with Supabase for authentication, authorization, data persistence, and real-time features. A Python FastAPI microservice acts as the AI gateway, proxying chat completion requests to `streamlake.ai` (Kat Coder) and future AI providers. The system is designed for modularity, security, and extensibility.

- **Client Application (Next.js 14 App Router)**
  - UI layer with reusable components styled via Tailwind CSS
  - Server Actions & API routes to interact with Supabase and the AI Gateway
  - Authentication flows powered by Supabase Auth helpers

- **Supabase Backend**
  - PostgreSQL database with Row-Level Security (RLS)
  - Supabase Auth for user management and session handling
  - Edge Functions (future scope) for webhooks/integrations

- **AI Gateway Microservice (FastAPI)**
  - REST endpoint `/chat` handling chat interactions
  - Provider abstraction for `streamlake.ai` and future providers
  - Secure communication via service token shared with Next.js API route

- **Infrastructure & Deployment**
  - Next.js deployed on Vercel (or similar)
  - Supabase managed hosting
  - FastAPI deployed on container-friendly platform (e.g., Fly.io, Railway)

### Data Flow
1. The user authenticates via Supabase (email/password, OAuth providers possible).
2. Authenticated requests from the Next.js client hit server actions or API routes.
3. CRUD operations interact with Supabase Postgres; responses are returned to the client.
4. Chat requests call the Next.js API route, which forwards to the FastAPI gateway.
5. The gateway streams responses from `streamlake.ai` back to the Next.js route, which relays them to the UI in real time.

### Database Schema

| Table | Description | Key Columns |
| --- | --- | --- |
| `profiles` | Extends Supabase auth users with display metadata. | `id` (uuid, PK, references auth.users), `display_name`, `avatar_url`, `role`, timestamps |
| `api_credentials` | Stores encrypted AI provider keys per user. | `id` (uuid, PK), `user_id` (uuid, FK profiles.id), `provider` (text), `encrypted_key` (text), `created_at` |
| `chat_sessions` | Chat workspaces between user and AI. | `id` (uuid, PK), `user_id` (uuid, FK profiles.id), `title`, `metadata` (jsonb), timestamps |
| `messages` | Messages exchanged within chat sessions. | `id` (uuid, PK), `session_id` (uuid, FK chat_sessions.id), `sender` (enum: `user`, `assistant`, `system`), `content` (text), `created_at`, `provider_message_id` |
| `prompts` | User-authored prompt templates. | `id` (uuid, PK), `user_id` (uuid, FK profiles.id), `title`, `description`, `content` (text), `tags` (text[]), `is_public` (boolean), timestamps |
| `prompt_versions` | Version history for prompts. | `id` (uuid, PK), `prompt_id` (uuid, FK prompts.id), `version` (int), `content` (text), `created_at` |
| `prompt_usage_logs` | Audit log for prompt executions. | `id` (uuid, PK), `prompt_id` (uuid, FK prompts.id), `session_id` (uuid, FK chat_sessions.id), `executed_at`, `provider`, `latency_ms`, `token_count` |

**Indices & Policies**
- Index frequently queried columns (e.g., `chat_sessions.user_id`, `messages.session_id`, `prompts.user_id`).
- Enforce RLS policies to ensure users access only their own data, with optional sharing for public prompts.

