# Mr.Promth Production - Deployment Guide

คู่มือการ deploy ระบบทั้งหมดไปยัง production

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment (Vercel)](#backend-deployment-vercel)
5. [Extension Deployment](#extension-deployment)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Stack                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │    Vercel    │  │ Chrome Store │      │
│  │   (Database) │  │   (Backend)  │  │ (Extension)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Vanchin AI (39 models)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Backend deployed to Vercel
- [ ] Extension built for production
- [ ] Extension submitted to Chrome Web Store
- [ ] DNS configured (if custom domain)
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

## Prerequisites

### 1. Accounts Required

- ✅ **Supabase Account** - Database & Auth
  - URL: https://supabase.com
  - Project: `abngmijjtqfkecvfedcs`

- ✅ **Vercel Account** - Backend hosting
  - URL: https://vercel.com
  - Team: `projactalls-projects`

- ⏳ **Chrome Web Store Developer Account** - Extension distribution
  - URL: https://chrome.google.com/webstore/devconsole
  - Fee: $5 one-time registration

- ✅ **Vanchin AI Account** - AI models
  - URL: https://vanchin.streamlake.ai
  - 39 API keys configured

### 2. Tools Required

```bash
# Vercel CLI
npm install -g vercel

# Supabase CLI (optional)
npm install -g supabase

# pnpm (package manager)
npm install -g pnpm
```

---

## Database Deployment

### 1. Verify Supabase Project

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref abngmijjtqfkecvfedcs
```

### 2. Run Migrations

#### Option A: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/abngmijjtqfkecvfedcs
2. Navigate to **SQL Editor**
3. Copy content from `packages/backend/supabase/FULL_MIGRATION.sql`
4. Paste and click **Run**
5. Wait for completion

#### Option B: Supabase CLI

```bash
cd packages/backend

# Push migrations
supabase db push
```

### 3. Create Storage Bucket

1. Go to **Storage** section
2. Click **New bucket**
3. Name: `screenshots`
4. Privacy: **Private**
5. Click **Create bucket**

### 4. Setup Storage Policies

Run SQL from `packages/backend/supabase/migrations/009_storage_setup.sql`

### 5. Verify Database

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return:
-- api_keys
-- analysis_results
-- dom_snapshots
-- extension_logs
-- extension_sessions
-- extension_settings
-- files
-- github_connections
-- logs
-- profiles
-- projects
-- screenshots
```

### 6. Create Admin User (Optional)

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role
) VALUES (
  gen_random_uuid(),
  'admin@mrpromth.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  '{"display_name": "Admin User"}'::jsonb,
  'authenticated'
);
```

---

## Backend Deployment (Vercel)

### 1. Prepare Environment Variables

Create `.env.production` in `packages/backend/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abngmijjtqfkecvfedcs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vanchin AI
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints

# Agent-specific keys
VANCHIN_AGENT_AGENT1_KEY=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VANCHIN_AGENT_AGENT2_KEY=3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk
VANCHIN_AGENT_AGENT3_KEY=npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50
VANCHIN_AGENT_AGENT4_KEY=l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU
VANCHIN_AGENT_AGENT5_KEY=Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8
VANCHIN_AGENT_AGENT6_KEY=vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg
VANCHIN_AGENT_AGENT7_KEY=pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k

# Load balancing keys (39 pairs)
VANCHIN_API_KEY_1=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VANCHIN_ENDPOINT_1=ep-lpvcnv-1761467347624133479
# ... (copy all 39 pairs)
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
cd packages/backend

# Link to existing project or create new
vercel link

# Select:
# - Scope: projactalls-projects
# - Link to existing project? Yes
# - Project name: mr-promth-backend (or create new)
```

### 4. Configure Environment Variables

#### Option A: Vercel Dashboard

1. Go to https://vercel.com/projactalls-projects
2. Select project
3. Go to **Settings** > **Environment Variables**
4. Add all variables from `.env.production`
5. Set for: **Production**, **Preview**, **Development**

#### Option B: Vercel CLI

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... (repeat for all variables)
```

### 5. Deploy to Production

```bash
cd packages/backend

# Deploy to production
vercel --prod

# Or use GitHub integration (recommended)
# Just push to main branch and Vercel will auto-deploy
```

### 6. Verify Deployment

```bash
# Test health endpoint
curl https://your-project.vercel.app/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 7. Configure Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Add domain: `api.mrpromth.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   ```

---

## Extension Deployment

### 1. Update Extension Configuration

Update `packages/extension/manifest.json`:

```json
{
  "name": "Mr.Promth - Screenshot to Code",
  "version": "1.0.0",
  "description": "Transform any website into production-ready code with AI",
  "homepage_url": "https://mrpromth.com",
  ...
}
```

### 2. Configure Production API URL

Create `.env.production` in `packages/extension/`:

```bash
API_BASE_URL=https://your-project.vercel.app
```

### 3. Build for Production

```bash
cd packages/extension

# Build extension
pnpm build

# Output will be in dist/
```

### 4. Test Production Build

1. Go to `chrome://extensions/`
2. Remove development extension
3. Load `dist/` folder
4. Test all features:
   - Login
   - Capture & Analyze
   - View History
   - Logout

### 5. Create ZIP Package

```bash
cd packages/extension/dist

# Create ZIP
zip -r ../mr-promth-extension-v1.0.0.zip .

# Verify ZIP contents
unzip -l ../mr-promth-extension-v1.0.0.zip
```

### 6. Prepare Store Assets

Create the following assets:

#### Screenshots (1280x800 or 640x400)

1. **Screenshot 1**: Extension popup (login screen)
2. **Screenshot 2**: Extension popup (main screen)
3. **Screenshot 3**: Capture in action
4. **Screenshot 4**: Analysis results
5. **Screenshot 5**: History view

#### Promotional Images

- **Small tile**: 440x280 (required)
- **Large tile**: 920x680 (optional)
- **Marquee**: 1400x560 (optional)

#### Icon

- **128x128**: Main icon (already in manifest)

### 7. Submit to Chrome Web Store

1. Go to https://chrome.google.com/webstore/devconsole
2. Click **New Item**
3. Upload `mr-promth-extension-v1.0.0.zip`
4. Fill in details:

   **Product details:**
   - Name: Mr.Promth - Screenshot to Code
   - Summary: Transform any website into production-ready code with AI
   - Description: (See below)
   - Category: Developer Tools
   - Language: English

   **Privacy:**
   - Single purpose: Web development tool
   - Permission justification: (Explain each permission)
   - Host permissions: Required for DOM analysis
   - Data usage: Screenshots stored in user's Supabase account

   **Store listing:**
   - Upload screenshots
   - Upload promotional images
   - Upload icon

5. Click **Submit for review**

#### Extension Description Template

```markdown
# Mr.Promth - Screenshot to Code

Transform any website into production-ready code with AI-powered analysis.

## Features

🎨 **Screenshot to Code**
Capture any webpage and generate production-ready code instantly.

🔍 **Smart DOM Analysis**
Automatically detect page structure, components, and interactions.

🤖 **AI-Powered**
Powered by advanced AI agents for accurate code generation.

📚 **History Tracking**
Keep track of all your captures and analyses.

🚀 **Production Ready**
Generated code is clean, optimized, and ready to deploy.

## How It Works

1. **Login**: Sign in with your Mr.Promth account
2. **Navigate**: Go to any website you want to clone
3. **Capture**: Click the extension icon and hit "Capture & Analyze"
4. **Generate**: AI analyzes the page and generates code
5. **Download**: Get production-ready code instantly

## Privacy & Security

- All data is stored in your personal Supabase account
- We don't share your data with third parties
- Screenshots are encrypted and secure
- You can delete your data anytime

## Support

Need help? Visit https://mrpromth.com/support
```

### 8. Review Process

- **Timeline**: 1-3 business days
- **Status**: Check dashboard for updates
- **Rejection**: Fix issues and resubmit

---

## Post-Deployment

### 1. Verify All Systems

```bash
# Test backend
curl https://your-project.vercel.app/api/health

# Test extension auth
curl -X POST https://your-project.vercel.app/api/extension/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 2. Create Test User

```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'demo@mrpromth.com',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  '{"display_name": "Demo User"}'::jsonb
);
```

### 3. Update Documentation

- Update README.md with production URLs
- Update API documentation
- Update user guides

### 4. Setup Monitoring

#### Vercel Analytics

1. Go to **Analytics** tab in Vercel
2. Enable **Web Analytics**
3. Enable **Speed Insights**

#### Supabase Monitoring

1. Go to **Database** > **Logs**
2. Monitor query performance
3. Set up alerts for errors

#### Error Tracking (Optional)

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Configure in next.config.js
```

### 5. Setup Backups

#### Database Backups

Supabase automatically backs up daily, but you can also:

```bash
# Manual backup
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db push --file backup-20251110.sql
```

#### Storage Backups

1. Go to **Storage** > **Settings**
2. Enable **Point-in-Time Recovery** (PITR)

---

## Monitoring

### Key Metrics to Track

1. **API Performance**
   - Response time: < 500ms
   - Error rate: < 1%
   - Uptime: > 99.9%

2. **Database Performance**
   - Query time: < 100ms
   - Connection pool: < 80% usage
   - Storage: Monitor growth

3. **Extension Usage**
   - Daily active users (DAU)
   - Captures per day
   - Analysis success rate

4. **AI Performance**
   - Agent response time
   - Token usage
   - Error rate

### Alerts Setup

#### Vercel Alerts

1. Go to **Settings** > **Notifications**
2. Enable:
   - Deployment failed
   - Build errors
   - High error rate

#### Supabase Alerts

1. Go to **Settings** > **Alerts**
2. Enable:
   - High CPU usage
   - High memory usage
   - Connection pool full

### Logs

#### View Backend Logs

```bash
# Vercel CLI
vercel logs

# Or in dashboard
# https://vercel.com/projactalls-projects/your-project/logs
```

#### View Database Logs

```bash
# Supabase CLI
supabase logs

# Or in dashboard
# https://supabase.com/dashboard/project/abngmijjtqfkecvfedcs/logs
```

---

## Rollback Procedure

### Backend Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Restore from backup
supabase db push --file backup-20251110.sql
```

### Extension Rollback

1. Go to Chrome Web Store Developer Dashboard
2. Select extension
3. Click **Package** > **Upload new package**
4. Upload previous version ZIP

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check API performance
- Review user feedback

**Weekly:**
- Review database performance
- Check storage usage
- Update dependencies

**Monthly:**
- Database optimization
- Security audit
- Backup verification

### Updates

#### Backend Updates

```bash
cd packages/backend

# Update dependencies
pnpm update

# Test locally
pnpm dev

# Deploy
vercel --prod
```

#### Extension Updates

```bash
cd packages/extension

# Update version in manifest.json
# Build
pnpm build

# Create ZIP
# Submit to Chrome Web Store
```

---

## Troubleshooting

### Issue 1: Deployment Failed

**Symptoms**: Vercel deployment fails

**Solutions**:
1. Check build logs
2. Verify environment variables
3. Test build locally: `pnpm build`
4. Check for TypeScript errors

### Issue 2: Database Connection Failed

**Symptoms**: Backend can't connect to Supabase

**Solutions**:
1. Verify Supabase project is running
2. Check environment variables
3. Verify service role key
4. Check connection pool limits

### Issue 3: Extension Not Working

**Symptoms**: Extension can't connect to backend

**Solutions**:
1. Verify API_BASE_URL is correct
2. Check CORS settings
3. Verify backend is deployed
4. Check browser console for errors

---

## Security Checklist

- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] RLS policies enabled
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

---

## Cost Estimation

### Monthly Costs

**Supabase:**
- Free tier: $0
- Pro tier: $25/month (recommended)
  - 8GB database
  - 100GB bandwidth
  - 50GB storage

**Vercel:**
- Hobby: $0 (limited)
- Pro: $20/month (recommended)
  - Unlimited bandwidth
  - Analytics included
  - Team collaboration

**Vanchin AI:**
- Free tier: 20M tokens
- Pay-as-you-go: ~$0.001/token

**Chrome Web Store:**
- One-time: $5

**Total Estimated:**
- Minimum: $5 one-time + $0/month
- Recommended: $5 one-time + $45/month

---

## Next Steps

1. ✅ Complete all deployment steps
2. ✅ Verify all systems working
3. ✅ Setup monitoring and alerts
4. ✅ Create user documentation
5. ✅ Launch marketing campaign
6. ✅ Gather user feedback
7. ✅ Plan feature updates

---

**Last Updated:** 10 November 2025
