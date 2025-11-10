# Mr.Promth Extension

Chrome extension สำหรับ capture screenshot และวิเคราะห์เว็บไซต์ด้วย AI

## Features

- 📸 **Screenshot Capture** - จับภาพหน้าเว็บ
- 🔍 **DOM Analysis** - วิเคราะห์โครงสร้าง HTML
- 🤖 **AI Analysis** - วิเคราะห์ด้วย AI agents
- 🎨 **Code Generation** - สร้าง production-ready code
- 📚 **History** - ดูประวัติการ capture

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build extension
pnpm build

# Build with watch mode
pnpm dev
```

### Load Extension in Chrome

1. เปิด Chrome และไปที่ `chrome://extensions/`
2. เปิด "Developer mode"
3. คลิก "Load unpacked"
4. เลือกโฟลเดอร์ `packages/extension/dist`

## Project Structure

```
extension/
├── src/
│   ├── api-client.ts       # API client สำหรับเชื่อมต่อ backend
│   ├── dom-analyzer.ts     # DOM analysis logic
│   ├── content.ts          # Content script (runs on web pages)
│   ├── background.ts.js    # Background service worker
│   ├── popup.html          # Extension popup UI
│   └── popup-new.ts        # Popup logic
├── manifest.json           # Extension manifest
├── vite.config.js          # Build configuration
└── package.json
```

## API Integration

Extension เชื่อมต่อกับ backend ผ่าน API endpoints:

- `POST /api/extension/auth` - Login และรับ API key
- `GET /api/extension/auth` - Verify API key
- `POST /api/extension/capture` - Upload screenshot
- `GET /api/extension/capture` - Get screenshots
- `POST /api/extension/analyze` - Analyze screenshot
- `GET /api/extension/analyze` - Get analysis results

## Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ extension:

```bash
API_BASE_URL=http://localhost:3000
```

สำหรับ production:

```bash
API_BASE_URL=https://your-backend.vercel.app
```

## Building for Production

```bash
# Build extension
pnpm build

# Output จะอยู่ใน dist/
```

## Chrome Web Store Submission

1. Build extension สำหรับ production
2. สร้าง ZIP file จาก `dist/` folder
3. Upload ไปยัง [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. กรอกข้อมูลและ submit for review

## Troubleshooting

### Extension ไม่โหลด

- ตรวจสอบว่า build เสร็จแล้ว (`dist/` folder มีไฟล์)
- ลอง reload extension ใน `chrome://extensions/`
- ดู console errors ใน extension popup (right-click > Inspect)

### API calls ล้มเหลว

- ตรวจสอบว่า backend รันอยู่
- ตรวจสอบ `API_BASE_URL` ใน `.env`
- ตรวจสอบ API key ใน chrome storage

### Content script ไม่ทำงาน

- Reload หน้าเว็บหลังจากโหลด extension
- ตรวจสอบ console ใน DevTools (F12)
- ตรวจสอบว่า manifest.json มี content_scripts config ถูกต้อง

## License

MIT
