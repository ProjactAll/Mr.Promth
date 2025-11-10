# Quick Start Guide for the Next AI Session

**Project**: Mr.Prompt  
**Objective**: Continue development and finalize the project for production.

---

## 1. Environment & Project Status

- **Working Directory**: The project is located at `/home/ubuntu/projects/mrphomth-project`.
- **GitHub Repository**: The code is synced with `https://github.com/donlasahachat6/mrpromth`. The `gh` CLI is authenticated.
- **Supabase**: The database connection is configured in `.env.local`. The project URL is `https://xcwkwdoxrbzzpwmlqswr.supabase.co`.
- **Vercel**: The project is linked to Vercel for auto-deployment at `https://vercel.com/mrpromths-projects/mrphomth`.

**Current State**: ⚠️ **BLOCKED**. The application build is failing. This is expected.

---

## 2. ⚠️ Your First Task (CRITICAL)

**You cannot proceed with coding or building until the database migration is complete.**

1.  **Inform the User**: You must first inform the user that the database migration needs to be run manually in their Supabase dashboard.
2.  **Provide the Script**: Direct them to the script located at `supabase/migrations/001_create_project_files.sql`.
3.  **Wait for Confirmation**: Do not attempt to build or test until the user confirms they have successfully run the migration.

**Example Message to User:**
> "Welcome back! To continue, we first need to update the database structure. Please go to your Supabase dashboard, open the SQL Editor, and run the script from `supabase/migrations/001_create_project_files.sql`. Let me know once you've done that, and I'll proceed with building and testing the latest features!"

---

## 3. Development Workflow (After Migration)

1.  **Verify the Build**:
    ```bash
    cd /home/ubuntu/projects/mrphomth-project
    pnpm install
    pnpm build
    ```
    This should now pass without errors.

2.  **Consult the Plan**: Review the file `PRIORITY_TASKS.md` to understand the remaining tasks. The next major phase is **Testing & Validation**.

3.  **Execute Tests**:
    - Run automated tests (`pnpm test`).
    - Manually test the new features: file saving to the database and chat context awareness.

4.  **Fix Bugs**: Address any issues found during testing.

5.  **Finalize**: Complete the remaining tasks, update documentation, and prepare for final delivery.

---

## 4. Credentials & Key Information

- **GitHub Token**: `[REDACTED_GITHUB_TOKEN]` (pre-configured).
- **Supabase Keys**: Available in `.env.local`.
- **Handover Documentation**: For a full summary of the previous session, read `NEW_HANDOVER_DOCUMENTATION.md`.
