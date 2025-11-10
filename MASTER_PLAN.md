
# 🚀 Mr.Promth Production - Master Development Plan

**Version**: 1.0.0  
**Date**: November 10, 2025  
**Goal**: ผสาน `mrpromth-main` และ `manus-helper` ให้เป็น monorepo ที่สมบูรณ์แบบ, พร้อมสำหรับ AI-driven development และการ deploy สู่ production

---

## 🤖 AI Workflow Guide

**สำหรับ AI Agent**:
1.  **Clone Repository**: เริ่มต้นด้วยการ clone โปรเจคจาก GitHub
2.  **Follow the Plan**: ทำตาม task list ใน `MASTER_PLAN.md` นี้ทีละข้อ
3.  **Check Off Tasks**: เมื่อทำ task เสร็จ ให้แก้ `[ ]` เป็น `[x]` ในไฟล์นี้
4.  **Commit Progress**: Commit การเปลี่ยนแปลงของคุณหลังทำแต่ละ section หรือกลุ่ม task ที่เกี่ยวข้องกันเสร็จ (เช่น `git commit -m "feat(backend): setup supabase database"`)
5.  **Handle Interruptions**: ถ้าการทำงานถูกขัดจังหวะ, ให้กลับมาอ่านไฟล์นี้เพื่อดูว่าทำถึง task ไหนแล้ว และทำต่อจากจุดนั้น
6.  **Seek Clarification**: ถ้า task ไหนไม่ชัดเจน, ให้ถามผู้ใช้ (human) เพื่อขอข้อมูลเพิ่มเติม

---

## 📝 Phase 0: Project Initialization & Monorepo Setup

- [ ] 0.1. **Clone Repository**: `gh repo clone ProjactAll/Mr.Promth mrpromth-production`
- [ ] 0.2. **Navigate to Project**: `cd mrpromth-production`
- [ ] 0.3. **Initialize Git**: ตรวจสอบว่า Git ถูก initialize และเชื่อมต่อกับ remote ถูกต้อง
- [ ] 0.4. **Create Monorepo Structure**: สร้าง directories `packages/backend` และ `packages/extension`
- [ ] 0.5. **Initialize pnpm Workspace**: สร้างไฟล์ `pnpm-workspace.yaml` และกำหนด paths ของ packages
- [ ] 0.6. **Create Root `package.json`**: `pnpm init`, เพิ่ม script สำหรับ dev, build, test ทั้ง workspace
- [ ] 0.7. **Install Root Dependencies**: `pnpm add -w -D typescript prettier eslint turbo`
- [ ] 0.8. **Configure Turborepo**: `npx turbo gen config` และตั้งค่า pipeline (build, test, dev, lint)
- [ ] 0.9. **Configure ESLint & Prettier**: สร้าง `.eslintrc.json` และ `.prettierrc.json` ที่ root
- [ ] 0.10. **Create `tsconfig.base.json`**: สร้าง base TypeScript config สำหรับ monorepo

---

## 🌐 Phase 1: Backend Setup (`packages/backend`)

### Part 1.1: Supabase Project Setup
- [ ] 1.1.1. **แจ้งผู้ใช้**: ขอให้ผู้ใช้สร้าง Supabase project และเตรียม credentials (URL, anon key, service role key)
- [ ] 1.1.2. **Run Initial Schema Migration**: นำ schema เดิมของ `mrpromth-main` (`supabase/migrations`) มารันใน SQL Editor
- [ ] 1.1.3. **Create New `extension_integration` Migration**: สร้าง migration script ใหม่สำหรับ 6 ตารางที่เพิ่มเข้ามา
- [ ] 1.1.4. **Run `extension_integration` Migration**: นำ migration ใหม่ไปรันใน SQL Editor
- [ ] 1.1.5. **Enable Row Level Security (RLS)**: ตรวจสอบว่า RLS ถูกเปิดใช้งานสำหรับทุกตาราง
- [ ] 1.1.6. **Create RLS Policies**: สร้าง policies สำหรับตารางใหม่ทั้งหมด (select, insert, update, delete)
- [ ] 1.1.7. **Create Storage Bucket**: สร้าง bucket ชื่อ `screenshots` และตั้งค่า access policies
- [ ] 1.1.8. **Create Database Functions**: สร้าง function `handle_new_user()` และ `get_user_by_api_key()`

### Part 1.2: Backend Code Integration
- [ ] 1.2.1. **Copy `mrpromth-main` code**: ย้ายไฟล์ทั้งหมดจาก `mrpromth-main` มาที่ `packages/backend`
- [ ] 1.2.2. **Update `package.json`**: แก้ไข `name` เป็น `@mrpromth/backend` และปรับ scripts ให้ทำงานใน workspace
- [ ] 1.2.3. **Create `.env.local`**: สร้างจาก `.env.example` และแจ้งผู้ใช้ให้กรอก credentials
- [ ] 1.2.4. **Install Dependencies**: `pnpm --filter @mrpromth/backend install`
- [ ] 1.2.5. **Update `next.config.mjs`**: ตรวจสอบว่า config ถูกต้องสำหรับ monorepo
- [ ] 1.2.6. **Update `tsconfig.json`**: ให้ extends จาก `tsconfig.base.json`

### Part 1.3: Vanchin AI Integration (แทนที่ OpenAI)
- [ ] 1.3.1. **Refactor Vanchin Client**: ย้าย `vanchin-client.ts` ไปที่ `packages/backend/lib/ai/`
- [ ] 1.3.2. **Create AI Gateway Adapter**: สร้าง adapter ที่ทำให้ Vanchin API มี interface เหมือน OpenAI
- [ ] 1.3.3. **Replace OpenAI calls**: ค้นหาทุกจุดที่เรียกใช้ `OpenAI` และแทนที่ด้วย Vanchin adapter
- [ ] 1.3.4. **Update Environment Variables**: เพิ่ม `VANCHIN_API_KEY` และ `VANCHIN_ENDPOINT_ID` ใน `.env.example`
- [ ] 1.3.5. **Test Vanchin Connection**: สร้าง test script เพื่อทดสอบการเชื่อมต่อ Vanchin API

### Part 1.4: Extension API Endpoints
- [ ] 1.4.1. **Create `/api/extension/auth`**: Endpoint สำหรับ extension authentication และ API key generation
- [ ] 1.4.2. **Create `/api/extension/capture`**: Endpoint สำหรับรับ screenshot และ DOM data
- [ ] 1.4.3. **Create `/api/extension/analyze`**: Endpoint สำหรับส่งข้อมูลไปให้ AI Agent #1 วิเคราะห์
- [ ] 1.4.4. **Add API Route Security**: ใช้ Supabase Auth เพื่อป้องกัน API routes

---

## 🧩 Phase 2: Extension Setup (`packages/extension`)

### Part 2.1: Code Refactoring & Integration
- [ ] 2.1.1. **Copy `manus-helper` code**: ย้ายไฟล์ทั้งหมดจาก `manus-helper` มาที่ `packages/extension`
- [ ] 2.1.2. **Create `package.json`**: `pnpm init`, ตั้งชื่อ `@mrpromth/extension`, เพิ่ม scripts (dev, build)
- [ ] 2.1.3. **Install Dependencies**: `pnpm --filter @mrpromth/extension install`
- [ ] 2.1.4. **Setup Build Process**: ใช้ Vite หรือ esbuild เพื่อ build extension
- [ ] 2.1.5. **Update `manifest.json`**: แก้ไข `name`, `version`, `description`, และ `permissions`

### Part 2.2: Manus Helper Feature Integration
- [ ] 2.2.1. **Integrate Loading Detector**: นำ `LoadingDetector` class มาใช้ใน `background.js`
- [ ] 2.2.2. **Integrate Clickable Element Detector**: สร้าง content script ใหม่สำหรับ `isClickable`
- [ ] 2.2.3. **Integrate Image Fetcher**: นำ `handleFetchImage` มาใช้ใน `background.js`
- [ ] 2.2.4. **Integrate Cookie Auto-Accept**: นำ `CookieAcceptor` class มาใช้ใน content script
- [_] 2.2.5. **Integrate CSS Selector Generator**: สร้าง utility function สำหรับ `generateSelector`

### Part 2.3: Backend Communication
- [ ] 2.3.1. **Create API Client**: สร้าง `api-client.ts` สำหรับสื่อสารกับ backend API
- [ ] 2.3.2. **Implement Authentication Flow**: ใน `popup.js`, เพิ่ม logic สำหรับ login/logout
- [ ] 2.3.3. **Implement Capture Flow**: สร้าง function `captureAndSendData()` เพื่อส่ง screenshot/DOM
- [ ] 2.3.4. **Implement Real-time Updates**: ใช้ WebSocket หรือ SSE เพื่อรับ status จาก backend

---

## ⚙️ Phase 3: Testing & QA

- [ ] 3.1. **Unit Test Backend**: เขียน unit test สำหรับ API routes และ AI agents
- [ ] 3.2. **Unit Test Extension**: เขียน unit test สำหรับ utility functions
- [ ] 3.3. **Integration Test**: ทดสอบการทำงานร่วมกันระหว่าง backend และ extension
- [ ] 3.4. **E2E Test**: สร้าง test case สำหรับ workflow ทั้งหมด (login -> capture -> analyze -> result)

---

## 📚 Phase 4: Documentation

- [ ] 4.1. **Create Root `README.md`**: อธิบายภาพรวมโปรเจค, monorepo structure, และวิธี setup
- [ ] 4.2. **Create Backend `README.md`**: อธิบายวิธี setup, run, และ test backend
- [ ] 4.3. **Create Extension `README.md`**: อธิบายวิธี build, load, และ debug extension
- [ ] 4.4. **Create `ARCHITECTURE.md`**: สร้าง diagram และอธิบายสถาปัตยกรรมทั้งหมด
- [ ] 4.5. **Create `AI_WORKFLOW.md`**: เอกสารนี้สำหรับ AI เพื่อให้รู้ว่าต้องทำอะไรต่อ

---

## 🚀 Phase 5: Deployment

### Part 5.1: Backend Deployment (Vercel)
- [ ] 5.1.1. **แจ้งผู้ใช้**: ขอให้ผู้ใช้เชื่อมต่อ GitHub repo กับ Vercel
- [ ] 5.1.2. **Configure Vercel Project**: ตั้งค่า Root Directory เป็น `packages/backend`
- [ ] 5.1.3. **Set Environment Variables**: นำค่าจาก `.env.local` ไปตั้งใน Vercel
- [ ] 5.1.4. **Trigger Deployment**: Push to `main` branch เพื่อ deploy
- [ ] 5.1.5. **Test Production URL**: ตรวจสอบว่า backend ทำงานถูกต้อง

### Part 5.2: Extension Deployment (Chrome Web Store)
- [ ] 5.2.1. **Build for Production**: `pnpm --filter @mrpromth/extension build`
- [ ] 5.2.2. **Create ZIP file**: บีบอัด `dist` directory
- [ ] 5.2.3. **แจ้งผู้ใช้**: ขอให้ผู้ใช้ upload ZIP file ไปยัง Chrome Web Store Developer Dashboard
- [ ] 5.2.4. **Fill in Store Listing**: เตรียม screenshots, description, privacy policy

---

## 📦 Phase 6: Final Commit & Handover

- [ ] 6.1. **Final Code Review**: ตรวจสอบโค้ดทั้งหมดว่า clean และมี comments ครบถ้วน
- [ ] 6.2. **Final Documentation Check**: ตรวจสอบว่าเอกสารทั้งหมดทันสมัยและถูกต้อง
- [ ] 6.3. **Commit All Changes**: `git add .` และ `git commit -m "feat: initial complete version of Mr.Promth Production"`
- [ ] 6.4. **Push to GitHub**: `git push origin main`
- [ ] 6.5. **แจ้งผู้ใช้**: ส่งมอบโปรเจคและอธิบายวิธีการใช้งาน AI Workflow

---

*This plan contains **50+ tasks**. I will now proceed with each phase and provide more detailed sub-tasks as I work through them. This master plan will be the single source of truth for the project.*
