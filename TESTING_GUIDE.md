# Mr.Promth Production - Testing Guide

คู่มือการทดสอบระบบทั้งหมด

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Testing](#backend-testing)
4. [Extension Testing](#extension-testing)
5. [Integration Testing](#integration-testing)
6. [Manual Testing](#manual-testing)

---

## Prerequisites

### 1. Environment Setup

สร้างไฟล์ `.env.local` ใน `packages/backend/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abngmijjtqfkecvfedcs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vanchin AI
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints
VANCHIN_AGENT_AGENT1_KEY=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VANCHIN_AGENT_AGENT2_KEY=3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk
# ... (ครบ 39 keys)
```

### 2. Install Dependencies

```bash
# Root
pnpm install

# Backend
cd packages/backend
pnpm install

# Extension
cd packages/extension
pnpm install
```

---

## Database Setup

### 1. Run Migrations

#### Option A: Manual (Recommended)

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก project: `abngmijjtqfkecvfedcs`
3. ไปที่ **SQL Editor**
4. Copy ไฟล์ `packages/backend/supabase/FULL_MIGRATION.sql`
5. Paste และ Run

#### Option B: Using Supabase CLI

```bash
cd packages/backend

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref abngmijjtqfkecvfedcs

# Push migrations
supabase db push
```

### 2. Create Storage Bucket

1. ไปที่ **Storage** section ใน Supabase Dashboard
2. คลิก **New bucket**
3. ตั้งชื่อ: `screenshots`
4. เลือก **Private** (not public)
5. คลิก **Create bucket**

### 3. Setup Storage Policies

Run SQL ใน SQL Editor:

```sql
-- Copy from packages/backend/supabase/migrations/009_storage_setup.sql
```

### 4. Create Test User

Run SQL ใน SQL Editor:

```sql
-- Create test user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test@mrpromth.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  '{"display_name": "Test User"}'::jsonb
);
```

---

## Backend Testing

### 1. Start Development Server

```bash
cd packages/backend
pnpm dev
```

Server จะรันที่ `http://localhost:3000`

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}
```

### 3. Test Extension Auth Endpoint

#### Login

```bash
curl -X POST http://localhost:3000/api/extension/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mrpromth.com",
    "password": "testpassword123"
  }'
```

Expected response:
```json
{
  "api_key": "mrp_...",
  "user_id": "...",
  "user": {
    "id": "...",
    "email": "test@mrpromth.com",
    "display_name": "Test User"
  }
}
```

Save `api_key` สำหรับใช้ในการทดสอบต่อไป

#### Verify API Key

```bash
curl -X GET http://localhost:3000/api/extension/auth \
  -H "X-API-Key: mrp_..."
```

Expected response:
```json
{
  "valid": true,
  "user_id": "...",
  "user": { ... }
}
```

### 4. Test Capture Endpoint

```bash
curl -X POST http://localhost:3000/api/extension/capture \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mrp_..." \
  -d '{
    "screenshot": "data:image/png;base64,iVBORw0KGgo...",
    "url": "https://example.com",
    "dom": {
      "tag": "body",
      "children": []
    },
    "clickable": [],
    "metadata": {
      "width": 1920,
      "height": 1080
    }
  }'
```

Expected response:
```json
{
  "screenshot_id": "...",
  "storage_url": "https://...",
  "session_id": "..."
}
```

### 5. Test Analyze Endpoint

```bash
curl -X POST http://localhost:3000/api/extension/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mrp_..." \
  -d '{
    "screenshot_id": "...",
    "analysis_type": "quick"
  }'
```

Expected response:
```json
{
  "analysis_id": "...",
  "results": { ... },
  "suggestions": [ ... ],
  "confidence_score": 0.75,
  "processing_time": 5000
}
```

### 6. Run Automated Tests

```bash
cd packages/backend

# Install test dependencies
pnpm add -D @jest/globals jest ts-jest

# Run tests
pnpm test
```

---

## Extension Testing

### 1. Build Extension

```bash
cd packages/extension

# Development build (with watch)
pnpm dev

# Production build
pnpm build
```

### 2. Load Extension in Chrome

1. เปิด Chrome
2. ไปที่ `chrome://extensions/`
3. เปิด **Developer mode** (toggle ขวาบน)
4. คลิก **Load unpacked**
5. เลือกโฟลเดอร์ `packages/extension/dist`

### 3. Test Extension Features

#### Test 1: Login

1. คลิก extension icon
2. กรอก email: `test@mrpromth.com`
3. กรอก password: `testpassword123`
4. คลิก **Login**

Expected: แสดง main screen พร้อม user info

#### Test 2: Analyze DOM

1. เปิดเว็บไซต์ใดๆ (เช่น https://example.com)
2. คลิก extension icon
3. คลิก **Analyze DOM Only**

Expected: แสดง status "DOM analysis complete!"

#### Test 3: Capture & Analyze

1. เปิดเว็บไซต์ใดๆ
2. คลิก extension icon
3. คลิก **Capture & Analyze**

Expected:
- แสดง loading screen
- Upload screenshot สำเร็จ
- แสดง analysis results

#### Test 4: View History

1. คลิก extension icon
2. คลิก **View History**

Expected: แสดง status พร้อมจำนวน screenshots

#### Test 5: Logout

1. คลิก extension icon
2. คลิก **Logout**

Expected: กลับไปที่ login screen

### 4. Debug Extension

#### View Console Logs

**Popup Console:**
1. Right-click extension icon
2. เลือก **Inspect popup**
3. ดู Console tab

**Background Console:**
1. ไปที่ `chrome://extensions/`
2. หา Mr.Promth Extension
3. คลิก **Inspect views: background page**

**Content Script Console:**
1. เปิด DevTools (F12) ในหน้าเว็บ
2. ดู Console tab
3. หา messages จาก "Mr.Promth Extension"

---

## Integration Testing

### End-to-End Flow

#### Flow 1: Complete Capture & Analysis

1. **Setup:**
   - Backend รันอยู่ที่ `http://localhost:3000`
   - Extension โหลดใน Chrome แล้ว
   - Login แล้ว

2. **Steps:**
   - เปิด https://tailwindcss.com
   - คลิก extension icon
   - คลิก "Capture & Analyze"
   - รอ processing (5-10 วินาที)

3. **Verify:**
   - ✅ Screenshot ถูก upload
   - ✅ DOM structure ถูก extract
   - ✅ Clickable elements ถูก detect
   - ✅ AI analysis สำเร็จ
   - ✅ Suggestions ถูก generate

4. **Check Database:**
   ```sql
   -- ใน Supabase SQL Editor
   SELECT * FROM extension_sessions ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM screenshots ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM dom_snapshots ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 1;
   ```

#### Flow 2: History Viewing

1. Capture หลายๆ screenshots (3-5 screenshots)
2. คลิก "View History"
3. Verify: แสดงจำนวนถูกต้อง

#### Flow 3: Session Persistence

1. Capture screenshot
2. ปิด popup
3. เปิด popup อีกครั้ง
4. Verify: ยังคง login อยู่

---

## Manual Testing

### Checklist

#### Backend API

- [ ] `/api/extension/auth` POST - Login สำเร็จ
- [ ] `/api/extension/auth` POST - Reject invalid credentials
- [ ] `/api/extension/auth` GET - Verify valid API key
- [ ] `/api/extension/auth` GET - Reject invalid API key
- [ ] `/api/extension/capture` POST - Upload screenshot สำเร็จ
- [ ] `/api/extension/capture` POST - Save DOM snapshot
- [ ] `/api/extension/capture` GET - Get screenshots
- [ ] `/api/extension/analyze` POST - Quick analysis สำเร็จ
- [ ] `/api/extension/analyze` POST - Full analysis สำเร็จ
- [ ] `/api/extension/analyze` GET - Get analysis results

#### Extension

- [ ] Login สำเร็จ
- [ ] Logout สำเร็จ
- [ ] API key ถูกเก็บใน chrome.storage
- [ ] DOM analyzer ทำงานได้
- [ ] Screenshot capture ทำงานได้
- [ ] Upload ไป backend สำเร็จ
- [ ] แสดง loading state
- [ ] แสดง error messages
- [ ] แสดง success messages

#### Database

- [ ] Tables ถูกสร้างครบ
- [ ] RLS policies ทำงานได้
- [ ] Triggers ทำงานได้
- [ ] Functions ทำงานได้
- [ ] Storage bucket ถูกสร้าง
- [ ] Storage policies ทำงานได้

#### AI Agents

- [ ] Agent 1 ทำงานได้
- [ ] Agent 2 ทำงานได้
- [ ] Vanchin API keys ใช้งานได้
- [ ] Load balancing ทำงานได้
- [ ] Error handling ทำงานได้

---

## Common Issues

### Issue 1: Backend ไม่สามารถเชื่อมต่อ Supabase

**Solution:**
- ตรวจสอบ `.env.local` มี credentials ครบ
- ตรวจสอบ Supabase project ยังทำงานอยู่
- ตรวจสอบ internet connection

### Issue 2: Extension ไม่สามารถ login

**Solution:**
- ตรวจสอบ backend รันอยู่
- ตรวจสอบ API_BASE_URL ถูกต้อง
- ตรวจสอบ test user ถูกสร้างใน database
- ดู console errors

### Issue 3: Screenshot upload ล้มเหลว

**Solution:**
- ตรวจสอบ storage bucket ถูกสร้างแล้ว
- ตรวจสอบ storage policies ถูกต้อง
- ตรวจสอบ API key valid
- ดู backend logs

### Issue 4: AI analysis timeout

**Solution:**
- เพิ่ม timeout ใน fetch request
- ตรวจสอบ Vanchin API keys ใช้งานได้
- ลอง quick analysis แทน full analysis
- ดู backend logs

---

## Performance Testing

### Metrics to Track

1. **API Response Time:**
   - `/api/extension/auth`: < 500ms
   - `/api/extension/capture`: < 2s
   - `/api/extension/analyze` (quick): < 10s
   - `/api/extension/analyze` (full): < 30s

2. **Extension Performance:**
   - DOM analysis: < 1s
   - Screenshot capture: < 500ms
   - Total capture & analyze: < 15s

3. **Database Performance:**
   - Query time: < 100ms
   - Insert time: < 200ms

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test auth endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -T 'application/json' \
  -p test-data.json \
  http://localhost:3000/api/extension/auth
```

---

## Next Steps

1. ✅ Complete manual testing checklist
2. ✅ Fix any bugs found
3. ✅ Run automated tests
4. ✅ Performance optimization
5. ✅ Deploy to production

---

**Last Updated:** 10 November 2025
