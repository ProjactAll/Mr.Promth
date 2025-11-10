# 🗄️ คำชี้แจงเรื่อง Database สำหรับโปรเจกต์ Mr.Prompt

## ❓ คำถาม: ต้องสร้าง Database ใหม่หรือใช้ของเดิม?

### คำตอบ: **ใช้ Database ของเดิมได้เลยครับ!** ✅

---

## 📊 เหตุผลที่ใช้ Database ของเดิมได้

### 1. Database Schema รองรับการเก็บ API Keys แบบ Multi-Provider อยู่แล้ว

ตาราง `api_keys` ที่มีอยู่มีโครงสร้างดังนี้:

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider VARCHAR(50) NOT NULL,        -- เก็บชื่อ provider (เช่น "vanchin")
  encrypted_key TEXT NOT NULL,          -- เก็บ API key ที่เข้ารหัสแล้ว
  key_hash TEXT NOT NULL,               -- Hash สำหรับตรวจสอบ
  masked_key VARCHAR(20) NOT NULL,      -- แสดงบางส่วนใน UI (เช่น "WW8G...T9g")
  last_used TIMESTAMP,                  -- เวลาใช้งานล่าสุด
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**จุดสำคัญ:**
- คอลัมน์ `provider` สามารถเก็บค่า `"vanchin"` ได้
- คอลัมน์ `encrypted_key` เก็บ API key ที่เข้ารหัสด้วย AES-256-GCM
- โครงสร้างนี้รองรับหลาย providers (OpenAI, Anthropic, VanchinAI, etc.)

### 2. ไม่ต้องเปลี่ยนโครงสร้าง Database

เนื่องจาก VanchinAI ใช้รูปแบบ API key แบบเดียวกับ OpenAI:
- API key เป็น string ธรรมดา
- ไม่มีข้อมูลพิเศษที่ต้องเก็บเพิ่ม
- Endpoint ID (`ep-xxxxx`) จะเก็บเป็นส่วนหนึ่งของ configuration หรือ metadata

### 3. ระบบ Encryption ใช้ได้กับทุก Provider

ระบบเข้ารหัสที่มีอยู่ (`services/ai-gateway/app/services/crypto.py`):
- ใช้ AES-256-GCM encryption
- ไม่ขึ้นกับ provider ใดโดยเฉพาะ
- เข้ารหัส/ถอดรหัสได้กับ API key ทุกประเภท

---

## 🔧 สิ่งที่ต้องทำกับ Database

### ไม่ต้องสร้างใหม่ แต่ต้อง:

#### 1. รัน Migration ที่มีอยู่แล้ว (ครั้งเดียว)
```bash
# ใน Supabase Dashboard > SQL Editor
# รันโค้ดจากไฟล์ database/migrations/001_initial_schema.sql
```

#### 2. เพิ่ม API Keys ของ VanchinAI เข้าไป
เมื่อผู้ใช้ Login แล้ว สามารถเพิ่ม API keys ผ่าน UI:
- Provider: `vanchin`
- API Key: `WW8GMBSTec_u...` (จะถูกเข้ารหัสอัตโนมัติ)
- Endpoint ID: เก็บใน metadata หรือ config

---

## 📝 แผนการปรับแก้สำหรับ VanchinAI

### ส่วนที่ต้องแก้ไข:

#### 1. Backend (AI Gateway)
```python
# services/ai-gateway/app/api/routes.py

# เพิ่ม VanchinAI provider
if provider not in {"openai", "anthropic", "vanchin"}:
    raise HTTPException(...)

# เพิ่มฟังก์ชันสำหรับ VanchinAI
async def _vanchin_completion(api_key: str, chat_request: ChatRequest, settings: Settings):
    # ใช้ OpenAI SDK
    from openai import OpenAI
    
    client = OpenAI(
        base_url=settings.vanchin_api_base,
        api_key=api_key
    )
    
    response = client.chat.completions.create(
        model=chat_request.model,  # endpoint ID จะส่งมาจาก Frontend
        messages=[msg.model_dump() for msg in chat_request.messages],
        temperature=chat_request.temperature,
        max_tokens=chat_request.max_tokens,
    )
    
    return response.model_dump()
```

#### 2. Configuration
```python
# services/ai-gateway/app/core/config.py

class Settings(BaseSettings):
    # ... existing fields ...
    
    vanchin_api_base: str = Field(
        default="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        env="VANCHIN_API_BASE"
    )
```

#### 3. Environment Variables
```bash
# services/ai-gateway/.env

VANCHIN_API_BASE="https://vanchin.streamlake.ai/api/gateway/v1/endpoints"
```

---

## 🔑 การจัดการ Endpoint IDs (14 Agents)

### ปัญหา:
VanchinAI มี 14 agents โดยแต่ละ agent มี:
- API Key แยกกัน
- Endpoint ID แยกกัน (`ep-xxxxx`)

### วิธีแก้ไข:

#### Option 1: เก็บแยกใน Database (แนะนำ)
เพิ่มแต่ละ agent เป็น API key แยก:

| user_id | provider | encrypted_key | masked_key | metadata |
|---------|----------|---------------|------------|----------|
| user-1 | vanchin | [encrypted] | WW8G...T9g | `{"endpoint_id": "ep-lpvcnv-...", "name": "Agent 1"}` |
| user-1 | vanchin | [encrypted] | 3gZ9...zrk | `{"endpoint_id": "ep-j9pysc-...", "name": "Agent 2"}` |
| ... | ... | ... | ... | ... |

**ข้อดี:**
- ผู้ใช้เลือก agent ได้จาก UI
- แต่ละ agent มีสถิติการใช้งานแยก
- ปลอดภัย (แต่ละ key เข้ารหัสแยก)

#### Option 2: เก็บ Mapping ใน Config (ง่ายกว่า)
เก็บ API key เดียว แล้วมี mapping ของ endpoint IDs:

```python
# config หรือ database
VANCHIN_ENDPOINTS = {
    "agent-1": "ep-lpvcnv-1761467347624133479",
    "agent-2": "ep-j9pysc-1761467653839114083",
    # ... 12 agents อื่น
}
```

**ข้อดี:**
- ง่ายกว่า
- ใช้ API key เดียว

**ข้อเสีย:**
- ไม่ flexible
- ถ้า key หนึ่งหมดอายุ ต้องแก้ทั้งหมด

### คำแนะนำ: ใช้ Option 1 ✅

เพราะ:
- มี 14 agents ที่ต่างกัน
- แต่ละ agent มี API key แยก
- ผู้ใช้อาจต้องการเลือก agent เอง

---

## 🗃️ Database Metadata สำหรับ VanchinAI

### เพิ่มคอลัมน์ metadata (มีอยู่แล้ว!)

ตาราง `api_keys` มีคอลัมน์ `metadata` อยู่แล้วหรือไม่? ถ้าไม่มี ต้องเพิ่ม:

```sql
-- ถ้ายังไม่มีคอลัมน์ metadata
ALTER TABLE api_keys ADD COLUMN metadata JSONB DEFAULT '{}';
```

### ใช้ metadata เก็บข้อมูลเพิ่มเติม:

```json
{
  "endpoint_id": "ep-lpvcnv-1761467347624133479",
  "agent_name": "Agent 1",
  "description": "General purpose AI assistant"
}
```

### ตัวอย่างการ Insert:

```sql
INSERT INTO api_keys (user_id, provider, encrypted_key, key_hash, masked_key, metadata)
VALUES (
  'user-uuid',
  'vanchin',
  'encrypted-api-key-here',
  'hash-here',
  'WW8G...T9g',
  '{"endpoint_id": "ep-lpvcnv-1761467347624133479", "agent_name": "Agent 1"}'::jsonb
);
```

---

## 📦 สรุป: ไม่ต้องสร้าง Database ใหม่!

### ✅ ใช้ Database ของเดิมได้เลย เพราะ:

1. **โครงสร้างรองรับอยู่แล้ว**
   - ตาราง `api_keys` มี `provider` column
   - รองรับหลาย providers

2. **ระบบ Encryption ใช้ได้**
   - AES-256-GCM ทำงานกับ key ทุกประเภท

3. **Metadata รองรับข้อมูลเพิ่มเติม**
   - เก็บ endpoint ID ได้
   - เก็บชื่อ agent ได้

### 🔧 สิ่งที่ต้องทำ:

1. **รัน Migration** (ครั้งเดียว)
2. **แก้ไขโค้ด Backend** เพื่อรองรับ VanchinAI
3. **เพิ่ม API Keys** ผ่าน UI (14 agents)
4. **ทดสอบ**

---

## 🎯 Next Steps

1. ✅ ชี้แจงเรื่อง Database (เสร็จแล้ว)
2. ⏳ แก้ไขโค้ด Backend สำหรับ VanchinAI + OpenAI SDK
3. ⏳ แก้ไข Frontend UI สำหรับเลือก agent
4. ⏳ สร้างเอกสารและตัวอย่างการใช้งาน
5. ⏳ ทดสอบและ deploy

---

**สรุป:** Database ที่มีอยู่ใช้ได้เลยครับ ไม่ต้องสร้างใหม่ แค่รัน migration และเพิ่ม API keys ของ VanchinAI เข้าไป! 🚀
