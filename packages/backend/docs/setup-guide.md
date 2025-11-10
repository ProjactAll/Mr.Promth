# Setup Guide for Mr.Prompt

This guide will help you set up the complete Mr.Prompt application with Supabase, AI Gateway, and Streamlake integration.

## Prerequisites

- **Node.js** 18+ (for Next.js application)
- **Python** 3.10+ (for AI Gateway)
- **Docker** (optional, for local development)
- **Supabase** account
- **Streamlake** account (for AI models)

## Step 1: Environment Configuration

### 1.1 Copy Environment Files

```bash
# Copy Next.js environment file
cp .env.example .env.local

# Copy AI Gateway environment file
cp services/ai-gateway/.env.example services/ai-gateway/.env
```

### 1.2 Generate Secure Secrets

Use the following commands to generate secure random keys:

```bash
# Generate ENCRYPTION_SECRET (32 characters)
openssl rand -base64 32 | cut -c1-32

# Generate AI_GATEWAY_API_KEY (32 characters)
openssl rand -base64 32 | cut -c1-32

# Generate GATEWAY_API_KEY (same as AI_GATEWAY_API_KEY)
# Use the same value as above
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `mrphomth-main`
   - Database Password: `your-secure-password`
   - Region: `Select your region`
4. Wait for project to be created (2-5 minutes)

### 2.2 Get Supabase Keys

After project creation:
1. Go to "Settings" → "API"
2. Copy these values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: `SUPABASE_SERVICE_ROLE_KEY`

### 2.3 Run Database Migrations

```bash
# Navigate to the root directory
cd mrphomth-main

# Run the setup script
npm run setup
```

This will create the necessary tables:
- `api_keys` table for encrypted API key storage
- `chat_sessions` table for chat history
- `prompts` table for saved prompts

## Step 3: Streamlake Configuration

### 3.1 Get Streamlake API Key

1. Sign up at [Streamlake AI](https://streamlake.ai)
2. Navigate to "API Keys" section
3. Create a new API key
4. Copy the key value

### 3.2 Configure Streamlake

Add to your `.env.local`:
```env
STREAMLAKE_API_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints
STREAMLAKE_API_KEY=your-streamlake-key-here
```

## Step 4: Environment Variables

### 4.1 Next.js Application (`.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Gateway
AI_GATEWAY_URL=http://localhost:8000
AI_GATEWAY_API_KEY=your-secure-random-key-here

# Security
ENCRYPTION_SECRET=your-32-character-secret-key-here

# Streamlake Configuration
STREAMLAKE_API_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints
STREAMLAKE_API_KEY=your-streamlake-key-here
```

### 4.2 AI Gateway (`.env`)

```env
# Streamlake Configuration
STREAMLAKE_API_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints
STREAMLAKE_API_KEY=your-streamlake-key-here

# Gateway Security
GATEWAY_API_KEY=your-secure-random-key-here

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## Step 5: Run the Application

### 5.1 Start AI Gateway

```bash
# Navigate to AI Gateway directory
cd services/ai-gateway

# Install dependencies
pip install -r requirements.txt

# Start the gateway
python app.py
```

### 5.2 Start Next.js Application

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5.3 Access the Application

Open your browser and go to:
- **Next.js App**: http://localhost:3000
- **AI Gateway**: http://localhost:8000

## Step 6: Initial Setup

### 6.1 Create Admin Account

1. Open http://localhost:3000
2. Sign up with your email
3. Verify your email if required

### 6.2 Add Streamlake API Key

1. Go to http://localhost:3000/settings
2. Navigate to "API Keys" tab
3. Add your Streamlake API key
4. Test the connection

### 6.3 Create Your First Chat

1. Go to http://localhost:3000/app/chat
2. Start a new conversation
3. Test the integration

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check if migrations ran successfully

2. **API Gateway Connection Errors**
   - Ensure AI Gateway is running on port 8000
   - Verify `AI_GATEWAY_API_KEY` matches in both apps

3. **Streamlake API Errors**
   - Check `STREAMLAKE_API_KEY` is valid
   - Verify Streamlake service is accessible

4. **Encryption Errors**
   - Ensure `ENCRYPTION_SECRET` is exactly 32 characters
   - Check that the same secret is used across all services

### Logs and Debugging

```bash
# View Next.js logs
npm run dev

# View AI Gateway logs
cd services/ai-gateway && python app.py

# View Supabase logs (in dashboard)
# Go to Database → Settings → Logs
```

## Production Deployment

### Environment Variables

For production, set these variables in your hosting platform:

```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
AI_GATEWAY_URL=your-production-gateway-url
AI_GATEWAY_API_KEY=your-production-gateway-key
ENCRYPTION_SECRET=your-production-encryption-secret
STREAMLAKE_API_URL=your-production-streamlake-url
STREAMLAKE_API_KEY=your-production-streamlake-key
```

### Database Migration

Run migrations in production:
```bash
# Set production environment variables
export SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
export NEXT_PUBLIC_SUPABASE_URL=your-production-url

# Run migrations
npm run setup
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for each environment
3. **Rotate API keys** regularly
4. **Monitor usage** in Supabase dashboard
5. **Enable row-level security** in Supabase
6. **Use HTTPS** in production

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Streamlake API Docs](https://streamlake.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)

For issues with this setup:
1. Check the troubleshooting section
2. Verify all environment variables
3. Ensure all services are running
4. Check the logs for error messages