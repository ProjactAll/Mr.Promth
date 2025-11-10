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
