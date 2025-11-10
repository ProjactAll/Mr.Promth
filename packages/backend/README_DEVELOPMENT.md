# Mr.Promth - Development Documentation

## Quick Start

### Prerequisites
- Node.js 22.13.0 or higher
- pnpm package manager
- Supabase account
- Vanchin AI API key

### Installation
```bash
# Clone repository
git clone https://github.com/ProjactAll/Mr.Promth.git
cd Mr.Promth/packages/backend

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your credentials

# Run development server
pnpm dev
```

### Environment Variables
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vanchin AI (Required for AI features)
VC_API_KEY=your_vanchin_api_key
# or
VANCHIN_API_KEY=your_vanchin_api_key

# OAuth (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Project Structure

```
packages/backend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat interface
│   └── admin/             # Admin dashboard
├── components/            # React components
├── lib/                   # Utility functions
│   ├── ai/               # AI integration
│   ├── database.ts       # Database operations
│   └── vanchin.ts        # Vanchin AI client
├── supabase/             # Database migrations
└── middleware.ts         # Authentication middleware
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Verify authentication
- `POST /api/auth/logout` - User logout

### Chat
- `GET /api/sessions` - Get chat sessions
- `POST /api/chat` - Send chat message
- `DELETE /api/sessions/:id` - Delete session

### Agents
- `GET /api/agents` - List AI agents
- `POST /api/agents/execute` - Execute agent

### Health
- `GET /api/health` - System health check

## Development Workflow

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test
pnpm test path/to/test.ts

# Run with coverage
pnpm test:coverage
```

### Building for Production
```bash
# Build application
pnpm build

# Start production server
pnpm start
```

### Code Quality
```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## Database Management

### Migrations
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset
```

### Supabase MCP
```bash
# List tables
manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id":"your_project_id","query":"SELECT * FROM information_schema.tables WHERE table_schema = 'public';"}'

# Query data
manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id":"your_project_id","query":"SELECT * FROM profiles LIMIT 10;"}'
```

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables on Vercel
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all required variables
4. Redeploy application

## Troubleshooting

### Common Issues

#### Dev Server Won't Start
- Check if port 3000 is already in use
- Clear .next cache directory
- Reinstall node_modules
- Verify environment variables

#### Database Connection Issues
- Verify SUPABASE_URL is correct
- Check SUPABASE_ANON_KEY is valid
- Test connection using curl
- Check Supabase project status

#### Build Errors
- Run TypeScript type check
- Check for missing dependencies
- Clear build cache
- Review error messages carefully

## Security Best Practices

### Environment Variables
- Never commit .env files
- Use different keys for development and production
- Rotate API keys regularly
- Use NEXT_PUBLIC_ prefix only for client-safe values

### Authentication
- Always validate user input
- Implement rate limiting
- Use HTTPS in production
- Enable CSRF protection

### Database
- Use parameterized queries
- Implement Row Level Security (RLS)
- Regularly backup data
- Monitor for suspicious activity

## Contributing

### Code Style
- Use TypeScript for all files
- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process
1. Create feature branch
2. Make changes
3. Run tests and linting
4. Submit pull request
5. Wait for review

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vanchin AI Documentation](https://vanchin.ai/docs)

### Support
- GitHub Issues: https://github.com/ProjactAll/Mr.Promth/issues
- Email: support@mrpromth.com

## Recent Changes

### Version 0.1.0 (2025-11-10)
- Simplified Vanchin AI integration (single API key)
- Fixed all TypeScript errors in production code
- Removed 485 emojis for professionalism
- Completed all 18 TODO items
- Enhanced security headers
- Improved authentication middleware
- Created comprehensive documentation
- 0 security vulnerabilities
- Production-ready build

## Status

**Current Status:** Production Ready (Non-AI Features)

All core features are functional and tested. AI features require Vanchin API key configuration. See DEVELOPMENT_REPORT.md for complete details.

---

Last Updated: November 10, 2025
