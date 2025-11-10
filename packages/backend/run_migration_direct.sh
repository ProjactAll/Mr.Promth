#!/bin/bash

# Run migration using curl to Supabase REST API
SUPABASE_URL="https://xcwkwdoxrbzzpwmlqswr.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2t3ZG94cmJ6enB3bWxxc3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ0Njc2MiwiZXhwIjoyMDc4MDIyNzYyfQ.bu0NQEcmib1eyYGYE52rF6iya647uAMaq6RNXu2u9GE"

echo "🚀 Running database migration via Supabase API..."
echo "📖 Reading migration SQL..."

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/006_fix_schema_and_add_features.sql)

# Execute via Supabase RPC (if available) or use PostgREST
# For now, we'll output instructions for manual execution

echo "✅ Migration SQL ready"
echo ""
echo "📋 Please run this SQL in Supabase Dashboard > SQL Editor:"
echo "   https://supabase.com/dashboard/project/xcwkwdoxrbzzpwmlqswr/sql"
echo ""
echo "Or copy the SQL from: supabase/migrations/006_fix_schema_and_add_features.sql"

