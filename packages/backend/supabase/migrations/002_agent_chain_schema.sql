-- Migration: 002_agent_chain_schema.sql
-- Description: Agent chain project tracking tables

-- Projects table keeps track of each agent chain execution
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_agent INTEGER DEFAULT 1,
  agent_outputs JSONB DEFAULT '{}'::jsonb,
  final_output JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution log table for individual agent steps
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_number INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  input JSONB,
  output JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automatically maintain updated_at timestamp
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project_id ON agent_logs(project_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Policies for projects table
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for agent_logs table (read-only via owning project)
CREATE POLICY "Users can view logs for their projects" ON agent_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = agent_logs.project_id
        AND projects.user_id = auth.uid()
    )
  );

COMMENT ON TABLE projects IS 'Agent chain runs for generating production-ready projects';
COMMENT ON TABLE agent_logs IS 'Step-by-step execution logs for agent chain runs';
