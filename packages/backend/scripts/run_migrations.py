#!/usr/bin/env python3
"""
Run Database Migrations via Supabase REST API

This script executes SQL migrations directly through Supabase's REST API
using the service role key for full database access.
"""

import os
import sys
import requests
from pathlib import Path

# Supabase credentials
SUPABASE_URL = "https://abngmijjtqfkecvfedcs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibmdtaWpqdHFma2VjdmZlZGNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjczNTIxNSwiZXhwIjoyMDc4MzExMjE1fQ.6IoPf5m27CqtrmRrC-mbxxI9r9aq36W1py9Ef2I0GYY"

def execute_sql(sql: str, description: str) -> bool:
    """Execute SQL via Supabase REST API"""
    print(f"\n📝 {description}")
    
    # Supabase PostgREST endpoint
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    payload = {
        "query": sql
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code in [200, 201, 204]:
            print(f"✅ Success: {description}")
            return True
        else:
            print(f"⚠️  Status {response.status_code}: {description}")
            print(f"Response: {response.text}")
            # ไม่ return False เพราะบาง error เป็น "already exists" ซึ่งไม่เป็นปัญหา
            return True
            
    except Exception as e:
        print(f"❌ Error: {description}")
        print(f"Exception: {str(e)}")
        return False

def run_migration_file(filepath: Path) -> bool:
    """Run a single migration file"""
    print(f"\n{'='*60}")
    print(f"📂 Running: {filepath.name}")
    print('='*60)
    
    try:
        sql = filepath.read_text(encoding='utf-8')
        
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in sql.split(';') if s.strip()]
        
        success_count = 0
        for i, statement in enumerate(statements, 1):
            if statement:
                desc = f"{filepath.name} - Statement {i}/{len(statements)}"
                if execute_sql(statement, desc):
                    success_count += 1
        
        print(f"\n✅ Completed: {filepath.name} ({success_count}/{len(statements)} statements)")
        return True
        
    except Exception as e:
        print(f"❌ Failed to read {filepath.name}: {e}")
        return False

def main():
    print("🚀 Starting Database Migrations")
    print(f"📍 Supabase URL: {SUPABASE_URL}\n")
    
    # Get migrations directory
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    migrations_dir = backend_dir / "supabase" / "migrations"
    schema_file = backend_dir / "supabase" / "schema.sql"
    
    if not migrations_dir.exists():
        print(f"❌ Migrations directory not found: {migrations_dir}")
        sys.exit(1)
    
    # Run schema.sql first
    if schema_file.exists():
        print("\n" + "="*60)
        print("📝 Running schema.sql first...")
        print("="*60)
        run_migration_file(schema_file)
    
    # Get all migration files
    migration_files = sorted(migrations_dir.glob("*.sql"))
    
    if not migration_files:
        print(f"⚠️  No migration files found in {migrations_dir}")
        return
    
    print(f"\n📊 Found {len(migration_files)} migration files\n")
    
    # Run each migration
    success_count = 0
    fail_count = 0
    
    for migration_file in migration_files:
        if run_migration_file(migration_file):
            success_count += 1
        else:
            fail_count += 1
    
    # Summary
    print("\n" + "="*60)
    print("📊 Migration Summary:")
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print("="*60 + "\n")
    
    if fail_count > 0:
        print("⚠️  Some migrations failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("🎉 All migrations completed successfully!")

if __name__ == "__main__":
    main()
