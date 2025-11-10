#!/usr/bin/env python3
"""
Script to run Supabase migration via API
"""
import os
import requests

# Read migration file
with open('supabase/migrations/001_create_project_files.sql', 'r') as f:
    migration_sql = f.read()

# Supabase configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://xcwkwdoxrbzzpwmlqswr.supabase.co')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment")
    exit(1)

# Execute migration
print("🚀 Running database migration...")
print(f"📍 Supabase URL: {SUPABASE_URL}")

# Use Supabase REST API to execute SQL
url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

# Note: This approach requires a custom RPC function in Supabase
# Alternative: Use psycopg2 to connect directly
print("\n⚠️  Note: This script requires direct database access.")
print("📝 Migration SQL is ready in: supabase/migrations/001_create_project_files.sql")
print("\n✅ Please run this SQL in Supabase Dashboard SQL Editor:")
print(f"   {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql")

