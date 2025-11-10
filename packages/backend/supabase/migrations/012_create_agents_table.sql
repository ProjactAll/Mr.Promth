-- Migration: Create agents table
-- Created: 2025-11-10
-- Description: Add agents table for AI agent marketplace

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'robot',
  tags TEXT[] DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  input_schema JSONB NOT NULL DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
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

-- Indexes
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_author ON agents(author_id);
CREATE INDEX idx_agents_public ON agents(is_public);
CREATE INDEX idx_agents_featured ON agents(is_featured);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Public agents viewable by everyone
CREATE POLICY "Public agents are viewable by everyone"
  ON agents FOR SELECT
  USING (is_public = true);

-- Users can view their own agents
CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = author_id);

-- Users can create agents
CREATE POLICY "Users can create agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own agents
CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own agents
CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = author_id);

-- Admins can manage all agents
CREATE POLICY "Admins can manage all agents"
  ON agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Agent executions table
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_data JSONB,
  output_data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  error TEXT,
  execution_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_agent ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_user ON agent_executions(user_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);

-- RLS for agent_executions
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own executions"
  ON agent_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create executions"
  ON agent_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Agent ratings table
CREATE TABLE IF NOT EXISTS agent_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

CREATE INDEX idx_agent_ratings_agent ON agent_ratings(agent_id);
CREATE INDEX idx_agent_ratings_user ON agent_ratings(user_id);

-- RLS for agent_ratings
ALTER TABLE agent_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON agent_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON agent_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON agent_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON agent_ratings FOR DELETE
  USING (auth.uid() = user_id);
