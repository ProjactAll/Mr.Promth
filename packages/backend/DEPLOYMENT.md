# 🚀 Production Deployment Guide

คู่มือการ Deploy ระบบ Mr.Prompt ขึ้น Production

## 📋 Prerequisites

- Node.js 18+ และ pnpm
- Supabase Project (สำหรับ Database และ Authentication)
- Vercel Account (แนะนำสำหรับ Deploy)
- OpenAI API Key

## 🔧 การเตรียมการ

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd mrphomth
pnpm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` จาก `.env.example`:

```bash
cp .env.example .env.local
```

แก้ไขค่าต่างๆ ใน `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. ตั้งค่า Supabase Database

#### 3.1 สร้าง Database Schema

รัน migrations ทั้งหมดใน `supabase/migrations/` ตามลำดับ:

```bash
# ใน Supabase SQL Editor
-- Run each migration file in order:
-- 001_initial_schema.sql
-- 002_api_keys_and_prompts.sql
-- 003_rbac_and_settings.sql
-- 004_activity_logs.sql
-- 005_rooms_and_terminal.sql
```

#### 3.2 ตั้งค่า Authentication

1. ไปที่ Supabase Dashboard → Authentication → Settings
2. เปิดใช้งาน Email Authentication
3. ตั้งค่า Site URL เป็น `https://your-domain.com`
4. เพิ่ม Redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (สำหรับ development)

#### 3.3 ตั้งค่า Row Level Security (RLS)

RLS จะถูกสร้างอัตโนมัติจาก migrations แล้ว ตรวจสอบว่า:
- ✅ RLS เปิดใช้งานในทุก tables
- ✅ Policies ครบถ้วนสำหรับ SELECT, INSERT, UPDATE, DELETE

### 4. สร้าง Admin User แรก

หลังจาก Deploy แล้ว:

1. สมัครสมาชิกผ่านหน้าเว็บ
2. ไปที่ Supabase Dashboard → Table Editor → profiles
3. แก้ไข role ของ user เป็น `admin`
4. ตั้งค่า `is_active = true`

## 🌐 Deploy to Vercel

### Option 1: Deploy ผ่าน Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: Deploy ผ่าน GitHub Integration

1. Push code ไปยัง GitHub
2. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
3. คลิก "Import Project"
4. เลือก Repository
5. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
6. คลิก "Deploy"

## 🔒 Security Checklist

- [ ] เปลี่ยน Supabase Service Role Key
- [ ] ตั้งค่า CORS ใน Supabase
- [ ] เปิดใช้งาน RLS ในทุก tables
- [ ] ตรวจสอบ API Rate Limits
- [ ] ตั้งค่า Custom Domain และ SSL
- [ ] เปิดใช้งาน 2FA สำหรับ Supabase และ Vercel
- [ ] ตรวจสอบ Environment Variables ไม่ถูก commit

## 📊 Monitoring และ Maintenance

### Database Monitoring

1. ไปที่ Supabase Dashboard → Database → Monitoring
2. ตรวจสอบ:
   - Query Performance
   - Connection Pool
   - Storage Usage

### Application Monitoring

1. ใช้ Vercel Analytics
2. ตรวจสอบ Logs ใน Vercel Dashboard
3. ติดตั้ง Error Tracking (เช่น Sentry)

### Backup

1. Supabase มี automatic backups
2. Export database เป็นประจำ:
   ```bash
   pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
   ```

## 🔄 Updates และ Migrations

### การอัปเดตระบบ

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Run new migrations in Supabase
# (check supabase/migrations/ for new files)

# Deploy
vercel --prod
```

### การ Rollback

```bash
# Rollback to previous deployment
vercel rollback
```

## 🐛 Troubleshooting

### ปัญหา: ไม่สามารถ Login ได้

- ตรวจสอบ Supabase Site URL และ Redirect URLs
- ตรวจสอบ Environment Variables
- ตรวจสอบ Browser Console สำหรับ errors

### ปัญหา: Database Connection Error

- ตรวจสอบ Supabase URL และ Keys
- ตรวจสอบว่า Supabase Project ยัง active
- ตรวจสอบ RLS Policies

### ปัญหา: Admin Page ไม่สามารถเข้าถึงได้

- ตรวจสอบ user role ใน profiles table
- ตรวจสอบ middleware.ts
- ตรวจสอบว่า is_active = true

## 📞 Support

หากมีปัญหาหรือคำถาม:
- GitHub Issues: <your-repo-url>/issues
- Documentation: <your-docs-url>

## 📝 License

[Your License]

---

**หมายเหตุ:** คู่มือนี้อัปเดตล่าสุด: 2025-11-08
