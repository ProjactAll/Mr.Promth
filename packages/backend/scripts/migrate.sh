#!/bin/bash

# Mr.Prompt Database Migration Script
# This script runs database migrations for the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run SQL migration
run_migration() {
    local sql_file="$1"
    local description="$2"

    print_status "Running migration: $description"

    if [ ! -f "$sql_file" ]; then
        print_error "Migration file not found: $sql_file"
        return 1
    fi

    # Read Supabase URL from environment
    if [ -f ".env.local" ]; then
        source .env.local
    fi

    local supabase_url="$NEXT_PUBLIC_SUPABASE_URL"

    if [ -z "$supabase_url" ]; then
        print_error "Supabase URL not found in environment"
        return 1
    fi

    # Use Supabase CLI if available, otherwise use curl
    if command_exists supabase; then
        supabase sql < "$sql_file"
        print_success "Migration completed: $description"
    elif command_exists psql; then
        # Extract connection info from DATABASE_URL if available
        if [ -n "$DATABASE_URL" ]; then
            psql "$DATABASE_URL" -f "$sql_file"
            print_success "Migration completed: $description"
        else
            print_error "PostgreSQL connection not configured"
            return 1
        fi
    else
        print_error "Neither Supabase CLI nor psql found"
        print_status "Please run the SQL manually in your Supabase SQL Editor"
        cat "$sql_file"
        return 1
    fi
}

# Function to check database connection
check_connection() {
    print_status "Checking database connection..."

    if [ -f ".env.local" ]; then
        source .env.local
    fi

    # Try to connect using different methods
    if command_exists supabase; then
        if supabase status >/dev/null 2>&1; then
            print_success "Supabase connection established"
            return 0
        fi
    elif command_exists psql && [ -n "$DATABASE_URL" ]; then
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "PostgreSQL connection established"
            return 0
        fi
    fi

    print_error "Cannot connect to database"
    print_status "Please ensure:"
    print_status "1. Supabase project is running"
    print_status "2. Environment variables are set correctly"
    print_status "3. Database credentials are valid"
    return 1
}

# Function to run all migrations
run_all_migrations() {
    print_status "Running all database migrations..."

    # Check connection first
    if ! check_connection; then
        exit 1
    fi

    # Run initial schema migration
    if run_migration "database/migrations/001_initial_schema.sql" "Initial database schema"; then
        print_success "All migrations completed successfully!"
    else
        print_error "Migration failed!"
        exit 1
    fi
}

# Function to show migration status
show_status() {
    print_status "Migration status:"

    if [ -f ".env.local" ]; then
        source .env.local
    fi

    # Check if tables exist
    if command_exists supabase; then
        supabase sql <<EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN ('api_keys', 'chat_sessions', 'prompts', 'messages', 'user_profiles')
ORDER BY table_name;
EOF
    elif command_exists psql && [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN ('api_keys', 'chat_sessions', 'prompts', 'messages', 'user_profiles')
ORDER BY table_name;"
    else
        print_warning "Cannot check migration status - database tools not available"
    fi
}

# Main function
main() {
    echo "========================================"
    echo "Mr.Prompt Database Migration Tool"
    echo "========================================"
    echo

    case "${1:-migrate}" in
        "migrate")
            run_all_migrations
            ;;
        "status")
            show_status
            ;;
        "help"|"--help"|"-h")
            echo "Usage: $0 [migrate|status|help]"
            echo ""
            echo "Commands:"
            echo "  migrate  - Run all database migrations (default)"
            echo "  status   - Show migration status"
            echo "  help     - Show this help message"
            echo ""
            echo "Environment files used:"
            echo "  - .env.local (for Supabase configuration)"
            echo ""
            echo "Migration files:"
            echo "  - database/migrations/001_initial_schema.sql"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Usage: $0 [migrate|status|help]"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"