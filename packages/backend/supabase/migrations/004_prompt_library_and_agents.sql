-- Migration 004: Prompt Library and Agent System
-- Created: 2025-11-07
-- Description: Add tables for prompt templates, agents, executions, and ratings

-- ============================================================================
-- 1. PROMPT TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  template TEXT NOT NULL, -- Prompt with {{variables}}
  variables JSONB DEFAULT '[]', -- Array of variable definitions
  examples JSONB DEFAULT '[]', -- Array of example inputs/outputs
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00, -- 0 = free
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for prompt_templates
CREATE INDEX idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX idx_prompt_templates_author ON prompt_templates(author_id);
CREATE INDEX idx_prompt_templates_public ON prompt_templates(is_public);
CREATE INDEX idx_prompt_templates_featured ON prompt_templates(is_featured);
CREATE INDEX idx_prompt_templates_tags ON prompt_templates USING GIN(tags);

-- RLS for prompt_templates
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Users can view public prompts
CREATE POLICY "Public prompts are viewable by everyone"
  ON prompt_templates FOR SELECT
  USING (is_public = true);

-- Users can view their own prompts
CREATE POLICY "Users can view own prompts"
  ON prompt_templates FOR SELECT
  USING (auth.uid() = author_id);

-- Users can create prompts
CREATE POLICY "Users can create prompts"
  ON prompt_templates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own prompts
CREATE POLICY "Users can update own prompts"
  ON prompt_templates FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts"
  ON prompt_templates FOR DELETE
  USING (auth.uid() = author_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all prompts"
  ON prompt_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 2. AGENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'robot',
  tags TEXT[] DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]', -- Array of step definitions
  input_schema JSONB NOT NULL DEFAULT '{}', -- JSON Schema for inputs
  output_schema JSONB NOT NULL DEFAULT '{}', -- JSON Schema for outputs
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agents
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_author ON agents(author_id);
CREATE INDEX idx_agents_public ON agents(is_public);
CREATE INDEX idx_agents_featured ON agents(is_featured);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);

-- RLS for agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Similar RLS policies as prompt_templates
CREATE POLICY "Public agents are viewable by everyone"
  ON agents FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all agents"
  ON agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. EXECUTIONS (History of prompt/agent executions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  execution_type VARCHAR(20) NOT NULL CHECK (execution_type IN ('prompt', 'agent')),
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  outputs JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for executions
CREATE INDEX idx_executions_user ON executions(user_id);
CREATE INDEX idx_executions_template ON executions(template_id);
CREATE INDEX idx_executions_agent ON executions(agent_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_created ON executions(created_at DESC);

-- RLS for executions
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

-- Users can view their own executions
CREATE POLICY "Users can view own executions"
  ON executions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create executions
CREATE POLICY "Users can create executions"
  ON executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all executions
CREATE POLICY "Admins can view all executions"
  ON executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating_type VARCHAR(20) NOT NULL CHECK (rating_type IN ('prompt', 'agent')),
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id),
  UNIQUE(user_id, agent_id)
);

-- Indexes for ratings
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_template ON ratings(template_id);
CREATE INDEX idx_ratings_agent ON ratings(agent_id);

-- RLS for ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

-- Users can create ratings
CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to update prompt template stats
CREATE OR REPLACE FUNCTION update_prompt_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE prompt_templates
    SET 
      rating_avg = (
        SELECT COALESCE(AVG(rating), 0)
        FROM ratings
        WHERE template_id = NEW.template_id
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM ratings
        WHERE template_id = NEW.template_id
      ),
      updated_at = NOW()
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for prompt template stats
CREATE TRIGGER trigger_update_prompt_stats
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW
WHEN (NEW.template_id IS NOT NULL)
EXECUTE FUNCTION update_prompt_template_stats();

-- Function to update agent stats
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE agents
    SET 
      rating_avg = (
        SELECT COALESCE(AVG(rating), 0)
        FROM ratings
        WHERE agent_id = NEW.agent_id
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM ratings
        WHERE agent_id = NEW.agent_id
      ),
      updated_at = NOW()
    WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for agent stats
CREATE TRIGGER trigger_update_agent_stats
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW
WHEN (NEW.agent_id IS NOT NULL)
EXECUTE FUNCTION update_agent_stats();

-- Function to increment execution count
CREATE OR REPLACE FUNCTION increment_execution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.template_id IS NOT NULL THEN
      UPDATE prompt_templates
      SET execution_count = execution_count + 1
      WHERE id = NEW.template_id;
    END IF;
    
    IF NEW.agent_id IS NOT NULL THEN
      UPDATE agents
      SET execution_count = execution_count + 1
      WHERE id = NEW.agent_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for execution count
CREATE TRIGGER trigger_increment_execution_count
AFTER UPDATE ON executions
FOR EACH ROW
WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
EXECUTE FUNCTION increment_execution_count();

-- ============================================================================
-- 6. INITIAL DATA (Categories)
-- ============================================================================

-- This will be populated by the application
-- Categories: content_creation, code_generation, data_analysis, business, education, etc.

COMMENT ON TABLE prompt_templates IS 'Stores reusable prompt templates with variables';
COMMENT ON TABLE agents IS 'Stores multi-step AI agents with workflow definitions';
COMMENT ON TABLE executions IS 'Stores history of prompt and agent executions';
COMMENT ON TABLE ratings IS 'Stores user ratings and feedback for prompts and agents';
