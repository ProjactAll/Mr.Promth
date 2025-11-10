# Deployment Guide

This guide explains how to deploy your Mr.Prompt generated projects to GitHub and Vercel.

---

## Overview

Mr.Prompt provides automated deployment to GitHub and Vercel with a single click. The deployment process includes creating a GitHub repository, pushing your code, and optionally deploying to Vercel for hosting.

---

## Prerequisites

Before deploying, you need to obtain access tokens from GitHub and Vercel.

### GitHub Personal Access Token

A GitHub Personal Access Token is required to create repositories and push code on your behalf.

**Steps to create a GitHub token:**

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "Mr.Prompt Deployment")
4. Set expiration as needed (recommended: 90 days or custom)
5. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. **Important**: Copy the token immediately and store it securely. You won't be able to see it again.

**Token format**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Vercel Token (Optional)

A Vercel token is only required if you want to deploy your application to Vercel for hosting.

**Steps to create a Vercel token:**

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give your token a descriptive name (e.g., "Mr.Prompt Deployment")
4. Set scope to "Full Account"
5. Set expiration as needed
6. Click "Create"
7. Copy the token and store it securely

**Token format**: `vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Deployment Process

### Step 1: Open Deployment Dialog

After generating your project, click the **"Deploy"** button in the project interface. This will open the deployment configuration dialog.

### Step 2: Configure Deployment Settings

Fill in the required information:

#### GitHub Configuration

**GitHub Personal Access Token** (Required)
- Paste your GitHub token obtained from the prerequisites section
- This token is used to create the repository and push code

**Repository Name** (Optional)
- Default: Auto-generated from your project name
- Must be lowercase and use hyphens instead of spaces
- Example: `my-awesome-project`

**Make repository private** (Optional)
- Check this box to create a private repository
- Uncheck for public repository (default)

#### Vercel Configuration

**Deploy to Vercel** (Optional)
- Check this box to automatically deploy to Vercel
- Uncheck if you only want to push to GitHub

**Vercel Token** (Required if deploying to Vercel)
- Paste your Vercel token obtained from the prerequisites section

### Step 3: Start Deployment

Click the **"Deploy Now"** button to start the deployment process.

The deployment will proceed through the following steps:

1. **Create GitHub Repository**
   - Creates a new repository in your GitHub account
   - Initializes with a README

2. **Push Code to GitHub**
   - Pushes all project files to the repository
   - Creates initial commit

3. **Create Vercel Project** (if enabled)
   - Creates a new Vercel project
   - Links it to your GitHub repository

4. **Deploy to Vercel** (if enabled)
   - Triggers initial deployment
   - Sets up automatic deployments on future pushes

### Step 4: Access Your Deployment

Once deployment is complete, you'll see links to:

- **GitHub Repository**: View your code on GitHub
- **Vercel Deployment**: Visit your live application (if deployed to Vercel)

---

## Deployment Options

### GitHub Only

If you only want to push your code to GitHub without deploying:

1. Fill in GitHub token and repository name
2. Uncheck "Deploy to Vercel"
3. Click "Deploy Now"

Your code will be pushed to GitHub, and you can manually deploy it later using any hosting service.

### GitHub + Vercel

For complete deployment with hosting:

1. Fill in both GitHub and Vercel tokens
2. Keep "Deploy to Vercel" checked
3. Click "Deploy Now"

Your code will be pushed to GitHub and automatically deployed to Vercel. Future pushes to the `main` branch will trigger automatic redeployments.

---

## What Gets Deployed

The deployment includes all generated files:

- Application code (frontend and backend)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Environment variable templates (`.env.example`)
- Documentation files
- Build configuration

**Excluded files:**
- `node_modules/`
- `.next/` (build output)
- `.env.local` (local environment variables)
- `.git/` (version control)
- `dist/` or `build/` (build artifacts)

---

## Environment Variables

### Setting Up Environment Variables

After deployment, you need to configure environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the required variables for your project

**Common environment variables:**

```env
# Database (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# API Keys (if needed)
OPENAI_API_KEY=your-openai-key
```

### Automatic Environment Variables

Mr.Prompt automatically adds the following environment variable during deployment:

- `NEXT_PUBLIC_APP_URL`: Set to your Vercel deployment URL

---

## Continuous Deployment

Once deployed to Vercel with GitHub integration:

1. **Automatic Deployments**: Every push to the `main` branch triggers a new deployment
2. **Preview Deployments**: Pull requests create preview deployments
3. **Instant Rollback**: Easily rollback to previous deployments from Vercel dashboard

### Making Updates

To update your deployed application:

1. Clone your GitHub repository locally
2. Make changes to your code
3. Commit and push to GitHub
4. Vercel automatically deploys the changes

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
# Make changes
git add .
git commit -m "Update feature"
git push origin main
```

---

## Troubleshooting

### Common Issues

#### "GitHub token is required"
- Make sure you've entered a valid GitHub Personal Access Token
- Verify the token has `repo` scope

#### "Failed to create repository"
- Repository name might already exist in your account
- Try a different repository name
- Check if your token has expired

#### "Failed to push files to GitHub"
- Wait a few seconds after repository creation
- GitHub needs time to initialize the repository
- Try deploying again

#### "Vercel token is required for deployment"
- Enter a valid Vercel token if you want to deploy to Vercel
- Or uncheck "Deploy to Vercel" to skip Vercel deployment

#### "Vercel deployment failed"
- Check if your Vercel token is valid
- Verify you have available project slots in your Vercel account
- Check Vercel dashboard for detailed error messages

### Build Failures

If your Vercel deployment builds but fails:

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors
4. Ensure environment variables are set correctly

### Getting Help

If you encounter issues:

1. Check the deployment logs in the dialog
2. Review error messages carefully
3. Consult [GitHub API Documentation](https://docs.github.com/en/rest)
4. Consult [Vercel Documentation](https://vercel.com/docs)
5. Contact support with deployment logs

---

## Security Best Practices

### Token Security

**DO:**
- Store tokens securely (password manager)
- Use tokens with minimal required scopes
- Set expiration dates on tokens
- Revoke tokens when no longer needed

**DON'T:**
- Share tokens with others
- Commit tokens to version control
- Use tokens in client-side code
- Reuse tokens across multiple services

### Repository Security

**For private repositories:**
- Keep sensitive data in environment variables
- Use `.gitignore` for local files
- Review code before pushing

**For public repositories:**
- Never commit API keys or secrets
- Use environment variables for all sensitive data
- Review `.env.example` to ensure no secrets

---

## Advanced Configuration

### Custom Build Settings

You can customize build settings in Vercel after deployment:

1. Go to Project Settings → Build & Development Settings
2. Modify build command, output directory, install command
3. Save changes and redeploy

### Custom Domains

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for DNS propagation

### Team Deployments

To deploy to a Vercel team:

1. Obtain a team-scoped Vercel token
2. Set `VERCEL_TEAM_ID` environment variable
3. Deploy as usual

---

## Next Steps

After successful deployment:

1. **Configure Environment Variables**: Set up required environment variables in Vercel
2. **Set Up Database**: If using a database, configure connection strings
3. **Custom Domain**: Add a custom domain to your Vercel project
4. **Monitoring**: Enable Vercel Analytics and monitoring
5. **CI/CD**: Set up additional CI/CD workflows if needed

---

## Additional Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
