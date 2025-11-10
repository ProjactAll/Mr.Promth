# Deployment Guide

This guide explains how to deploy Mr.Prompt to a production environment.

## Recommended Deployment: Vercel

The easiest way to deploy Mr.Prompt is with [Vercel](https://vercel.com/), the creators of Next.js.

### 1. Fork the Repository

Fork the [Mr.Prompt repository](https://github.com/donlasahachat11-lgtm/mrphomth) to your own GitHub account.

### 2. Create a Vercel Project

1.  Go to your [Vercel dashboard](https://vercel.com/dashboard) and click "Add New..." > "Project".
2.  Import your forked GitHub repository.
3.  Vercel will automatically detect that it is a Next.js project.

### 3. Configure Environment Variables

In your Vercel project settings, go to the "Environment Variables" section and add the following:

-   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key.
-   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.
-   `VC_API_KEY`: Your Vanchin AI API key.
-   `VERCEL_TOKEN`: Your Vercel API token (for auto-deployment).
-   `VERCEL_TEAM_ID`: Your Vercel team ID (for auto-deployment).
-   `GITHUB_TOKEN`: Your GitHub personal access token (for auto-deployment).

### 4. Deploy

Click the "Deploy" button. Vercel will build and deploy your project. After the deployment is complete, you will be given a URL to access your application.

## Self-Hosting with Docker

For more control, you can self-host Mr.Prompt using Docker.

### 1. Create a `docker-compose.yml` File

```yaml
version: '3.8'

services:
  mr-prompt:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - VC_API_KEY=${VC_API_KEY}
      - VERCEL_TOKEN=${VERCEL_TOKEN}
      - VERCEL_TEAM_ID=${VERCEL_TEAM_ID}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    restart: always
```

### 2. Create a `Dockerfile`

```dockerfile
# Install dependencies only when needed
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN \
    if [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
    npm ci; \
    else \
    npm i; \
    fi


# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

```

### 3. Build and Run the Docker Container

```bash
docker-compose up -d --build
```

Your application will be running at `http://localhost:3000`.

