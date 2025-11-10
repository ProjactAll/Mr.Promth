# 📋 รายการที่ต้องแก้ไข/ปรับปรุง Mr.Prompt

## 🎨 1. โลโก้ (Logo)

### ปัญหา:
- ❌ โลโก้ปัจจุบันไม่สวย ดูเหมือนตัว M ธรรมดา
- ❌ ไม่มีเอกลักษณ์

### แก้ไข:
- ✅ ออกแบบโลโก้ใหม่ให้สวยงาม มีเอกลักษณ์
- ✅ ใช้โลโก้เดียวกันทั้งภาษาไทยและอังกฤษ
- ✅ เพิ่มโลโก้ในหน้า Login

---

## 🌍 2. รองรับหลายภาษา (Internationalization - i18n)

### เพิ่ม:
- ✅ ระบบเลือกภาษา (Language Switcher)
  - ภาษาไทย (TH)
  - English (EN)
  - อื่นๆ (ถ้าต้องการ)
- ✅ Dropdown เลือกภาษาที่ Header
- ✅ แปลทุกหน้า (Landing, Login, Dashboard, etc.)
- ✅ บันทึกภาษาที่เลือกใน localStorage

---

## 🔗 3. GitHub Integration

### เพิ่ม:
- ✅ เชื่อมต่อกับ GitHub Account
- ✅ นำเข้าโปรเจกต์จาก GitHub Repository
- ✅ แก้ไขไฟล์และ Push กลับไป GitHub
- ✅ แสดงรายการ Repositories
- ✅ Clone, Pull, Push ผ่าน UI

### Features:
- Import from GitHub
- Edit in Mr.Prompt
- Commit & Push changes
- View commit history

---

## 🔐 4. หน้า Login

### ปัญหา:
- ❌ ว่างเกินไป ดูไม่น่าสนใจ
- ❌ ไม่มีโลโก้

### แก้ไข:
- ✅ เพิ่มโลโก้ที่สวยงาม
- ✅ เพิ่มภาพพื้นหลัง หรือ gradient
- ✅ ปรับ UI ให้ดูทันสมัย น่าใช้งาน
- ✅ เพิ่ม tagline หรือข้อความสั้นๆ

---

## ✍️ 5. เนื้อหาการขาย (Landing Page Copy)

### ปัญหา:
- ❌ โม้เยอะเกินไป
- ❌ ไม่จริงใจ

### แก้ไข:
- ✅ ลดเนื้อหาลง เขียนแบบเรียบง่าย
- ✅ เน้นความจริงใจ ไม่โม้
- ✅ เน้นจุดเด่นที่ทำได้จริง:
  - สร้างเว็บด้วย AI
  - ดูการทำงานแบบ Real-time
  - ใช้งานง่าย ไม่ต้องเขียนโค้ด
  - เชื่อมต่อ GitHub ได้
- ✅ ลบข้อความที่เกินจริง

---

## 👨‍💼 6. หน้า Admin/Dashboard

### ปัญหาปัจจุบัน:
- ❌ แสดง "7 Agents" ชัดเจนเกินไป
- ❌ UI ยังไม่เหมือน Manus (ไม่มี Layout 3 columns)

### แก้ไข:
- ✅ ซ่อน "7 Agents" ให้ทำงานเบื้องหลัง
- ✅ แสดงแค่ Progress bar + Terminal
- ✅ ปรับ Layout ให้เป็น 3 columns:
  - Sidebar (Tasks, Search, Library)
  - Chat Interface (กลาง)
  - Terminal Window (ขวา - แสดงเมื่อจำเป็น)

---

## 🎨 7. UI/UX ทั่วไป

### แก้ไข:
- ✅ ปรับสีให้สดใสขึ้น ไม่ชืด
- ✅ ขนาดตัวหนังสือให้เหมาะสม ไม่โตเกินไป
- ✅ Spacing และ Layout ให้สวยงาม
- ✅ Animations ที่นุ่มนวล

---

## 📊 8. Features เพิ่มเติม

### เพิ่ม:
- ✅ **Workspace System**
  - แยก folder ตาม user_id
  - แต่ละ user มี workspace เป็นของตัวเอง
  
- ✅ **Terminal Access for Users**
  - User สามารถใช้ terminal ได้เอง
  - รันคำสั่งจริงๆ
  - ปุ่มเปิด/ปิด terminal

- ✅ **Real-time Progress**
  - แสดงความคืบหน้าแบบ Manus
  - Executing command
  - Viewing terminal
  - Browsing

- ✅ **Collapsible Sections**
  - ขยาย/ย่อ sections ได้
  - ดู logs ละเอียดได้

---

## 🔧 9. Technical Improvements

### แก้ไข:
- ✅ ปรับ Color Scheme ให้สดใส
- ✅ ใช้ Sarabun font สำหรับภาษาไทย
- ✅ Responsive design ทุกหน้า
- ✅ Performance optimization

---

## 📝 สรุป Priority

### 🔴 **High Priority (ต้องทำก่อน)**
1. โลโก้ใหม่
2. หน้า Login ปรับปรุง
3. เนื้อหา Landing Page (ลดการโม้)
4. GitHub Integration

### 🟡 **Medium Priority**
5. รองรับหลายภาษา (i18n)
6. Dashboard Layout 3 columns
7. UI/UX ปรับปรุงทั่วไป

### 🟢 **Low Priority (ทำทีหลัง)**
8. Features เพิ่มเติม
9. Performance optimization

---

## 📌 หมายเหตุ

- **แก้รอบเดียว** - รวมทุกอย่างแล้วแก้พร้อมกัน
- **ไม่ต้องโม้** - เขียนเนื้อหาจริงใจ ตรงไปตรงมา
- **ค่อยๆ เติม** - ไม่ต้องทำทุกอย่างพร้อมกัน
- **เน้นที่ใช้งานได้จริง** - ไม่ใช่แค่สวย

---

**อัปเดตล่าสุด:** 2025-11-07 22:46 GMT+7


---

## 🆕 10. ลบข้อความโม้ใน Dashboard

### ลบออก:
- ❌ "เปลี่ยนไอเดียให้เป็นเว็บไซต์พร้อมใช้งานในไม่กี่นาที"
- ❌ "Mr.Promth จัดการทุกขั้นตอนตั้งแต่ขยายความต้องการ วางโครงสร้างระบบ พัฒนาโค้ด ไปจนถึงพร้อม deploy ด้วยเอเจนต์ 7 ตัวที่ทำงานต่อเนื่องแบบอัตโนมัติ"

### แทนที่ด้วย:
- ✅ ข้อความสั้นๆ เรียบง่าย ไม่โม้

---

## 💬 11. ปุ่มแชท/พรอมท์ - เพิ่ม Features

### ปัจจุบัน:
- ❌ แค่ textarea ธรรมดา
- ❌ ไม่มีปุ่มแนบไฟล์
- ❌ ไม่มีเลือก GitHub
- ❌ ไม่มีสลับโหมด

### เพิ่ม:
- ✅ **ปุ่มแนบไฟล์** (📎 Attach files)
- ✅ **อัพโหลดไฟล์** (Upload from computer)
- ✅ **เลือก GitHub Repository** (Import from GitHub)
- ✅ **สลับโหมด:**
  - 🤖 **Agent Mode** - ใช้ 7 agents สร้างเว็บ (ซับซ้อน)
  - 💬 **Chat Mode** - คุยธรรมดา (ถาม-ตอบ)
  - ⚡ **Auto Mode** - ให้ AI เลือกโหมดเอง

### UI:
```
┌─────────────────────────────────────────────┐
│ [Agent] [Chat] [Auto]  📎 📁 🔗            │
│                                             │
│  พิมพ์ข้อความหรือคำสั่งที่นี่...            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎨 12. แก้ไขสีทั้งหมด

### ❌ สีที่ไม่ใช้:
- **สีชมพู (Pink)** - ลบออกทั้งหมด
- **สีหวานเหว่ว** - เปลี่ยนทั้งหมด

### ✅ สีที่ใช้:
- 🔵 **สีฟ้า (Blue)** - Primary color
  - Buttons, Links, Highlights
  
- 🟣 **สีม่วง (Purple)** - Secondary color
  - Accents, Gradients
  
- ⚪ **สีขาว (White)** - Background
  - Main background, Cards
  
- ⚫ **สีเทา (Gray)** - Text & Borders
  - Body text, Borders, Muted text

### Color Palette:
```css
--primary: #3B82F6 (Blue)
--secondary: #8B5CF6 (Purple)
--background: #FFFFFF (White)
--foreground: #1F2937 (Dark Gray)
--muted: #6B7280 (Gray)
--border: #E5E7EB (Light Gray)
```

---

## 👨‍💼 13. หน้า Admin (พื้นฐาน)

### เส้นทาง:
- `/admin` - Admin Panel

### Features ที่ต้องมี:

#### 👥 User Management
- ดูรายชื่อ users ทั้งหมด (Table)
- แก้ไข user (Edit)
- ลบ user (Delete)
- ดู user details (View)
- ค้นหา user (Search)

#### 🔑 API Keys Management
- ดู API keys ที่ใช้งาน
- เพิ่ม API key ใหม่
- ลบ API key
- ซ่อน/แสดง key

#### 📝 Logs Viewer
- ดู system logs
- ดู error logs
- Filter logs (Error, Warning, Info)
- ค้นหา logs
- Download logs

#### ⚙️ System Settings
- เปิด/ปิด features
- ตั้งค่า GitHub integration
- ตั้งค่า Supabase
- ตั้งค่าพื้นฐานอื่นๆ

### ❌ ไม่ต้องมี:
- กราฟ (Charts)
- Analytics ซับซ้อน
- Dashboard แฟนซี
- Real-time monitoring

### UI Layout:
```
┌─────────────────────────────────────────┐
│ Admin Panel                    [Logout] │
├─────────┬───────────────────────────────┤
│ Users   │ User List                     │
│ API Keys│ - user1@example.com           │
│ Logs    │ - user2@example.com           │
│ Settings│ - user3@example.com           │
│         │ [Add] [Edit] [Delete]         │
└─────────┴───────────────────────────────┘
```

---

## 📊 สรุป Priority (อัปเดต)

### 🔴 **High Priority (ทำก่อน)**
1. โลโก้ใหม่
2. แก้ไขสีทั้งหมด (ลบชมพู)
3. หน้า Login ปรับปรุง
4. ลบข้อความโม้ใน Dashboard
5. เนื้อหา Landing Page (ลดการโม้)

### 🟡 **Medium Priority**
6. ปุ่มแชท - เพิ่ม Features (แนบไฟล์, GitHub, สลับโหมด)
7. GitHub Integration
8. หน้า Admin (พื้นฐาน)
9. รองรับหลายภาษา (i18n)

### 🟢 **Low Priority (ทำทีหลัง)**
10. Dashboard Layout 3 columns
11. Features เพิ่มเติม
12. Performance optimization

---

**อัปเดตล่าสุด:** 2025-11-07 22:50 GMT+7
**รายการทั้งหมด:** 13 หมวด
