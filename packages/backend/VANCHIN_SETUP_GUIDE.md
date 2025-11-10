# 🚀 คู่มือการตั้งค่า VanchinAI สำหรับโปรเจกต์ Mr.Prompt

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
3. [การตั้งค่า Environment](#การตั้งค่า-environment)
4. [การติดตั้ง Dependencies](#การติดตั้ง-dependencies)
5. [การตั้งค่า Database](#การตั้งค่า-database)
6. [การเพิ่ม API Keys](#การเพิ่ม-api-keys)
7. [การทดสอบ](#การทดสอบ)
8. [การใช้งาน](#การใช้งาน)
9. [Troubleshooting](#troubleshooting)

---

## ภาพรวม

โปรเจกต์นี้ได้รับการปรับแก้เพื่อรองรับ **VanchinAI** โดยใช้ **OpenAI SDK format** แล้ว

### สิ่งที่เปลี่ยนแปลง:

✅ **Backend (AI Gateway)**
- เพิ่ม VanchinAI provider support
- ใช้ OpenAI-compatible API format
- รองรับ streaming responses
- เพิ่ม `_vanchin_completion()` และ `_vanchin_stream()`

✅ **Configuration**
- เพิ่ม `VANCHIN_API_BASE` ใน settings
- อัพเดต `.env.vanchin` template

✅ **Database**
- ใช้ schema เดิมได้เลย (ไม่ต้องเปลี่ยน)
- รองรับ metadata สำหรับ endpoint IDs

✅ **Scripts & Tools**
- สคริปต์เพิ่ม API keys อัตโนมัติ
- สคริปต์ทดสอบ VanchinAI API

---

## ข้อกำหนดเบื้องต้น

### Software Requirements:
- Node.js 18+
- Python 3.10+
- PostgreSQL (ผ่าน Supabase)

### API Keys Required:
- ✅ VanchinAI API Keys (14 คู่) - มีแล้ว
- ⏳ Supabase Project URL & Keys
- ⏳ Encryption Key (สร้างใหม่)
- ⏳ Gateway API Key (สร้างใหม่)

---

## การตั้งค่า Environment

### 1. สร้าง Supabase Project

1. ไปที่ https://supabase.com
2. สร้างโปรเจกต์ใหม่
3. จดบันทึกข้อมูลเหล่านี้:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...`
   - **Service Role Key**: `eyJhbGc...`

### 2. Generate Security Keys

```bash
# สร้าง GATEWAY_API_KEY
openssl rand -base64 32

# สร้าง ENCRYPTION_KEY (32 bytes = 64 hex characters)
openssl rand -hex 32
```

### 3. สร้างไฟล์ `.env.local` (Frontend)

```bash
cd /home/ubuntu/mrphomth
cp .env.local.example .env.local
```

แก้ไข `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. สร้างไฟล์ `.env` (Backend)

```bash
cd services/ai-gateway
cp .env.vanchin .env
```

แก้ไข `services/ai-gateway/.env`:
```env
# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Security
GATEWAY_API_KEY="your-gateway-api-key-from-step-2"
ENCRYPTION_KEY="your-encryption-key-from-step-2"

# VanchinAI
VANCHIN_API_BASE="https://vanchin.streamlake.ai/api/gateway/v1/endpoints"

# Server
PORT=8000
CORS_ORIGINS="http://localhost:3000"
```

---

## การติดตั้ง Dependencies

### Frontend Dependencies

```bash
cd /home/ubuntu/mrphomth
npm install
```

### Backend Dependencies

```bash
cd services/ai-gateway
pip3 install -r requirements.txt
```

**หมายเหตุ:** Backend ใช้ `httpx` สำหรับ HTTP requests (ไม่ใช้ OpenAI SDK ตรงๆ เพื่อความยืดหยุ่น)

---

## การตั้งค่า Database

### 1. รัน Database Migrations

1. เปิด Supabase Dashboard
2. ไปที่ **SQL Editor**
3. สร้าง query ใหม่
4. Copy โค้ดจาก `database/migrations/001_initial_schema.sql`
5. Paste และ Run

### 2. สร้าง User Account

1. รัน Frontend: `npm run dev`
2. เปิด http://localhost:3000
3. ไปที่ `/signup`
4. สร้างบัญชีผู้ใช้

### 3. หา User ID

1. เปิด Supabase Dashboard
2. ไปที่ **Authentication** > **Users**
3. คลิกที่ user ที่สร้าง
4. Copy **User UID** (เช่น `12345678-1234-1234-1234-123456789abc`)

---

## การเพิ่ม API Keys

### วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ) ⭐

```bash
cd /home/ubuntu/mrphomth

# รันสคริปต์ (ใส่ user_id ของคุณ)
python3 scripts/add_vanchin_keys.py <your-user-id>

# ตัวอย่าง:
# python3 scripts/add_vanchin_keys.py 12345678-1234-1234-1234-123456789abc
```

สคริปต์จะสร้างไฟล์ `vanchin_keys_insert.sql` ที่มี SQL statements สำหรับ insert API keys ทั้ง 14 คู่

**จากนั้น:**
1. เปิดไฟล์ `vanchin_keys_insert.sql`
2. Copy เนื้อหาทั้งหมด
3. ไปที่ Supabase Dashboard > SQL Editor
4. Paste และ Run

### วิธีที่ 2: เพิ่มผ่าน UI (ทีละตัว)

1. Login เข้าแอป
2. ไปที่ **Settings** > **API Keys**
3. คลิก **Add API Key**
4. กรอกข้อมูล:
   - **Provider**: `vanchin`
   - **API Key**: `WW8GMBSTec_u...` (จาก `vanchin_keys.json`)
   - **Name**: `Agent 1`
   - **Endpoint ID**: `ep-lpvcnv-...` (metadata)
5. ทำซ้ำสำหรับ 13 agents อื่น

### วิธีที่ 3: Insert SQL ด้วยตนเอง

```sql
-- ตัวอย่าง (ต้องเข้ารหัส API key ก่อน)
INSERT INTO api_keys (user_id, provider, encrypted_key, key_hash, masked_key, metadata)
VALUES (
    'your-user-id',
    'vanchin',
    'encrypted-api-key',
    'key-hash',
    'WW8G...T9g',
    '{"endpoint_id": "ep-lpvcnv-1761467347624133479", "agent_name": "Agent 1"}'::jsonb
);
```

---

## การทดสอบ

### 1. ทดสอบ VanchinAI API แยก

```bash
cd /home/ubuntu/mrphomth
python3 test_vanchin_api.py
```

ควรเห็นผลลัพธ์:
```
🧪 ทดสอบการเชื่อมต่อกับ VanchinAI API
📌 กำลังทดสอบ Agent 1...
✅ การเชื่อมต่อสำเร็จ!
💬 คำตอบจาก AI:
สวัสดีครับ! ผม/ดิฉันคือ AI assistant...
```

### 2. ทดสอบ AI Gateway

```bash
cd services/ai-gateway
uvicorn app.main:app --reload --port 8000
```

เปิดเบราว์เซอร์: http://localhost:8000/health

ควรเห็น:
```json
{"status": "ok"}
```

### 3. ทดสอบ Frontend

```bash
cd /home/ubuntu/mrphomth
npm run dev
```

เปิดเบราว์เซอร์: http://localhost:3000

1. Login เข้าระบบ
2. ไปที่หน้า Chat
3. เลือก Provider: **VanchinAI**
4. เลือก Agent (ถ้ามี UI)
5. ส่งข้อความทดสอบ

---

## การใช้งาน

### การเรียกใช้ VanchinAI API

#### ผ่าน AI Gateway (แนะนำ)

```python
import httpx

# Request to AI Gateway
response = httpx.post(
    "http://localhost:8000/api/v1/chat/completions",
    headers={
        "X-API-Key": "your-gateway-api-key",
        "X-User-Id": "your-user-id",
    },
    json={
        "provider": "vanchin",
        "model": "ep-lpvcnv-1761467347624133479",  # endpoint ID
        "messages": [
            {"role": "system", "content": "You are an AI assistant"},
            {"role": "user", "content": "สวัสดี"}
        ],
        "temperature": 0.7,
        "stream": False
    }
)

print(response.json())
```

#### ตรงไปที่ VanchinAI (ไม่ผ่าน Gateway)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
    api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
)

completion = client.chat.completions.create(
    model="ep-lpvcnv-1761467347624133479",
    messages=[
        {"role": "system", "content": "You are an AI assistant"},
        {"role": "user", "content": "สวัสดี"}
    ],
)

print(completion.choices[0].message.content)
```

### การเลือก Agent

แต่ละ agent มี endpoint ID ต่างกัน:

| Agent | Endpoint ID | Use Case |
|-------|-------------|----------|
| Agent 1 | `ep-lpvcnv-1761467347624133479` | General purpose |
| Agent 2 | `ep-j9pysc-1761467653839114083` | ... |
| ... | ... | ... |

**ในโค้ด:** ส่ง endpoint ID ที่ต้องการใน `model` parameter

---

## Troubleshooting

### ปัญหา: Database connection error

**สาเหตุ:**
- Supabase URL หรือ Service Role Key ผิด
- ยังไม่ได้รัน migrations

**แก้ไข:**
1. ตรวจสอบ `.env` ใน `services/ai-gateway/`
2. ตรวจสอบว่ารัน migrations แล้ว
3. ลองเชื่อมต่อ Supabase ด้วย SQL Editor

### ปัญหา: API key encryption error

**สาเหตุ:**
- `ENCRYPTION_KEY` ไม่ถูกต้อง (ต้องเป็น 32 bytes = 64 hex chars)

**แก้ไข:**
```bash
# สร้าง key ใหม่
openssl rand -hex 32

# ใส่ใน services/ai-gateway/.env
ENCRYPTION_KEY="your-new-key-here"
```

### ปัญหา: CORS error

**สาเหตุ:**
- `CORS_ORIGINS` ไม่ตรงกับ Frontend URL

**แก้ไข:**
```env
# ใน services/ai-gateway/.env
CORS_ORIGINS="http://localhost:3000"
```

### ปัญหา: VanchinAI API returns 401

**สาเหตุ:**
- API key ผิด
- Endpoint ID ผิด

**แก้ไข:**
1. ตรวจสอบ API key ใน `vanchin_keys.json`
2. ตรวจสอบ endpoint ID ที่ส่งไป
3. ทดสอบด้วย `test_vanchin_api.py`

### ปัญหา: Model not found error

**สาเหตุ:**
- ส่ง model name แทน endpoint ID

**แก้ไข:**
```python
# ❌ ผิด
model="gpt-4"

# ✅ ถูก
model="ep-lpvcnv-1761467347624133479"
```

---

## 📚 ไฟล์อ้างอิง

- `DATABASE_EXPLANATION.md` - คำอธิบายเรื่อง Database
- `vanchin_keys.json` - API keys ทั้ง 14 คู่
- `test_vanchin_api.py` - สคริปต์ทดสอบ API
- `scripts/add_vanchin_keys.py` - สคริปต์เพิ่ม keys เข้า DB
- `services/ai-gateway/.env.vanchin` - Template environment variables

---

## 🎯 Checklist

### Setup ครั้งแรก:
- [ ] สร้าง Supabase project
- [ ] Generate security keys
- [ ] สร้าง `.env.local` (Frontend)
- [ ] สร้าง `services/ai-gateway/.env` (Backend)
- [ ] ติดตั้ง dependencies (`npm install`, `pip install`)
- [ ] รัน database migrations
- [ ] สร้าง user account
- [ ] เพิ่ม VanchinAI API keys (14 คู่)

### ทดสอบ:
- [ ] ทดสอบ VanchinAI API (`test_vanchin_api.py`)
- [ ] ทดสอบ AI Gateway (http://localhost:8000/health)
- [ ] ทดสอบ Frontend (http://localhost:3000)
- [ ] ทดสอบส่งข้อความแชท

### Production (Optional):
- [ ] ตั้งค่า environment variables บน hosting platform
- [ ] Build production (`npm run build`)
- [ ] Deploy AI Gateway
- [ ] Deploy Frontend
- [ ] ทดสอบบน production

---

## 🚀 Quick Start (สรุป)

```bash
# 1. Setup environment
cp .env.local.example .env.local
cp services/ai-gateway/.env.vanchin services/ai-gateway/.env
# แก้ไข .env files

# 2. Install dependencies
npm install
cd services/ai-gateway && pip3 install -r requirements.txt

# 3. Run migrations (ใน Supabase SQL Editor)
# Copy จาก database/migrations/001_initial_schema.sql

# 4. Add API keys
python3 scripts/add_vanchin_keys.py <your-user-id>
# จากนั้น run SQL ที่สร้างใน Supabase

# 5. Test
python3 test_vanchin_api.py

# 6. Run services
# Terminal 1: AI Gateway
cd services/ai-gateway
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
npm run dev

# 7. Open browser
# http://localhost:3000
```

---

**หมายเหตุ:** คู่มือนี้ครอบคลุมทุกขั้นตอนสำหรับการใช้งาน VanchinAI กับโปรเจกต์ Mr.Prompt หากมีปัญหาเพิ่มเติม ดูที่ส่วน Troubleshooting หรือตรวจสอบ logs จาก console 🎉
