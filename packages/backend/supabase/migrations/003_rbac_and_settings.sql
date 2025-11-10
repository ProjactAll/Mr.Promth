-- Migration: 003_rbac_and_settings.sql
-- Description: Add Role-Based Access Control and System Settings
-- Created: 2025-11-07

-- ============================================================================
-- 1. Extend profiles table with role and status
-- ============================================================================

-- Add role column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Add is_active column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add last_sign_in_at column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- ============================================================================
-- 2. Create system_settings table
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('agent_mode_enabled', 'true', 'Enable/Disable Agent Mode'),
  ('maintenance_mode', 'false', 'Enable/Disable Maintenance Mode'),
  ('rate_limit_api', '{"requests": 60, "window": "60s"}', 'API Rate Limit (60 requests per minute)'),
  ('rate_limit_auth', '{"requests": 5, "window": "60s"}', 'Auth Rate Limit (5 attempts per minute)'),
  ('rate_limit_admin', '{"requests": 100, "window": "60s"}', 'Admin Rate Limit (100 requests per minute)'),
  ('rate_limit_ai', '{"requests": 10, "window": "60s"}', 'AI Generation Rate Limit (10 requests per minute)'),
  ('max_prompts_per_user', '100', 'Maximum prompts per user'),
  ('max_api_keys_per_user', '5', 'Maximum API keys per user'),
  ('session_timeout', '3600', 'Session timeout in seconds (1 hour)'),
  ('enable_user_registration', 'true', 'Allow new user registration')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 3. Create activity_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- 4. Create rate_limit_overrides table
-- ============================================================================

CREATE TABLE IF NOT EXISTS rate_limit_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL,
  requests INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, limit_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_overrides_user_id ON rate_limit_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_overrides_expires_at ON rate_limit_overrides(expires_at);

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_overrides ENABLE ROW LEVEL SECURITY;

-- System Settings Policies
CREATE POLICY "Admins can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Activity Logs Policies
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Rate Limit Overrides Policies
CREATE POLICY "Admins can manage rate limit overrides"
  ON rate_limit_overrides FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 6. Functions for activity logging
-- ============================================================================

CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ============================================================================
-- 7. Update trigger for profiles last_sign_in_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET last_sign_in_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (if possible, otherwise handle in application)
-- Note: This might need to be handled in application code depending on Supabase setup

-- ============================================================================
-- 8. Set first user as admin (if no admin exists)
-- ============================================================================

DO $$
DECLARE
  v_first_user_id UUID;
  v_admin_count INTEGER;
BEGIN
  -- Check if there are any admins
  SELECT COUNT(*) INTO v_admin_count
  FROM profiles
  WHERE role = 'admin';
  
  -- If no admins exist, make the first user an admin
  IF v_admin_count = 0 THEN
    SELECT id INTO v_first_user_id
    FROM profiles
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_first_user_id IS NOT NULL THEN
      UPDATE profiles
      SET role = 'admin'
      WHERE id = v_first_user_id;
      
      RAISE NOTICE 'First user (%) has been set as admin', v_first_user_id;
    END IF;
  END IF;
END;
$$;

-- ============================================================================
-- 9. Comments for documentation
-- ============================================================================

COMMENT ON TABLE system_settings IS 'Stores system-wide configuration settings';
COMMENT ON TABLE activity_logs IS 'Stores user activity logs for audit trail';
COMMENT ON TABLE rate_limit_overrides IS 'Stores custom rate limits for specific users';

COMMENT ON COLUMN profiles.role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN profiles.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN profiles.last_sign_in_at IS 'Last sign in timestamp';

-- ============================================================================
-- Migration complete
-- ============================================================================
