-- Migration: Create project_files table and update schema (Fixed version)
-- Date: 2024-01-08
-- Purpose: Enable code editor and file management features

-- ============================================
-- 1. Create project_files table
-- ============================================

CREATE TABLE IF NOT EXISTS project_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workflow_id, file_path)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_files_workflow ON project_files(workflow_id);
CREATE INDEX IF NOT EXISTS idx_project_files_path ON project_files(workflow_id, file_path);

-- Add comment
COMMENT ON TABLE project_files IS 'Stores generated code files for each project';

-- ============================================
-- 2. Enable Row Level Security
-- ============================================

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists, then create new one
DROP POLICY IF EXISTS "Users can access their own project files" ON project_files;
CREATE POLICY "Users can access their own project files"
ON project_files
FOR ALL
USING (
  workflow_id IN (
    SELECT id FROM workflows WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 3. Update chat_sessions table
-- ============================================

-- Add active_project_id column for context awareness
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS active_project_id UUID REFERENCES workflows(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project ON chat_sessions(active_project_id);

-- Add comment
COMMENT ON COLUMN chat_sessions.active_project_id IS 'Currently active project in this chat session';

-- ============================================
-- 4. Update workflows table
-- ============================================

-- Add deployment-related columns
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS project_package_url TEXT,
ADD COLUMN IF NOT EXISTS deployment_url TEXT,
ADD COLUMN IF NOT EXISTS github_repo_url TEXT;

-- Add comments
COMMENT ON COLUMN workflows.project_package_url IS 'URL to download project ZIP file';
COMMENT ON COLUMN workflows.deployment_url IS 'URL of deployed project on Vercel';
COMMENT ON COLUMN workflows.github_repo_url IS 'GitHub repository URL';

-- ============================================
-- 5. Create function to auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project_files
DROP TRIGGER IF EXISTS update_project_files_updated_at ON project_files;
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Grant permissions
-- ============================================

-- Grant access to authenticated users
GRANT ALL ON project_files TO authenticated;

-- ============================================
-- 7. Verification queries
-- ============================================

-- Verify tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_files') THEN
    RAISE NOTICE 'SUCCESS: project_files table created';
  ELSE
    RAISE EXCEPTION 'FAILED: project_files table not created';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_sessions' AND column_name = 'active_project_id'
  ) THEN
    RAISE NOTICE 'SUCCESS: chat_sessions.active_project_id column added';
  ELSE
    RAISE EXCEPTION 'FAILED: chat_sessions.active_project_id column not added';
  END IF;
END $$;
