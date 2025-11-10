# 🚀 Mr.Promth Production - Deployment Guide

**Version**: 1.0.0  
**Date**: November 10, 2025

---

## 🎯 Overview

This guide provides instructions for deploying the backend to Vercel and the extension to the Chrome Web Store.

---

## 🌐 Part 1: Backend Deployment (Vercel)

### 1.1. Prerequisites

- A Vercel account.
- Your GitHub repository (`ProjactAll/Mr.Promth`) pushed with the latest changes.

### 1.2. Connect to Vercel

1. Go to your Vercel Dashboard.
2. Click **"Add New..." > "Project"**.
3. Import your GitHub repository (`ProjactAll/Mr.Promth`).

### 1.3. Configure Project

Vercel will automatically detect that you are using a Next.js project. However, since it's in a monorepo, you need to specify the root directory.

- **Framework Preset**: Next.js
- **Root Directory**: `packages/backend`

### 1.4. Set Environment Variables

1. In the project configuration, go to the **"Environment Variables"** section.
2. Add all the variables from your `packages/backend/.env.local` file.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VANCHIN_API_KEY`
   - `VANCHIN_ENDPOINT_ID`
   - `NEXTAUTH_URL` (use your production Vercel URL here)
   - `NEXTAUTH_SECRET`

### 1.5. Deploy

1. Click the **"Deploy"** button.
2. Vercel will build and deploy your backend application.
3. Once finished, you will get a production URL (e.g., `https://mrpromth-production.vercel.app`).

### 1.6. Post-Deployment

- **Update `NEXTAUTH_URL`**: Make sure this environment variable in Vercel is set to your final production domain.
- **Update Extension API Endpoint**: In your extension code (`packages/extension/src/api-client.ts`), change the `baseURL` to your new Vercel production URL before publishing to the Chrome Web Store.

---

## 🧩 Part 2: Extension Deployment (Chrome Web Store)

### 2.1. Prerequisites

- A Chrome Web Store Developer Account ($5 one-time fee).
- Your backend deployed and running on Vercel.

### 2.2. Build for Production

1. **Update Backend URL**: Ensure the `baseURL` in `packages/extension/src/api-client.ts` points to your Vercel production URL.

2. **Run the build command** from the root of the monorepo:
   ```bash
   pnpm extension:build
   ```
   This will create a production-ready build in `packages/extension/dist`.

### 2.3. Create ZIP File

1. Navigate to the `packages/extension` directory.
2. Create a ZIP file of the `dist` directory.
   ```bash
   cd packages/extension
   zip -r ../../mrpromth-extension-v1.0.0.zip dist
   ```

### 2.4. Upload to Chrome Web Store

1. Go to your [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **"Add new item"**.
3. Upload the `mrpromth-extension-v1.0.0.zip` file.

### 2.5. Fill in Store Listing

- **Description**: A detailed description of your extension.
- **Icons**: Provide icons in all required sizes.
- **Screenshots**: Add screenshots of your extension in action.
- **Category**: Choose an appropriate category.
- **Privacy Policy**: Provide a URL to your privacy policy.

### 2.6. Submit for Review

- Once you have filled in all the required information, you can submit your extension for review.
- The review process can take a few days to a few weeks.

---

## ✅ Deployment Complete!

Once both the backend and extension are deployed and the extension is approved, your application will be live and available to the public.
