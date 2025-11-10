-- Migration: 001_initial_schema.sql
-- Created: 2025-11-06
-- Description: Initial database schema for Mr.Prompt

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    masked_key TEXT NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provider_message_id TEXT
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_usage_logs table
CREATE TABLE IF NOT EXISTS prompt_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provider TEXT NOT NULL,
    latency_ms INTEGER,
    token_count INTEGER
);

-- Enable Row-Level Security (RLS) on all user-owned tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for api_keys table
CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for chat_sessions table
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for messages table
CREATE POLICY "Users can view messages from their own sessions" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into their own sessions" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their own sessions" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their own sessions" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- Create policies for prompts table
CREATE POLICY "Users can view their own prompts or public prompts" ON prompts
    FOR SELECT USING (
        auth.uid() = user_id OR is_public = TRUE
    );

CREATE POLICY "Users can insert their own prompts" ON prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for prompt_versions table
CREATE POLICY "Users can view prompt versions for their own prompts" ON prompt_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_versions.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prompt versions for their own prompts" ON prompt_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_versions.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update prompt versions for their own prompts" ON prompt_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_versions.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete prompt versions for their own prompts" ON prompt_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_versions.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- Create policies for prompt_usage_logs table
CREATE POLICY "Users can view prompt usage logs for their own prompts" ON prompt_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_usage_logs.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prompt usage logs for their own prompts" ON prompt_usage_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_usage_logs.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_version ON prompt_versions(version);

CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_prompt_id ON prompt_usage_logs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_session_id ON prompt_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_executed_at ON prompt_usage_logs(executed_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_provider ON prompt_usage_logs(provider);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth users';
COMMENT ON TABLE api_keys IS 'Encrypted AI provider credentials per user';
COMMENT ON TABLE chat_sessions IS 'Chat workspaces between user and AI';
COMMENT ON TABLE messages IS 'Messages exchanged within chat sessions';
COMMENT ON TABLE prompts IS 'User-authored prompt templates';
COMMENT ON TABLE prompt_versions IS 'Version history for prompts';
COMMENT ON TABLE prompt_usage_logs IS 'Audit log for prompt executions';