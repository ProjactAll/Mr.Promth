-- Migration: 006_fix_schema_and_add_features.sql
-- Description: Fix schema issues, add missing tables (logs, MFA), and enhance features
-- Created: 2025-11-08

-- ============================================================================
-- 1. Create missing logs table for system logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('info', 'warning', 'error')) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Policies for logs
CREATE POLICY "Users can view logs of own projects" 
  ON public.logs FOR SELECT 
  USING (
    project_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = logs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all logs" 
  ON public.logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert logs" 
  ON public.logs FOR INSERT 
  WITH CHECK (true);

-- Create indexes for logs
CREATE INDEX IF NOT EXISTS idx_logs_project_id ON public.logs(project_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at DESC);

-- ============================================================================
-- 2. Create MFA failed verification attempts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mfa_failed_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.mfa_failed_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for MFA attempts
CREATE POLICY "Users can view their own MFA attempts" 
  ON public.mfa_failed_verification_attempts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all MFA attempts" 
  ON public.mfa_failed_verification_attempts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert MFA attempts" 
  ON public.mfa_failed_verification_attempts FOR INSERT 
  WITH CHECK (true);

-- Create indexes for MFA attempts
CREATE INDEX IF NOT EXISTS idx_mfa_attempts_user_id ON public.mfa_failed_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_attempts_attempted_at ON public.mfa_failed_verification_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_mfa_attempts_ip_address ON public.mfa_failed_verification_attempts(ip_address);

-- ============================================================================
-- 3. Enhance rate_limit_overrides with per-user customization
-- ============================================================================

-- Add more fields to rate_limit_overrides if needed
DO $$
BEGIN
  -- Add enabled flag if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rate_limit_overrides' 
    AND column_name = 'enabled'
  ) THEN
    ALTER TABLE rate_limit_overrides 
    ADD COLUMN enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add notes field if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rate_limit_overrides' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE rate_limit_overrides 
    ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create index for enabled status
CREATE INDEX IF NOT EXISTS idx_rate_limit_overrides_enabled ON rate_limit_overrides(enabled);

-- ============================================================================
-- 4. Create function to check and enforce MFA rate limiting
-- ============================================================================

CREATE OR REPLACE FUNCTION check_mfa_rate_limit(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_count INTEGER;
  v_time_window INTERVAL := '2 seconds';
BEGIN
  -- Count attempts in the last 2 seconds
  SELECT COUNT(*) INTO v_attempt_count
  FROM mfa_failed_verification_attempts
  WHERE user_id = p_user_id
  AND attempted_at > NOW() - v_time_window;

  -- If more than 1 attempt in 2 seconds, deny
  IF v_attempt_count >= 1 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 5. Create function to log MFA failed attempts
-- ============================================================================

CREATE OR REPLACE FUNCTION log_mfa_failed_attempt(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO mfa_failed_verification_attempts (
    user_id,
    ip_address,
    user_agent,
    reason
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_reason
  )
  RETURNING id INTO v_attempt_id;
  
  RETURN v_attempt_id;
END;
$$;

-- ============================================================================
-- 6. Create function to get user's effective rate limit
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_rate_limit(
  p_user_id UUID,
  p_limit_type TEXT
)
RETURNS TABLE(requests INTEGER, window_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_override RECORD;
  v_default_limits JSONB;
BEGIN
  -- Check for active override
  SELECT * INTO v_override
  FROM rate_limit_overrides
  WHERE user_id = p_user_id
  AND limit_type = p_limit_type
  AND enabled = true
  AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  -- If override exists, return it
  IF FOUND THEN
    RETURN QUERY SELECT v_override.requests, v_override.window_seconds;
    RETURN;
  END IF;

  -- Otherwise, return default limits from system_settings
  SELECT setting_value INTO v_default_limits
  FROM system_settings
  WHERE setting_key = 'rate_limit_' || p_limit_type;

  IF FOUND THEN
    RETURN QUERY SELECT 
      (v_default_limits->>'requests')::INTEGER,
      EXTRACT(EPOCH FROM (v_default_limits->>'window')::INTERVAL)::INTEGER;
  ELSE
    -- Fallback defaults
    CASE p_limit_type
      WHEN 'api' THEN
        RETURN QUERY SELECT 60, 60;
      WHEN 'auth' THEN
        RETURN QUERY SELECT 5, 60;
      WHEN 'ai' THEN
        RETURN QUERY SELECT 10, 60;
      WHEN 'admin' THEN
        RETURN QUERY SELECT 100, 60;
      ELSE
        RETURN QUERY SELECT 30, 60;
    END CASE;
  END IF;
END;
$$;

-- ============================================================================
-- 7. Create admin function to set user rate limit
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_set_user_rate_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_requests INTEGER,
  p_window_seconds INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_override_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT role = 'admin' INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can set rate limits';
  END IF;

  -- Insert or update rate limit override
  INSERT INTO rate_limit_overrides (
    user_id,
    limit_type,
    requests,
    window_seconds,
    reason,
    created_by,
    expires_at,
    enabled
  ) VALUES (
    p_user_id,
    p_limit_type,
    p_requests,
    p_window_seconds,
    p_reason,
    auth.uid(),
    p_expires_at,
    true
  )
  ON CONFLICT (user_id, limit_type) DO UPDATE SET
    requests = EXCLUDED.requests,
    window_seconds = EXCLUDED.window_seconds,
    reason = EXCLUDED.reason,
    created_by = EXCLUDED.created_by,
    expires_at = EXCLUDED.expires_at,
    enabled = true,
    created_at = NOW()
  RETURNING id INTO v_override_id;

  RETURN v_override_id;
END;
$$;

-- ============================================================================
-- 8. Create trigger to automatically create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 9. Add admin policies for managing rate limits
-- ============================================================================

-- Allow admins to insert rate limit overrides
CREATE POLICY "Admins can insert rate limit overrides"
  ON rate_limit_overrides FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update rate limit overrides
CREATE POLICY "Admins can update rate limit overrides"
  ON rate_limit_overrides FOR UPDATE
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
-- 10. Create cleanup function for old MFA attempts
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_mfa_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete MFA attempts older than 30 days
  DELETE FROM mfa_failed_verification_attempts
  WHERE attempted_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 11. Comments for documentation
-- ============================================================================

COMMENT ON TABLE logs IS 'System and project logs for debugging and monitoring';
COMMENT ON TABLE mfa_failed_verification_attempts IS 'Tracks failed MFA verification attempts for security monitoring';
COMMENT ON FUNCTION check_mfa_rate_limit IS 'Checks if user has exceeded MFA verification rate limit (1 attempt per 2 seconds)';
COMMENT ON FUNCTION log_mfa_failed_attempt IS 'Logs a failed MFA verification attempt';
COMMENT ON FUNCTION get_user_rate_limit IS 'Gets effective rate limit for a user, considering overrides';
COMMENT ON FUNCTION admin_set_user_rate_limit IS 'Admin function to set custom rate limit for a specific user';
COMMENT ON FUNCTION cleanup_old_mfa_attempts IS 'Cleanup function to remove MFA attempts older than 30 days';

-- ============================================================================
-- Migration complete
-- ============================================================================
