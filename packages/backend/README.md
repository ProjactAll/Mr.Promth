# 🚀 Mr.Prompt - AI-Powered Full-Stack Project Generator

**Mr.Prompt** is a revolutionary AI-powered platform that generates complete, production-ready web projects from a single natural language prompt. Describe your project, and our autonomous AI agents will handle everything from backend code and database schemas to frontend components and deployment.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/donlasahachat6/mrpromth)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

---

## ✨ Features

### 🤖 **AI-Powered Code Generation**
- Utilizes **19 advanced AI models** with intelligent load balancing
- Generates high-quality, production-ready, human-readable code
- Supports multiple AI providers for optimal performance

### 🏗️ **Full-Stack Projects**
- Complete **Next.js** projects with TypeScript
- Backend APIs with proper error handling
- Database schemas and migrations
- Frontend components with Tailwind CSS
- Authentication and authorization
- Rate limiting and security headers

### 🎯 **Autonomous AI Agents**
A team of **7 specialized AI agents** work together to build your project:

1. **Agent 1: Prompt Analysis** - Understands your requirements and extracts key features
2. **Agent 2: Requirements Expansion** - Creates detailed technical specifications
3. **Agent 3: Backend Generator** - Generates API routes, database schemas, and server logic
4. **Agent 4: Frontend Generator** - Builds React components, pages, and styling
5. **Agent 5: Testing & QA** - Generates automated tests and validates code quality
6. **Agent 6: Deployment** - Deploys your project to Vercel with proper configuration
7. **Agent 7: Monitoring** - Sets up health checks, logging, and monitoring

### 📊 **Real-time Workflow**
- Live progress tracking with **Server-Sent Events (SSE)**
- Detailed logs for each agent's work
- Visual progress indicators
- Real-time error handling and recovery

### 💻 **Integrated Code Editor**
- **Monaco Editor** with syntax highlighting
- File explorer with tree view
- Save changes to database
- GitHub sync integration
- Code review and suggestions

### 💬 **Intelligent Chat Interface**
- Context-aware conversations
- Project modification through natural language
- Remembers active project and conversation history
- Multi-session support

### 🔒 **Production-Ready Security**
- Row Level Security (RLS) with Supabase
- Rate limiting per user
- Input validation and sanitization
- Security headers (CSP, HSTS, etc.)
- Authentication with Supabase Auth

### 📦 **Downloadable & Deployable**
- Download projects as ZIP files
- One-click deployment to Vercel
- GitHub repository integration
- Environment variable management

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later)
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account
- (Optional) A [Vercel](https://vercel.com/) account for deployment

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/donlasahachat6/mrpromth.git
   cd mrpromth
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Optional: AI Gateway (if using custom AI provider)
   AI_GATEWAY_API_KEY=your-ai-gateway-key
   
   # Optional: Vercel (for deployment feature)
   VERCEL_TOKEN=your-vercel-token
   VERCEL_TEAM_ID=your-vercel-team-id
   
   # Optional: GitHub (for repository sync)
   GITHUB_TOKEN=your-github-token
   ```

4. **Run database migrations:**
   
   Go to your Supabase dashboard → SQL Editor, and run:
   ```bash
   supabase/migrations/001_create_project_files.sql
   ```

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 How to Use

### Method 1: Quick Generate (Recommended for beginners)

1. Go to the **`/generate`** page
2. Enter your **project name** (e.g., "My Todo App")
3. Write a **detailed prompt** describing your project:
   ```
   Create a todo list app with user authentication, 
   the ability to add, edit, and delete todos, 
   and mark them as complete. Use a modern UI with dark mode support.
   ```
4. Click **"Generate Project"**
5. Watch the real-time progress as the AI agents build your project
6. Once completed:
   - **Download** your project as a ZIP file
   - **View** the generated code in the integrated editor
   - **Deploy** to Vercel with one click

### Method 2: Chat Interface (Recommended for advanced users)

1. Go to the **`/app/chat/chat_new`** page
2. Start a conversation with the AI
3. Describe your project in natural language
4. The AI will generate the project and remember the context
5. You can then ask for modifications:
   ```
   Add a search feature to filter todos
   Change the color scheme to blue
   Add export to CSV functionality
   ```

---

## 🏗️ Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS + Shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **AI Models** | 19 models with load balancing |
| **Code Editor** | Monaco Editor |
| **Deployment** | Vercel |
| **Package Manager** | pnpm |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (Next.js App Router + React + Tailwind CSS)                │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      API Layer                               │
│  • /api/workflow - Project generation                        │
│  • /api/chat - Intelligent chat                              │
│  • /api/projects - Project management                        │
│  • /api/files - File operations                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Agent Orchestrator                         │
│  Coordinates 7 specialized AI agents                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    AI Gateway                                │
│  Load balances across 19 AI models                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Supabase Backend                            │
│  • PostgreSQL Database                                       │
│  • Row Level Security (RLS)                                  │
│  • Real-time subscriptions                                   │
│  • Authentication                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run integration tests
./test-system.sh
```

### Manual Testing Checklist

- [ ] User authentication (signup, login, logout)
- [ ] Project generation from prompt
- [ ] Real-time progress tracking
- [ ] Code editor functionality
- [ ] File saving to database
- [ ] Chat-based project modification
- [ ] ZIP file download
- [ ] Vercel deployment

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
2. **Import the repository to Vercel**
3. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
4. **Deploy!**

The project is configured for automatic deployment on every push to the `main` branch.

---

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Agent System](docs/AGENTS.md)
- [Database Schema](docs/DATABASE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Priority Tasks](PRIORITY_TASKS.md)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

Please read our [Contributing Guide](CONTRIBUTING.md) for more details.

---

## 📊 Project Status

| Feature | Status |
|---------|--------|
| Core Generation | ✅ Complete |
| 7 AI Agents | ✅ Complete |
| Code Editor | ✅ Complete |
| Chat Interface | ✅ Complete |
| File Management | ✅ Complete |
| Context Awareness | ✅ Complete |
| Database Migration | ✅ Complete |
| Build System | ✅ Complete |
| UI/UX Polish | 🔄 In Progress |
| Documentation | 🔄 In Progress |
| Testing Coverage | 🔄 In Progress |

**Production Readiness: 85%**

---

## 🐛 Known Issues

- TypeScript types for `project_files` table need regeneration from Supabase
- Some API routes use dynamic rendering (expected behavior)
- UI improvements needed for mobile responsiveness

See [Issues](https://github.com/donlasahachat6/mrpromth/issues) for a complete list.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Vercel](https://vercel.com/) - Platform for frontend developers
- [Shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code

---

## 📧 Contact

For questions, suggestions, or support:

- **GitHub Issues**: [Create an issue](https://github.com/donlasahachat6/mrpromth/issues)
- **Email**: mrphomth@example.com

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Built with ❤️ by the Mr.Prompt team**
