-- ============================================
-- Mr.Promth Production - Full Database Migration
-- ============================================
-- 
-- Instructions:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy this entire file
-- 3. Paste and click "Run"
-- 4. Wait for completion
--
-- This file includes:
-- - Main schema (profiles, projects, files, logs, api_keys, github_connections)
-- - Extension integration (6 new tables)
-- - Functions and triggers
-- - Indexes
-- - RLS policies
--
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MAIN SCHEMA
-- ============================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('agent', 'chat', 'auto')) DEFAULT 'auto',
  status TEXT CHECK (status IN ('pending', 'building', 'completed', 'failed')) DEFAULT 'pending',
  workspace_path TEXT,
  github_repo TEXT,
  vercel_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" 
  ON public.projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
  ON public.projects FOR DELETE 
  USING (auth.uid() = user_id);

-- FILES TABLE
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files of own projects" 
  ON public.files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files in own projects" 
  ON public.files FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in own projects" 
  ON public.files FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in own projects" 
  ON public.files FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- LOGS TABLE
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('info', 'warning', 'error')) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

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

-- API KEYS TABLE
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys" 
  ON public.api_keys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" 
  ON public.api_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" 
  ON public.api_keys FOR DELETE 
  USING (auth.uid() = user_id);

-- GITHUB CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.github_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own GitHub connections" 
  ON public.github_connections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own GitHub connections" 
  ON public.github_connections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GitHub connections" 
  ON public.github_connections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GitHub connections" 
  ON public.github_connections FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- EXTENSION INTEGRATION TABLES
-- ============================================
-- Extension Integration Migration
-- สร้างตารางสำหรับ Chrome Extension
-- ============================================

-- Enable UUID extension (ถ้ายังไม่มี)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXTENSION_SESSIONS TABLE
-- เก็บข้อมูล session การใช้งาน extension
-- ============================================
CREATE TABLE IF NOT EXISTS public.extension_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  browser_info JSONB, -- เก็บข้อมูล browser, version, OS
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.extension_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own extension sessions" 
  ON public.extension_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own extension sessions" 
  ON public.extension_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extension sessions" 
  ON public.extension_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- SCREENSHOTS TABLE
-- เก็บข้อมูล screenshots จาก extension
-- ============================================
CREATE TABLE IF NOT EXISTS public.screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.extension_sessions(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- URL ของหน้าที่ capture
  storage_path TEXT NOT NULL, -- path ใน Supabase Storage
  width INTEGER,
  height INTEGER,
  metadata JSONB, -- เก็บข้อมูลเพิ่มเติม เช่น viewport size, device type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own screenshots" 
  ON public.screenshots FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own screenshots" 
  ON public.screenshots FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own screenshots" 
  ON public.screenshots FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- DOM_SNAPSHOTS TABLE
-- เก็บข้อมูล DOM structure จาก extension
-- ============================================
CREATE TABLE IF NOT EXISTS public.dom_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screenshot_id UUID REFERENCES public.screenshots(id) ON DELETE CASCADE NOT NULL,
  dom_structure JSONB NOT NULL, -- เก็บ DOM tree
  clickable_elements JSONB, -- รายการ elements ที่คลิกได้
  form_fields JSONB, -- รายการ form fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dom_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view dom snapshots of own screenshots" 
  ON public.dom_snapshots FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.screenshots 
      WHERE screenshots.id = dom_snapshots.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create dom snapshots for own screenshots" 
  ON public.dom_snapshots FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.screenshots 
      WHERE screenshots.id = dom_snapshots.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

-- ============================================
-- ANALYSIS_RESULTS TABLE
-- เก็บผลการวิเคราะห์จาก AI Agent #1
-- ============================================
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screenshot_id UUID REFERENCES public.screenshots(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL, -- 'quick' or 'full'
  results JSONB NOT NULL, -- ผลการวิเคราะห์จาก AI agents
  suggestions JSONB, -- คำแนะนำจาก AI
  confidence_score DECIMAL(3,2), -- คะแนนความมั่นใจ 0.00-1.00
  processing_time INTEGER, -- เวลาที่ใช้ในการวิเคราะห์ (ms)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view analysis results of own screenshots" 
  ON public.analysis_results FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.screenshots 
      WHERE screenshots.id = analysis_results.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis results for own screenshots" 
  ON public.analysis_results FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.screenshots 
      WHERE screenshots.id = analysis_results.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

-- ============================================
-- EXTENSION_SETTINGS TABLE
-- เก็บการตั้งค่าของ extension สำหรับแต่ละ user
-- ============================================
CREATE TABLE IF NOT EXISTS public.extension_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auto_capture BOOLEAN DEFAULT false,
  capture_interval INTEGER DEFAULT 5000, -- ms
  enable_loading_detection BOOLEAN DEFAULT true,
  enable_cookie_accept BOOLEAN DEFAULT true,
  enable_clickable_detection BOOLEAN DEFAULT true,
  custom_settings JSONB, -- การตั้งค่าเพิ่มเติม
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.extension_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own extension settings" 
  ON public.extension_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own extension settings" 
  ON public.extension_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extension settings" 
  ON public.extension_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- EXTENSION_LOGS TABLE
-- เก็บ logs จาก extension
-- ============================================
CREATE TABLE IF NOT EXISTS public.extension_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.extension_sessions(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('info', 'warning', 'error', 'debug')) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.extension_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own extension logs" 
  ON public.extension_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own extension logs" 
  ON public.extension_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_extension_sessions_user_id ON public.extension_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_sessions_started_at ON public.extension_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON public.screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_session_id ON public.screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_created_at ON public.screenshots(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dom_snapshots_screenshot_id ON public.dom_snapshots(screenshot_id);

CREATE INDEX IF NOT EXISTS idx_analysis_results_screenshot_id ON public.analysis_results(screenshot_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON public.analysis_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_extension_settings_user_id ON public.extension_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_extension_logs_user_id ON public.extension_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_logs_session_id ON public.extension_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_extension_logs_created_at ON public.extension_logs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_extension_settings_updated_at BEFORE UPDATE ON public.extension_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function สำหรับดึงข้อมูล user จาก API key
CREATE OR REPLACE FUNCTION get_user_by_api_key(api_key_param TEXT)
RETURNS UUID AS $$
DECLARE
  user_id_result UUID;
BEGIN
  SELECT user_id INTO user_id_result
  FROM public.api_keys
  WHERE key = api_key_param;
  
  -- Update last_used_at
  UPDATE public.api_keys
  SET last_used_at = NOW()
  WHERE key = api_key_param;
  
  RETURN user_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function สำหรับสร้าง profile อotomatically เมื่อมี user ใหม่
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- สร้าง extension_settings เริ่มต้น
  INSERT INTO public.extension_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger สำหรับ handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.extension_sessions IS 'เก็บข้อมูล session การใช้งาน Chrome Extension';
COMMENT ON TABLE public.screenshots IS 'เก็บข้อมูล screenshots ที่ capture จาก extension';
COMMENT ON TABLE public.dom_snapshots IS 'เก็บข้อมูล DOM structure ที่ดึงมาจาก extension';
COMMENT ON TABLE public.analysis_results IS 'เก็บผลการวิเคราะห์จาก AI Agents';
COMMENT ON TABLE public.extension_settings IS 'เก็บการตั้งค่าของ extension สำหรับแต่ละ user';
COMMENT ON TABLE public.extension_logs IS 'เก็บ logs จาก extension เพื่อ debugging';
-- ============================================
-- Storage Bucket Setup for Screenshots
-- ============================================

-- สร้าง bucket สำหรับเก็บ screenshots
-- หมายเหตุ: ต้องรันใน Supabase Dashboard > Storage
-- หรือใช้ Supabase CLI

-- ใน Supabase Dashboard:
-- 1. ไปที่ Storage
-- 2. สร้าง bucket ชื่อ "screenshots"
-- 3. ตั้งค่า:
--    - Public: false (ต้อง authenticate ก่อน)
--    - File size limit: 10MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp

-- ============================================
-- Storage Policies
-- ============================================

-- Policy สำหรับ SELECT (download)
CREATE POLICY "Users can view own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy สำหรับ INSERT (upload)
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy สำหรับ UPDATE
CREATE POLICY "Users can update own screenshots"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy สำหรับ DELETE
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- NOTES
-- ============================================

-- Storage path format: screenshots/{user_id}/{session_id}/{timestamp}.png
-- ตัวอย่าง: screenshots/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/1699999999999.png

-- การใช้งานใน code:
-- 1. Upload: supabase.storage.from('screenshots').upload(path, file)
-- 2. Download: supabase.storage.from('screenshots').download(path)
-- 3. Get URL: supabase.storage.from('screenshots').getPublicUrl(path)
-- 4. Delete: supabase.storage.from('screenshots').remove([path])
