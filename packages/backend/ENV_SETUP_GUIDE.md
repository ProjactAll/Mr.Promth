# 🔐 Environment Variables Setup Guide

**For:** New AI Assistants  
**Purpose:** Setup local development environment  
**Security:** This file does NOT contain actual secrets

---

## ⚠️ Important Security Note

**This repository does NOT contain sensitive credentials.** All secrets are stored securely in:
- Vercel Dashboard (production)
- Supabase Dashboard (database)
- Local `.env.local` files (not in git)

---

## 🚀 Quick Setup for New AI Assistant

### Step 1: Clone Repository
```bash
gh repo clone donlasahachat11-lgtm/mrphomth
cd mrphomth
npm install
```

### Step 2: Get Environment Variables

**You need to ask the user for these values:**

1. **Supabase URL**
   - Ask: "What is your Supabase project URL?"
   - Format: `https://[project-id].supabase.co`
   - Location: Supabase Dashboard > Settings > API

2. **Supabase Anon Key**
   - Ask: "What is your Supabase anon key?"
   - Format: Long JWT token starting with `eyJ...`
   - Location: Supabase Dashboard > Settings > API

3. **Optional: Additional AI Keys**
   - OpenAI API Key (if using OpenAI)
   - Anthropic API Key (if using Claude)

---

## 📝 Create .env.local File

### Method 1: Ask User to Provide Values

**Say to user:**
```
To setup local development, I need your environment variables.
Please provide:
1. NEXT_PUBLIC_SUPABASE_URL (from Supabase Dashboard)
2. NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase Dashboard)

You can find these at: https://supabase.com/dashboard/project/[your-project]/settings/api
```

### Method 2: Copy from .env.example

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ask user for this]

# Optional: Additional AI API Keys
OPENAI_API_KEY=[optional]
ANTHROPIC_API_KEY=[optional]
```

---

## 🔍 Where to Find Credentials

### Supabase Credentials

**URL:** https://supabase.com/dashboard/project/xcwkwdoxrbzzpwmlqswr/settings/api

**Steps:**
1. Login to Supabase
2. Select project: `xcwkwdoxrbzzpwmlqswr`
3. Go to Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Vercel Environment Variables (Production)

**URL:** https://vercel.com/mrpromths-projects/mrphomth/settings/environment-variables

**Note:** These are already configured in production. Only needed if you want to verify or update them.

### Vanchin AI Keys

**Status:** ✅ Already hardcoded in source code  
**Location:** `/lib/ai/vanchin-client.ts`  
**Action:** No setup needed - 19 models ready to use

---

## 🎯 Complete .env.local Template

```env
# ============================================
# Supabase Configuration
# ============================================
# Get from: https://supabase.com/dashboard/project/xcwkwdoxrbzzpwmlqswr/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[ASK_USER_FOR_THIS]

# ============================================
# Optional: Additional AI API Keys
# ============================================
# Only needed if you want to use OpenAI or Anthropic
# Vanchin AI keys are already in source code

# OPENAI_API_KEY=sk-[optional]
# ANTHROPIC_API_KEY=sk-ant-[optional]

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================
# Note: Vanchin AI Configuration
# ============================================
# Vanchin AI keys (19 models) are hardcoded in:
# /lib/ai/vanchin-client.ts
# 
# No additional configuration needed!
# Total: 20M free tokens
```

---

## ✅ Verification Steps

### After creating .env.local:

1. **Check file exists:**
```bash
ls -la .env.local
```

2. **Verify content (without showing secrets):**
```bash
grep -c "NEXT_PUBLIC_SUPABASE_URL" .env.local
# Should output: 1
```

3. **Test connection:**
```bash
npm run dev
# Open http://localhost:3000
# Try to login/signup
```

---

## 🚨 Common Issues

### Issue 1: "Supabase client error"
**Cause:** Wrong or missing Supabase credentials  
**Solution:** 
1. Verify URL format: `https://[project-id].supabase.co`
2. Check anon key is complete (very long JWT token)
3. Ask user to provide correct values

### Issue 2: "Cannot connect to database"
**Cause:** Supabase project might be paused  
**Solution:** Ask user to check Supabase dashboard

### Issue 3: ".env.local not found"
**Cause:** File not created  
**Solution:** 
```bash
cp .env.example .env.local
# Then edit with correct values
```

---

## 📋 Checklist for AI Assistant

Before starting development:

- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Asked user for Supabase URL
- [ ] Asked user for Supabase anon key
- [ ] Created `.env.local` file
- [ ] Verified file contains correct values
- [ ] Tested `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Can login/signup (tests Supabase connection)

---

## 🎓 What You DON'T Need to Ask

### Already Configured:

✅ **Vanchin AI Keys (19 models)**
- Location: `/lib/ai/vanchin-client.ts`
- Status: Hardcoded and ready
- No setup needed

✅ **Production Environment Variables**
- Location: Vercel Dashboard
- Status: Already configured
- Only needed for local development

✅ **Database Schema**
- Location: Supabase (already migrated)
- Status: 5 tables created
- No setup needed

---

## 🔐 Security Best Practices

### DO:
✅ Ask user for credentials via secure message  
✅ Store in `.env.local` (git-ignored)  
✅ Never commit secrets to git  
✅ Use environment variables in code  

### DON'T:
❌ Hardcode secrets in source code  
❌ Commit `.env.local` to git  
❌ Share secrets in public messages  
❌ Store secrets in documentation  

---

## 📞 If You Need Help

### Ask User:
```
I need to setup local development environment.
Could you provide:

1. Supabase Project URL
   - Go to: https://supabase.com/dashboard/project/xcwkwdoxrbzzpwmlqswr/settings/api
   - Copy: "Project URL"

2. Supabase Anon Key
   - Same page as above
   - Copy: "anon public" key

I'll create .env.local file with these values.
```

### Alternative: User Can Setup Manually

Tell user:
```
Alternatively, you can create .env.local yourself:

1. Copy .env.example to .env.local
2. Fill in your Supabase credentials from dashboard
3. Save the file
4. Run: npm run dev
```

---

## 🎯 Success Criteria

You've successfully setup environment when:

1. ✅ `.env.local` file exists
2. ✅ Contains valid Supabase URL and key
3. ✅ `npm run dev` runs without errors
4. ✅ Can access http://localhost:3000
5. ✅ Can login/signup (proves Supabase works)
6. ✅ Can see dashboard after login

---

## 📚 Related Documentation

- **HANDOVER.md** - Main guide for AI assistants
- **README.md** - Project overview
- **.env.example** - Template file
- **lib/supabase/client.ts** - How env vars are used

---

## 🚀 Quick Reference

### Minimum Required Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ask user]
```

### Where to Get Them:
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xcwkwdoxrbzzpwmlqswr/settings/api
- **Vercel Dashboard:** https://vercel.com/mrpromths-projects/mrphomth/settings/environment-variables (reference only)

### What's Already Ready:
- ✅ 19 Vanchin AI models (in source code)
- ✅ Database schema (in Supabase)
- ✅ Production deployment (in Vercel)

---

**Remember:** Always ask user for credentials. Never assume you have access to secrets!

---

**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Use
