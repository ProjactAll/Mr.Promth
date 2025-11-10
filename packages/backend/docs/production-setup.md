# Production Environment Configuration

## Supabase Production Setup

### 1. Create Production Supabase Project

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Create New Project**:
   - Click "New project"
   - Choose production region (closest to your users)
   - Set strong database password
   - Wait for project initialization (3-5 minutes)

### 2. Production Environment Variables

Create `.env.production` file:

```bash
# Supabase Production Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Database Configuration
DATABASE_URL=your_production_database_url

# API Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
API_SECRET_KEY=your_strong_api_secret_key

# Streamlake API (Production)
VC_API_KEY=your_production_streamlake_api_key

# Security Configuration
NEXTAUTH_SECRET=your_strong_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# File Storage
NEXT_PUBLIC_STORAGE_URL=your_production_storage_url
FILE_UPLOAD_MAX_SIZE=52428800  # 50MB in bytes
```

### 3. Database Migration for Production

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables with proper constraints
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider_message_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own api_keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api_keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api_keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api_keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat_sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat_sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat_sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat_sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER handle_updated_at_api_keys
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_chat_sessions
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_prompts
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### 4. Production Security Setup

1. **Database Security**:
   - Enable RLS on all tables
   - Set up proper policies
   - Configure row-level security

2. **Authentication Security**:
   - Enable email confirmation
   - Set up password strength requirements
   - Configure rate limiting

3. **API Security**:
   - Enable CORS for your domain only
   - Set up API rate limiting
   - Configure SSL/TLS

### 5. Environment Configuration

Update your `.env.local` for production:

```bash
# Use production values
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Add production-specific variables
NODE_ENV=production
```

### 6. Deployment Checklist

- [ ] Supabase project created in production region
- [ ] Database schema migrated successfully
- [ ] RLS policies configured
- [ ] Environment variables set
- [ ] API keys generated and secured
- [ ] Domain configured and verified
- [ ] SSL certificate installed
- [ ] Backup strategy configured

### 7. Testing Production Setup

1. **Database Connection Test**:
   ```javascript
   // Test Supabase connection
   const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
   ```

2. **Authentication Test**:
   ```javascript
   // Test user registration and login
   const { user, error } = await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'testpassword123'
   });
   ```

3. **API Test**:
   ```javascript
   // Test API endpoints
   const response = await fetch('/api/test');
   const data = await response.json();
   ```

### 8. Monitoring & Logging

1. **Set up monitoring**:
   - Database performance monitoring
   - API response times
   - Error tracking

2. **Configure logging**:
   - Request/response logging
   - Error logging
   - Performance metrics

### 9. Backup & Recovery

1. **Database backups**:
   - Configure automated backups
   - Test restore procedures
   - Set up point-in-time recovery

2. **Environment backup**:
   - Save all environment variables securely
   - Document configuration steps
   - Create recovery procedures

### 10. Performance Optimization

1. **Database optimization**:
   - Analyze query performance
   - Optimize indexes
   - Configure connection pooling

2. **Application optimization**:
   - Enable caching where appropriate
   - Optimize asset delivery
   - Configure CDN if needed

---

**Next Steps**: หลังจากตั้งค่า Supabase production เสร็จสิ้น ผมจะช่วยคุณ:

1. สร้าง deployment scripts อัตโนมัติ
2. ตั้งค่า CI/CD pipeline
3. ทดสอบระบบ production ทั้งหมด
4. ปรับแต่ง performance และ security
5. สร้าง monitoring และ alerting system

ต้องการให้ผมเริ่มต้นที่ขั้นตอนไหนก่อนครับ? 🚀