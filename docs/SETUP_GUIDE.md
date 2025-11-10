# 🚀 Mr.Promth Production - Setup Guide

**Version**: 1.0.0  
**Date**: November 10, 2025

---

## 🎯 Overview

This guide provides detailed instructions for setting up the entire Mr.Promth Production monorepo for local development.

---

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: >= 2.30.0
- **Supabase Account**: [Create one here](https://supabase.com)
- **Vercel Account**: [Create one here](https://vercel.com)
- **GitHub Account**: [Create one here](https://github.com)

---

## ⚙️ Step 1: Clone Repository

```bash
git clone https://github.com/ProjactAll/Mr.Promth.git mrpromth-production
cd mrpromth-production
```

---

## 📦 Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the root workspace and all packages (`backend` and `extension`).

---

## ☁️ Step 3: Supabase Setup

### 3.1. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New project"**
3. Choose your organization and give your project a name (e.g., `mrpromth-production`)
4. Generate a secure database password and save it.
5. Choose your region.
6. Click **"Create new project"**.

### 3.2. Get API Credentials

1. In your Supabase project, go to **Project Settings > API**.
2. Find your **Project URL** and **Project API Keys**.
3. You will need:
   - **Project URL**
   - **`anon` `public` key**
   - **`service_role` `secret` key**

### 3.3. Run Database Migrations

1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the migration files from `packages/backend/supabase/migrations/`.
3. Copy and paste the content of each SQL file into the editor, one by one, in chronological order.
4. Click **"RUN"** for each migration.

### 3.4. Enable Row Level Security (RLS)

1. Go to **Authentication > Policies**.
2. Ensure that RLS is enabled for all tables.
3. If not, run the following SQL for each table:
   ```sql
   ALTER TABLE public.your_table_name ENABLE ROW LEVEL SECURITY;
   ```

### 3.5. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard.
2. Click **"New bucket"**.
3. Name the bucket `screenshots`.
4. Set the access to **Public** (or create specific access policies).

---

## 🔑 Step 4: Environment Configuration

### 4.1. Backend (`.env.local`)

1. Navigate to the backend package:
   ```bash
   cd packages/backend
   ```

2. Create your local environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local` and fill in the values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

   # Vanchin AI (replace with your keys)
   VANCHIN_API_KEY="YOUR_VANCHIN_API_KEY"
   VANCHIN_ENDPOINT_ID="YOUR_VANCHIN_ENDPOINT_ID"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-secret-key"
   ```

### 4.2. Extension (Hardcoded for now)

For development, the backend URL is hardcoded in the extension. You can change it in `packages/extension/src/api-client.ts` if needed.

---

## 🚀 Step 5: Run the Application

### 5.1. Start Development Servers

From the root directory of the monorepo:

```bash
pnpm dev
```

This will start both the backend and extension build processes in watch mode.

### 5.2. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"**.
4. Select the `packages/extension/dist` directory.
5. The Mr.Promth Extension should now appear in your browser toolbar.

### 5.3. Access the Web Application

Open your browser and go to [http://localhost:3000](http://localhost:3000).

---

## ✅ You are all set!

Now you have:
- The backend running on `localhost:3000`.
- The extension built and loaded into Chrome.
- Both are connected to your Supabase project.

Happy coding! 🎉
