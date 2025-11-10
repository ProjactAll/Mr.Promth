# 🗄️ Supabase Setup Instructions

**สำหรับ**: Mr.Promth Production  
**วันที่**: November 10, 2025

---

## 📋 ขั้นตอนการ Setup

### 1. เข้าสู่ Supabase Dashboard

1. เปิด browser ไปที่: https://abngmijjtqfkecvfedcs.supabase.co
2. Login ด้วย account ของคุณ
3. เลือก project "Mr.Promth Production"

---

### 2. Run Initial Schema Migration

1. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
2. คลิก **New Query**
3. Copy เนื้อหาจากไฟล์ `packages/backend/supabase/schema.sql`
4. Paste ลงใน SQL Editor
5. คลิก **Run** (หรือกด Ctrl+Enter)
6. ตรวจสอบว่าไม่มี error

---

### 3. Run Extension Integration Migration

1. ยังอยู่ใน **SQL Editor**
2. คลิก **New Query** อีกครั้ง
3. Copy เนื้อหาจากไฟล์ `packages/backend/supabase/migrations/008_extension_integration.sql`
4. Paste ลงใน SQL Editor
5. คลิก **Run**
6. ตรวจสอบว่าตารางใหม่ถูกสร้างแล้ว:
   - `extension_sessions`
   - `screenshots`
   - `dom_snapshots`
   - `analysis_results`
   - `extension_settings`
   - `extension_logs`

---

### 4. Create Storage Bucket

1. ไปที่ **Storage** (เมนูด้านซ้าย)
2. คลิก **New bucket**
3. ตั้งค่าดังนี้:
   - **Name**: `screenshots`
   - **Public**: ❌ (ปิด - ต้อง authenticate)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/png, image/jpeg, image/webp`
4. คลิก **Create bucket**

---

### 5. Setup Storage Policies

1. ยังอยู่ใน **Storage**
2. คลิกที่ bucket `screenshots`
3. ไปที่ tab **Policies**
4. คลิก **New Policy**
5. Copy เนื้อหาจากไฟล์ `packages/backend/supabase/migrations/009_storage_setup.sql`
6. Paste และ Run แต่ละ policy ทีละอัน:
   - Policy สำหรับ SELECT
   - Policy สำหรับ INSERT
   - Policy สำหรับ UPDATE
   - Policy สำหรับ DELETE

---

### 6. Verify Row Level Security (RLS)

1. ไปที่ **Table Editor** (เมนูด้านซ้าย)
2. ตรวจสอบว่าตารางทั้งหมดมี **RLS enabled** (มีไอคอน 🔒):
   - ✅ profiles
   - ✅ projects
   - ✅ files
   - ✅ logs
   - ✅ api_keys
   - ✅ github_connections
   - ✅ extension_sessions
   - ✅ screenshots
   - ✅ dom_snapshots
   - ✅ analysis_results
   - ✅ extension_settings
   - ✅ extension_logs

---

### 7. Verify Database Functions

1. ไปที่ **Database** > **Functions**
2. ตรวจสอบว่ามี functions ต่อไปนี้:
   - ✅ `update_updated_at_column()`
   - ✅ `handle_new_user()`
   - ✅ `get_user_by_api_key()`

---

### 8. Test Database Connection

1. เปิด terminal
2. ไปที่ directory `packages/backend`
3. รัน command:
   ```bash
   pnpm test:db
   ```
4. ตรวจสอบว่า connection สำเร็จ

---

## ✅ Checklist

- [ ] Run `schema.sql` สำเร็จ
- [ ] Run `008_extension_integration.sql` สำเร็จ
- [ ] สร้าง bucket `screenshots` แล้ว
- [ ] Setup storage policies แล้ว
- [ ] RLS enabled ทุกตาราง
- [ ] Database functions ครบถ้วน
- [ ] Test connection สำเร็จ

---

## 🔍 การตรวจสอบ

### ตรวจสอบตาราง

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**ผลลัพธ์ที่ควรได้**:
- analysis_results
- api_keys
- dom_snapshots
- extension_logs
- extension_sessions
- extension_settings
- files
- github_connections
- logs
- profiles
- projects
- screenshots

### ตรวจสอบ RLS Policies

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### ตรวจสอบ Storage Bucket

```sql
SELECT * FROM storage.buckets WHERE name = 'screenshots';
```

---

## 🆘 Troubleshooting

### Error: "relation already exists"

**สาเหตุ**: ตารางถูกสร้างไปแล้ว  
**วิธีแก้**: ข้ามขั้นตอนนั้นไป หรือใช้ `DROP TABLE IF EXISTS` ก่อน

### Error: "permission denied"

**สาเหตุ**: ไม่มีสิทธิ์ในการสร้างตาราง  
**วิธีแก้**: ตรวจสอบว่าใช้ Service Role Key หรือเปล่า

### Error: "function does not exist"

**สาเหตุ**: Function `update_updated_at_column()` ยังไม่ถูกสร้าง  
**วิธีแก้**: Run `schema.sql` ก่อน `008_extension_integration.sql`

---

## 📚 เอกสารเพิ่มเติม

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## ✨ เสร็จสิ้น!

หลังจากทำตามขั้นตอนทั้งหมดแล้ว database ของคุณพร้อมใช้งานแล้ว! 🎉

**Next Step**: ไปที่ Phase 2 - Backend API Development
