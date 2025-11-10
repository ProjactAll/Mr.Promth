# คู่มือการตั้งค่า Supabase สำหรับโปรเจกต์ Mr.Prompt

## ภาพรวม

โปรเจกต์นี้ใช้ Supabase เป็น Backend-as-a-Service สำหรับ:
- **Authentication**: ระบบ Login/Signup (Email, Google, GitHub)
- **Database**: PostgreSQL สำหรับเก็บข้อมูล users, chats, prompts, projects
- **Storage**: เก็บไฟล์ที่ upload
- **Row Level Security (RLS)**: ความปลอดภัยระดับแถว

## ขั้นตอนการตั้งค่า

### 1. สร้าง Supabase Project

1. ไปที่ [https://supabase.com](https://supabase.com)
2. คลิก "Start your project" หรือ "New Project"
3. เข้าสู่ระบบด้วย GitHub account
4. สร้าง Organization ใหม่ (ถ้ายังไม่มี)
5. คลิก "New Project" และกรอกข้อมูล:
   - **Name**: mrprompt (หรือชื่อที่ต้องการ)
   - **Database Password**: ตั้งรหัสผ่านที่แข็งแรง (เก็บไว้ให้ดี)
   - **Region**: เลือก Southeast Asia (Singapore) เพื่อความเร็ว
   - **Pricing Plan**: เลือก Free tier (สำหรับเริ่มต้น)
6. คลิก "Create new project"
7. รอประมาณ 2-3 นาทีจนกว่า Project จะพร้อมใช้งาน

### 2. คัดลอก API Keys และ URL

1. ไปที่ **Settings** > **API** ในเมนูด้านซ้าย
2. คัดลอกค่าต่อไปนี้:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (ยาวมาก)
   - **service_role key**: `eyJhbGc...` (ยาวมาก - ใช้สำหรับ server-side เท่านั้น)

### 3. อัพเดท Environment Variables

สร้างหรือแก้ไขไฟล์ `.env.local` ในโฟลเดอร์หลักของโปรเจกต์:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**หมายเหตุ**: แทนที่ค่า `xxxxx` และ `eyJhbGc...` ด้วยค่าจริงจาก Supabase

### 4. รัน Database Migrations

1. เปิด Supabase Dashboard
2. ไปที่ **SQL Editor** ในเมนูด้านซ้าย
3. คลิก "+ New query"
4. คัดลอกเนื้อหาจากไฟล์ `database/migrations/001_initial_schema.sql`
5. วางลงใน SQL Editor และคลิก "Run"
6. ทำซ้ำกับไฟล์ `database/migrations/002_agent_chain_schema.sql`

หรือใช้ Supabase CLI:

```bash
# ติดตั้ง Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref xxxxx

# Run migrations
supabase db push
```

### 5. ตั้งค่า Authentication Providers

#### Email/Password Authentication (เปิดใช้งานอยู่แล้ว)

1. ไปที่ **Authentication** > **Providers**
2. ตรวจสอบว่า "Email" เปิดใช้งานอยู่
3. ตั้งค่า:
   - **Enable Email Confirmations**: เปิดหรือปิดตามต้องการ
   - **Enable Email Change Confirmations**: แนะนำให้เปิด
   - **Secure Email Change**: แนะนำให้เปิด

#### Google OAuth

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. ไปที่ **APIs & Services** > **Credentials**
4. คลิก **Create Credentials** > **OAuth 2.0 Client ID**
5. เลือก **Application type**: Web application
6. ตั้งค่า:
   - **Name**: Mr.Prompt
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `https://xxxxx.supabase.co`
   - **Authorized redirect URIs**: 
     - `https://xxxxx.supabase.co/auth/v1/callback`
7. คัดลอก **Client ID** และ **Client Secret**
8. กลับไปที่ Supabase Dashboard > **Authentication** > **Providers**
9. เลือก **Google** และกรอก:
   - **Client ID**: จาก Google Cloud Console
   - **Client Secret**: จาก Google Cloud Console
10. คลิก **Save**

#### GitHub OAuth

1. ไปที่ [GitHub Settings](https://github.com/settings/developers)
2. คลิก **OAuth Apps** > **New OAuth App**
3. กรอกข้อมูล:
   - **Application name**: Mr.Prompt
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://xxxxx.supabase.co/auth/v1/callback`
4. คลิก **Register application**
5. คัดลอก **Client ID**
6. คลิก **Generate a new client secret** และคัดลอก **Client Secret**
7. กลับไปที่ Supabase Dashboard > **Authentication** > **Providers**
8. เลือก **GitHub** และกรอก:
   - **Client ID**: จาก GitHub
   - **Client Secret**: จาก GitHub
9. คลิก **Save**

### 6. ตั้งค่า Site URL และ Redirect URLs

1. ไปที่ **Authentication** > **URL Configuration**
2. ตั้งค่า:
   - **Site URL**: `http://localhost:3000` (สำหรับ development)
   - **Redirect URLs**: เพิ่ม:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/app/dashboard`

สำหรับ Production:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: 
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/app/dashboard`

### 7. ทดสอบการเชื่อมต่อ

1. รีสตาร์ท Next.js development server:
   ```bash
   npm run dev
   ```

2. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

3. ทดสอบ:
   - คลิก "สมัครสมาชิก" และลองสมัครด้วย Email
   - ลอง Login ด้วย Google
   - ลอง Login ด้วย GitHub

### 8. ตรวจสอบ Database

1. ไปที่ **Table Editor** ใน Supabase Dashboard
2. ตรวจสอบว่ามีตารางต่อไปนี้:
   - `api_keys`
   - `chat_sessions`
   - `messages`
   - `prompts`
   - `user_profiles`
   - `projects` (ถ้ารัน migration ที่ 2 แล้ว)
   - `agent_executions` (ถ้ารัน migration ที่ 2 แล้ว)

## การแก้ไขปัญหาที่พบบ่อย

### ปัญหา: "Failed to fetch" เมื่อสมัครสมาชิก

**สาเหตุ**: 
- Supabase URL หรือ API Key ไม่ถูกต้อง
- ไม่ได้รีสตาร์ท Next.js server หลังจากแก้ไข .env.local

**วิธีแก้**:
1. ตรวจสอบว่า `.env.local` มีค่าที่ถูกต้อง
2. รีสตาร์ท Next.js server: กด `Ctrl+C` แล้วรัน `npm run dev` ใหม่

### ปัญหา: "Invalid API key" หรือ "Invalid JWT"

**สาเหตุ**: API Key หมดอายุหรือไม่ถูกต้อง

**วิธีแก้**:
1. ไปที่ Supabase Dashboard > Settings > API
2. คัดลอก API Keys ใหม่
3. อัพเดทใน `.env.local`
4. รีสตาร์ท server

### ปัญหา: Google/GitHub OAuth ไม่ทำงาน

**สาเหตุ**: 
- Redirect URL ไม่ถูกต้อง
- Client ID/Secret ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ Redirect URL ใน Google Cloud Console / GitHub OAuth App
2. ต้องเป็น: `https://xxxxx.supabase.co/auth/v1/callback`
3. ตรวจสอบ Client ID และ Secret ใน Supabase Dashboard

### ปัญหา: "relation does not exist" error

**สาเหตุ**: ยังไม่ได้รัน database migrations

**วิธีแก้**:
1. รัน migrations ตามขั้นตอนที่ 4

## สำหรับ Production Deployment

### Vercel

1. ไปที่ [Vercel Dashboard](https://vercel.com)
2. Import โปรเจกต์จาก GitHub
3. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ใช้ URL จาก Vercel)
4. Deploy

5. อัพเดท Supabase Authentication URLs:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: เพิ่ม `https://your-app.vercel.app/auth/callback`

6. อัพเดท Google/GitHub OAuth Redirect URLs:
   - เพิ่ม `https://xxxxx.supabase.co/auth/v1/callback`

## เอกสารเพิ่มเติม

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Setup](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)

## การติดต่อสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- เปิด Issue ใน GitHub Repository
- ดู Supabase Discord: https://discord.supabase.com
