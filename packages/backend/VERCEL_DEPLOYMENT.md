# คู่มือการ Deploy โปรเจกต์ Mr.Prompt บน Vercel

## ภาพรวม

โปรเจกต์ Mr.Prompt เป็น Next.js Application ที่สามารถ deploy บน Vercel ได้อย่างง่ายดาย คู่มือนี้จะแนะนำทุกขั้นตอนตั้งแต่เริ่มต้นจนถึงการ deploy สำเร็จ

## ข้อกำหนดเบื้องต้น

1. ✅ GitHub Account
2. ✅ Vercel Account (สมัครฟรีได้ที่ [vercel.com](https://vercel.com))
3. ✅ Supabase Project ที่ตั้งค่าเรียบร้อยแล้ว (ดูคู่มือใน `SUPABASE_SETUP_GUIDE.md`)

## ขั้นตอนการ Deploy

### 1. เตรียม Repository

1. **Push โค้ดขึ้น GitHub** (ถ้ายังไม่ได้ทำ):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **ตรวจสอบไฟล์สำคัญ**:
   - ✅ `package.json` - มี scripts สำหรับ build
   - ✅ `next.config.mjs` - การตั้งค่า Next.js
   - ✅ `.gitignore` - ไม่ควรมี `.env.local` ใน Git

### 2. เชื่อมต่อ Vercel กับ GitHub

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. คลิก **"Add New..."** > **"Project"**
3. เลือก **"Import Git Repository"**
4. เลือก Repository `donlasahachat11-lgtm/mrphomth`
5. คลิก **"Import"**

### 3. ตั้งค่า Environment Variables

ใน Vercel Project Settings, ไปที่ **Settings** > **Environment Variables** และเพิ่มตัวแปรต่อไปนี้:

#### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Site URL (จะได้หลังจาก deploy ครั้งแรก)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

**หมายเหตุ**: 
- ใช้ค่าเดียวกับที่ตั้งไว้ใน `.env.local`
- สำหรับ `NEXT_PUBLIC_SITE_URL` ในครั้งแรกให้ใช้ `http://localhost:3000` ก่อน แล้วจะมาแก้ไขทีหลัง

#### Optional Variables (ถ้ามี)

```env
# API Keys (ถ้ามีการใช้งาน)
STREAMLAKE_API_KEY=your-api-key
VC_API_KEY=your-vanchin-api-key

# Analytics (ถ้าต้องการ)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 4. ตั้งค่า Build & Development Settings

ใน **Build & Development Settings**:

- **Framework Preset**: Next.js (ตรวจจับอัตโนมัติ)
- **Build Command**: `npm run build` (ค่าเริ่มต้น)
- **Output Directory**: `.next` (ค่าเริ่มต้น)
- **Install Command**: `npm install` (ค่าเริ่มต้น)
- **Development Command**: `npm run dev` (ค่าเริ่มต้น)

**Node.js Version**: 18.x (แนะนำ)

### 5. Deploy ครั้งแรก

1. คลิก **"Deploy"**
2. รอจนกว่าการ build จะเสร็จสิ้น (ประมาณ 2-3 นาที)
3. ถ้า build สำเร็จ จะได้ URL เช่น `https://mrphomth.vercel.app`

### 6. อัพเดท Site URL

หลังจาก deploy สำเร็จ:

1. คัดลอก URL ที่ได้จาก Vercel (เช่น `https://mrphomth.vercel.app`)
2. ไปที่ **Settings** > **Environment Variables**
3. แก้ไข `NEXT_PUBLIC_SITE_URL` เป็น URL จริง
4. คลิก **"Redeploy"** เพื่อ deploy ใหม่

### 7. อัพเดท Supabase Authentication URLs

1. ไปที่ Supabase Dashboard > **Authentication** > **URL Configuration**
2. อัพเดท:
   - **Site URL**: `https://mrphomth.vercel.app`
   - **Redirect URLs**: เพิ่ม
     - `https://mrphomth.vercel.app/auth/callback`
     - `https://mrphomth.vercel.app/app/dashboard`

### 8. อัพเดท OAuth Providers (ถ้าใช้งาน)

#### Google OAuth

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. เลือก Project
3. ไปที่ **APIs & Services** > **Credentials**
4. เลือก OAuth 2.0 Client ID ที่สร้างไว้
5. เพิ่ม **Authorized JavaScript origins**:
   - `https://mrphomth.vercel.app`
6. เพิ่ม **Authorized redirect URIs**:
   - `https://xxxxx.supabase.co/auth/v1/callback`
7. คลิก **Save**

#### GitHub OAuth

1. ไปที่ [GitHub OAuth Apps](https://github.com/settings/developers)
2. เลือก OAuth App ที่สร้างไว้
3. อัพเดท:
   - **Homepage URL**: `https://mrphomth.vercel.app`
   - **Authorization callback URL**: `https://xxxxx.supabase.co/auth/v1/callback`
4. คลิก **Update application**

### 9. ทดสอบ Production Deployment

1. เปิดเบราว์เซอร์ไปที่ `https://mrphomth.vercel.app`
2. ทดสอบ:
   - ✅ หน้าแรกโหลดได้
   - ✅ สมัครสมาชิกด้วย Email
   - ✅ Login ด้วย Google
   - ✅ Login ด้วย GitHub
   - ✅ เข้าถึง Dashboard ได้
   - ✅ สร้าง Chat Session ได้
   - ✅ บันทึก Prompt ได้

## การตั้งค่า Custom Domain (Optional)

### เพิ่ม Custom Domain

1. ไปที่ Vercel Project > **Settings** > **Domains**
2. คลิก **"Add"**
3. กรอกชื่อ domain ที่ต้องการ (เช่น `mrprompt.com`)
4. ทำตาม instructions เพื่อตั้งค่า DNS records

### DNS Records ที่ต้องตั้งค่า

สำหรับ `mrprompt.com`:

```
Type: A
Name: @
Value: 76.76.21.21
```

สำหรับ `www.mrprompt.com`:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### อัพเดท URLs หลังจากตั้งค่า Custom Domain

1. **Vercel Environment Variables**:
   - `NEXT_PUBLIC_SITE_URL=https://mrprompt.com`

2. **Supabase Authentication**:
   - Site URL: `https://mrprompt.com`
   - Redirect URLs: `https://mrprompt.com/auth/callback`

3. **Google OAuth**:
   - Authorized origins: `https://mrprompt.com`

4. **GitHub OAuth**:
   - Homepage URL: `https://mrprompt.com`

## Automatic Deployments

Vercel จะ deploy อัตโนมัติทุกครั้งที่:
- ✅ Push ไปที่ `main` branch → Production deployment
- ✅ Push ไปที่ branch อื่น → Preview deployment
- ✅ Open Pull Request → Preview deployment

## การจัดการ Deployments

### ดู Deployment History

1. ไปที่ Vercel Project Dashboard
2. คลิกที่แท็บ **"Deployments"**
3. จะเห็นประวัติการ deploy ทั้งหมด

### Rollback ไปเวอร์ชันก่อนหน้า

1. ไปที่ **Deployments**
2. เลือก deployment ที่ต้องการ rollback
3. คลิก **"..."** > **"Promote to Production"**

### ดู Logs

1. คลิกที่ deployment ที่ต้องการดู
2. ไปที่แท็บ **"Logs"**
3. จะเห็น build logs และ runtime logs

## การแก้ไขปัญหาที่พบบ่อย

### ปัญหา: Build Failed

**สาเหตุ**: 
- Missing dependencies
- TypeScript errors
- Environment variables ไม่ครบ

**วิธีแก้**:
1. ตรวจสอบ build logs ใน Vercel
2. ทดสอบ build ในเครื่อง: `npm run build`
3. แก้ไข errors ที่พบ
4. Push code ใหม่

### ปัญหา: "Failed to fetch" หลัง Deploy

**สาเหตุ**: Environment variables ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ Environment Variables ใน Vercel Settings
2. ตรวจสอบว่า Supabase URL และ Keys ถูกต้อง
3. Redeploy

### ปัญหา: OAuth ไม่ทำงานบน Production

**สาเหตุ**: Redirect URLs ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ Redirect URLs ใน:
   - Supabase Dashboard
   - Google Cloud Console
   - GitHub OAuth App
2. ต้องใช้ Production URL (`https://mrphomth.vercel.app`)

### ปัญหา: 404 Not Found บางหน้า

**สาเหตุ**: Routing configuration ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ `next.config.mjs`
2. ตรวจสอบ file structure ใน `app/` directory
3. ทดสอบในเครื่องก่อน deploy

## Performance Optimization

### Enable Edge Functions (Optional)

สำหรับ API routes ที่ต้องการความเร็วสูง:

```typescript
// app/api/your-route/route.ts
export const runtime = 'edge';
```

### Enable Image Optimization

ใน `next.config.mjs`:

```javascript
const nextConfig = {
  images: {
    domains: ['xxxxx.supabase.co'], // Supabase storage domain
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Enable Caching

ใน API routes:

```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

## Monitoring และ Analytics

### Vercel Analytics

1. ไปที่ Project Settings > **Analytics**
2. Enable **Web Analytics**
3. ดูข้อมูล traffic, performance metrics

### Vercel Speed Insights

1. ติดตั้ง package:
   ```bash
   npm install @vercel/speed-insights
   ```

2. เพิ่มใน `app/layout.tsx`:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/next';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

## Security Best Practices

1. ✅ **ไม่ commit** `.env.local` ลง Git
2. ✅ **ใช้ Environment Variables** ใน Vercel สำหรับ secrets
3. ✅ **Enable HTTPS** (Vercel ทำให้อัตโนมัติ)
4. ✅ **ตั้งค่า CORS** ให้ถูกต้อง
5. ✅ **Enable Rate Limiting** ใน Supabase
6. ✅ **ใช้ Row Level Security (RLS)** ใน Supabase

## เอกสารเพิ่มเติม

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

## การติดต่อสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- เปิด Issue ใน GitHub Repository
- ดู Vercel Support: https://vercel.com/support
