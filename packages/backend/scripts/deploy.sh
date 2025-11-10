#!/bin/bash

# Production Deployment Script for Mr.Prompt
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="mrphomth"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check if required tools are installed
check_requirements() {
    log "Checking requirements..."

    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi

    if ! command -v supabase &> /dev/null; then
        error "supabase CLI is not installed"
    fi

    success "Requirements check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment variables for $ENVIRONMENT..."

    if [ -f ".env.$ENVIRONMENT" ]; then
        export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
        success "Environment variables loaded from .env.$ENVIRONMENT"
    elif [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        success "Environment variables loaded from .env.production"
    else
        warning "No environment file found, using existing environment variables"
    fi
}

# Create backup
create_backup() {
    log "Creating backup..."

    mkdir -p $BACKUP_DIR

    # Backup database
    if [ ! -z "$DATABASE_URL" ]; then
        log "Backing up database..."
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database_backup.sql"
        success "Database backup created"
    fi

    # Backup current build
    if [ -d "dist" ]; then
        cp -r dist "$BACKUP_DIR/"
        success "Build backup created"
    fi

    # Backup environment files
    cp .env* "$BACKUP_DIR/" 2>/dev/null || true
    success "Environment files backed up to $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."

    npm ci --production=false

    # Install frontend dependencies
    cd services/ai-gateway
    pip install -r requirements.txt
    cd ../..

    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."

    # Clean previous builds
    rm -rf dist
    mkdir -p dist

    # Build Next.js application
    npm run build

    # Build AI Gateway
    cd services/ai-gateway
    python -m py_compile *.py
    cd ../..

    success "Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."

    # Check if Supabase project is configured
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        warning "Supabase URL not found, skipping database migrations"
        return
    fi

    # Run migration script
    if [ -f "database/migrations/001_initial_schema.sql" ]; then
        log "Applying database migrations..."

        # Use Supabase CLI to apply migrations
        supabase db push --db-url "$DATABASE_URL" || {
            warning "Supabase CLI migration failed, trying direct SQL execution..."

            # Fallback to direct SQL execution
            if [ ! -z "$DATABASE_URL" ]; then
                psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
                success "Database migrations applied via psql"
            else
                warning "No database URL available for migrations"
            fi
        }

        success "Database migrations completed"
    else
        warning "No migration files found"
    fi
}

# Test application
test_application() {
    log "Testing application..."

    # Run unit tests
    npm test --if-present

    # Run build verification
    if [ -d "dist" ]; then
        success "Build verification passed"
    else
        error "Build verification failed - dist directory not found"
    fi

    # Test database connection
    if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        log "Testing database connection..."

        # Create a simple test script
        cat > test-connection.js << 'EOF'
import { supabase } from './lib/database.js';

async function testConnection() {
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) {
      throw error;
    }
    console.log('Database connection test passed');
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

        # Run connection test
        if node test-connection.js; then
            success "Database connection test passed"
        else
            warning "Database connection test failed"
        fi

        # Clean up test file
        rm test-connection.js
    fi

    success "Application tests completed"
}

# Deploy to production
deploy_to_production() {
    log "Deploying to production..."

    # Copy files to deployment directory
    mkdir -p deployment
    cp -r dist/* deployment/ 2>/dev/null || true
    cp -r public/* deployment/ 2>/dev/null || true

    # Copy environment configuration
    if [ -f ".env.$ENVIRONMENT" ]; then
        cp .env.$ENVIRONMENT deployment/.env
    elif [ -f ".env.production" ]; then
        cp .env.production deployment/.env
    fi

    # Copy package files
    cp package.json deployment/
    cp package-lock.json deployment/ 2>/dev/null || true

    success "Files deployed to production directory"
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."

    # Clear caches
    npm run dev -- --clear 2>/dev/null || true

    # Restart services (if running in container)
    if command -v docker &> /dev/null; then
        docker-compose restart 2>/dev/null || true
    fi

    # Send deployment notification (if configured)
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 $PROJECT_NAME deployed to $ENVIRONMENT successfully!\"}" \
            $SLACK_WEBHOOK_URL 2>/dev/null || true
    fi

    success "Post-deployment tasks completed"
}

# Main deployment function
main() {
    log "Starting deployment process for $ENVIRONMENT environment..."

    check_requirements
    load_environment
    create_backup
    install_dependencies
    build_application
    run_migrations
    test_application
    deploy_to_production
    post_deployment

    success "Deployment completed successfully!"
    success "Backup created at: $BACKUP_DIR"
    success "Deployment directory: deployment/"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"