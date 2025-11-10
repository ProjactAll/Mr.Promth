-- Agent chain tables for tracking project generations

-- Projects table stores high-level run information
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_agent INTEGER DEFAULT 1,
  agent_outputs JSONB DEFAULT '{}'::jsonb,
  final_output JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Execution logs for each agent step
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update timestamp trigger reuse
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project_id ON agent_logs(project_id);

-- Enable row level security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policy for viewing agent logs via owning project
CREATE POLICY "Users can view logs for their projects"
  ON agent_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = agent_logs.project_id
        AND projects.user_id = auth.uid()
    )
  );
