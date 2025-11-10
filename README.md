# 🚀 Mr.Promth Production

**AI-Powered Screenshot-to-Code Platform**

Transform any website screenshot into production-ready code with the power of AI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [AI Workflow](#ai-workflow)
- [Contributing](#contributing)

---

## 🎯 Overview

Mr.Promth Production is a monorepo containing a full-stack web application and browser extension that work together to:

1. **Capture** screenshots and DOM structure from any website
2. **Analyze** the captured data using AI agents
3. **Generate** production-ready code (React, Next.js, Tailwind CSS)
4. **Deploy** the generated project to Vercel

### Project Structure

```
mrpromth-production/
├── packages/
│   ├── backend/          # Next.js web application
│   └── extension/        # Chrome extension
├── docs/                 # Documentation
├── MASTER_PLAN.md        # Development roadmap
└── AI_WORKFLOW.md        # Guide for AI agents
```

---

## ✨ Features

### Backend (`@mrpromth/backend`)
- **7 AI Agents** working in sequence to generate complete projects
- **Supabase** for authentication, database, and file storage
- **Vanchin AI** integration (19 models with 20M free tokens)
- **Real-time** project generation tracking
- **GitHub integration** for code repository management
- **Vercel deployment** automation

### Extension (`@mrpromth/extension`)
- **Smart screenshot capture** with loading detection
- **DOM structure analysis** with clickable element detection
- **Automatic cookie banner dismissal**
- **Cross-origin image fetching**
- **Real-time communication** with backend

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Browser        │
│  Extension      │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐      ┌──────────────┐
│  Next.js        │◄────►│  Supabase    │
│  Backend        │      │  Database    │
└────────┬────────┘      └──────────────┘
         │
         │ AI Processing
         ▼
┌─────────────────┐
│  Vanchin AI     │
│  (19 Models)    │
└─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Supabase** account
- **Vercel** account (for deployment)
- **GitHub** account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ProjactAll/Mr.Promth.git
   cd Mr.Promth
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migrations in `packages/backend/supabase/migrations/`
   - Copy your credentials

4. **Configure environment**
   ```bash
   cd packages/backend
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

5. **Start development**
   ```bash
   # From root directory
   pnpm dev

   # Or individually
   pnpm backend:dev
   pnpm extension:dev
   ```

---

## 💻 Development

### Backend Development

```bash
cd packages/backend
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm test         # Run tests
```

### Extension Development

```bash
cd packages/extension
pnpm dev          # Build in watch mode
pnpm build        # Build for production
```

Then load the extension in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/dist/`

---

## 🌐 Deployment

### Backend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set Root Directory to `packages/backend`
3. Add environment variables from `.env.local`
4. Deploy!

### Extension (Chrome Web Store)

1. Build for production: `pnpm extension:build`
2. Create a ZIP file of `packages/extension/dist/`
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## 🤖 AI Workflow

This project is designed to be developed collaboratively with AI agents. See [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) for detailed instructions on how AI should work with this codebase.

**For AI Agents:**
- Follow the tasks in [`MASTER_PLAN.md`](./MASTER_PLAN.md)
- Check off completed tasks with `[x]`
- Commit progress after each major section
- If interrupted, resume from the last unchecked task

---

## 📚 Documentation

- [`MASTER_PLAN.md`](./MASTER_PLAN.md) - Complete development roadmap
- [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) - Guide for AI agents
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - System architecture
- [`docs/SETUP_GUIDE.md`](./docs/SETUP_GUIDE.md) - Detailed setup instructions
- [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md) - Deployment instructions

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **Manus AI** for the browser automation technology
- **Vanchin AI** for providing free AI model access
- **Supabase** for the backend infrastructure
- **Vercel** for hosting and deployment

---

**Built with ❤️ by Mr.Promth Team**
