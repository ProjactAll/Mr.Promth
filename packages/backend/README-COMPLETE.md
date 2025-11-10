# Mr.Prompt - AI-Powered Full-Stack Project Generator

🚀 **Generate production-ready web applications from natural language descriptions**

Mr.Prompt is an advanced AI-powered platform that transforms your ideas into fully functional, production-ready web applications. Simply describe what you want to build, and our 7 autonomous AI agents work together to create your project.

## ✨ Key Features

### 🤖 7 Autonomous AI Agents
1. **Prompt Analysis** - Understands your requirements
2. **Requirements Expansion** - Creates detailed specifications
3. **Backend Generator** - Generates API routes, database schemas, and server logic
4. **Frontend Generator** - Creates UI components and pages
5. **Testing & QA** - Generates comprehensive test suites
6. **Deployment** - Handles automatic deployment to Vercel
7. **Monitoring** - Tracks project health and performance

### 💬 Unified Chat Interface
- Chat with AI to create projects
- Natural language project generation
- Iterative development through conversation
- Multi-language support (Thai & English)

### 💻 In-Browser Code Editor
- Monaco Editor (VS Code in browser)
- Syntax highlighting for multiple languages
- File tree navigation
- Auto-save with Ctrl+S / Cmd+S
- Real-time editing

### 🔄 GitHub Auto-Sync
- One-click GitHub integration
- Auto-commit and push
- Branch management
- Version control

### 🔁 Iterative Development
- Modify existing projects
- Add new features
- Remove unwanted code
- AI-powered refactoring

### 🔍 AI Code Review
- Security vulnerability detection
- Performance analysis
- Best practices checking
- Bug detection
- Code quality scoring (0-100)
- Detailed suggestions

### 📦 Project Templates
- 8 pre-built templates
- Multiple categories (Blog, E-Commerce, Dashboard, SaaS, etc.)
- Difficulty levels (Beginner, Intermediate, Advanced)
- One-click deployment

### ⚡ Real-time Progress Tracking
- Server-Sent Events (SSE)
- Live workflow updates
- Detailed logs
- Progress visualization

### 🔒 Security & Performance
- Rate limiting
- Input validation & sanitization
- Security headers (CSP, HSTS, X-Frame-Options)
- SQL injection prevention
- XSS protection
- Error boundaries

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code editor in browser
- **Radix UI** - Accessible component primitives

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database & authentication
- **Vanchin AI** - 19 AI models with 20M free tokens/month

### AI & Code Generation
- **OpenAI-compatible API** - Multiple AI models
- **Load Balancing** - Automatic model selection
- **Prompt Engineering** - Optimized for code generation

### Deployment
- **Vercel** - Automatic deployment
- **GitHub** - Version control integration
- **Supabase Storage** - File storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Vanchin AI API key (free)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/donlasahachat11-lgtm/mrphomth.git
cd mrphomth
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vanchin AI
VANCHIN_API_KEY=your_vanchin_api_key

# GitHub (optional)
GITHUB_TOKEN=your_github_token

# Vercel (optional)
VERCEL_TOKEN=your_vercel_token
```

4. **Run development server**
```bash
pnpm dev
```

5. **Open browser**
```
http://localhost:3000
```

## 📖 Usage

### Method 1: Chat Interface

1. Navigate to `/app/chat/chat_new`
2. Type your project description:
   ```
   สร้าง blog ที่มี CMS, authentication, และ comment system
   ```
3. AI will automatically start generating your project
4. View progress in real-time
5. Download or deploy when complete

### Method 2: Generate Page

1. Navigate to `/generate`
2. Enter project name
3. Write detailed description
4. Click "Generate Project"
5. Monitor progress
6. Download ZIP or deploy to Vercel

### Method 3: Templates

1. Navigate to `/templates`
2. Browse available templates
3. Filter by category or difficulty
4. Click "Use Template"
5. Customize as needed

## 🎯 Use Cases

### For Developers
- ✅ Rapid prototyping
- ✅ Boilerplate generation
- ✅ Learning best practices
- ✅ Code review assistance

### For Startups
- ✅ MVP development
- ✅ Fast iteration
- ✅ Cost-effective development
- ✅ Production-ready code

### For Agencies
- ✅ Client projects
- ✅ Consistent code quality
- ✅ Faster delivery
- ✅ Scalable solutions

### For Students
- ✅ Learn by example
- ✅ Project templates
- ✅ Best practices
- ✅ Portfolio projects

## 📊 Project Statistics

- **Total Features**: 50+
- **AI Models**: 19 (Vanchin AI)
- **Templates**: 8
- **Agents**: 7
- **Build Time**: < 60s
- **Page Load**: < 2s
- **API Response**: < 500ms

## 🔐 Security

- Rate limiting (5 presets)
- Input validation & sanitization
- Security headers (CSP, HSTS, X-Frame-Options)
- SQL injection prevention
- XSS protection
- CORS configuration
- Error boundaries

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Vanchin AI for providing free AI API access
- Supabase for backend infrastructure
- Vercel for hosting and deployment
- Next.js team for the amazing framework

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/donlasahachat11-lgtm/mrphomth/issues)
- Email: support@mrprompt.dev
- Documentation: [docs.mrprompt.dev](https://docs.mrprompt.dev)

## 🗺️ Roadmap

- [ ] Voice commands
- [ ] Multi-language code generation
- [ ] Team collaboration
- [ ] Version history
- [ ] Code playground
- [ ] Mobile app
- [ ] VS Code extension

---

**Made with ❤️ by the Mr.Prompt team**

**Status**: Production Ready ✅
