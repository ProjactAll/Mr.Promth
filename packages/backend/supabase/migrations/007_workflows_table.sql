-- Create workflows table for tracking generation workflows

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'analyzing', 'expanding', 'generating-backend', 'generating-frontend', 'testing', 'deploying', 'monitoring', 'completed', 'failed')),
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 7,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  results JSONB DEFAULT '{}',
  errors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workflows
CREATE POLICY "Users can view own workflows"
  ON workflows
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own workflows
CREATE POLICY "Users can create own workflows"
  ON workflows
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workflows
CREATE POLICY "Users can update own workflows"
  ON workflows
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own workflows
CREATE POLICY "Users can delete own workflows"
  ON workflows
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all workflows
CREATE POLICY "Admins can view all workflows"
  ON workflows
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all workflows
CREATE POLICY "Admins can update all workflows"
  ON workflows
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_workflows_updated_at();

-- Function to cleanup old completed workflows (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_workflows()
RETURNS void AS $$
BEGIN
  DELETE FROM workflows
  WHERE status IN ('completed', 'failed')
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE workflows IS 'Tracks code generation workflows from prompt to deployment';
COMMENT ON COLUMN workflows.id IS 'Unique workflow identifier';
COMMENT ON COLUMN workflows.user_id IS 'User who created the workflow';
COMMENT ON COLUMN workflows.project_name IS 'Name of the project being generated';
COMMENT ON COLUMN workflows.status IS 'Current status of the workflow';
COMMENT ON COLUMN workflows.current_step IS 'Current step number (1-7)';
COMMENT ON COLUMN workflows.total_steps IS 'Total number of steps in workflow';
COMMENT ON COLUMN workflows.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN workflows.results IS 'Results from each agent (JSON)';
COMMENT ON COLUMN workflows.errors IS 'Array of error messages';
