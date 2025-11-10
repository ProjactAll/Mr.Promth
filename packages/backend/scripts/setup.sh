#!/bin/bash

# Mr.Prompt Setup Script
# This script helps set up the development environment for Mr.Prompt

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

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | cut -c1-32
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION found"
        else
            print_error "Node.js 18+ required, found version $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
}

# Function to check Python version
check_python_version() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
        if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$(echo $PYTHON_VERSION | cut -d'.' -f2)" -ge 10 ]; then
            print_success "Python version $PYTHON_VERSION found"
        else
            print_error "Python 3.10+ required, found version $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python not found. Please install Python 3.10+"
        exit 1
    fi
}

# Function to copy environment files
setup_environment_files() {
    print_status "Setting up environment files..."

    # Copy Next.js environment file
    if [ ! -f .env.local ]; then
        if [ -f .env.example ]; then
            cp .env.example .env.local
            print_success "Created .env.local from .env.example"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_warning ".env.local already exists, skipping"
    fi

    # Copy AI Gateway environment file
    if [ ! -f services/ai-gateway/.env ]; then
        if [ -f services/ai-gateway/.env.example ]; then
            cp services/ai-gateway/.env.example services/ai-gateway/.env
            print_success "Created services/ai-gateway/.env from .env.example"
        else
            print_error "services/ai-gateway/.env.example not found"
            exit 1
        fi
    else
        print_warning "services/ai-gateway/.env already exists, skipping"
    fi
}

# Function to prompt for required values
prompt_for_values() {
    print_status "Please provide the following values:"
    echo

    # Generate secrets if not provided
    ENCRYPTION_SECRET=$(generate_secret)
    AI_GATEWAY_API_KEY=$(generate_secret)

    print_status "Generated secrets (save these for later):"
    echo "ENCRYPTION_SECRET: $ENCRYPTION_SECRET"
    echo "AI_GATEWAY_API_KEY: $AI_GATEWAY_API_KEY"
    echo

    # Prompt for Supabase values
    read -p "Enter your Supabase Project URL: " SUPABASE_URL
    read -p "Enter your Supabase anon public key: " SUPABASE_ANON_KEY
    read -p "Enter your Supabase service_role key: " SUPABASE_SERVICE_KEY

    # Prompt for Streamlake values
    read -p "Enter your Streamlake API key: " STREAMLAKE_API_KEY

    echo
    print_status "Updating environment files..."

    # Update .env.local
    sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local 2>/dev/null || true
    sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local 2>/dev/null || true
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" .env.local 2>/dev/null || true
    sed -i.bak "s|ENCRYPTION_SECRET=.*|ENCRYPTION_SECRET=$ENCRYPTION_SECRET|" .env.local 2>/dev/null || true
    sed -i.bak "s|AI_GATEWAY_API_KEY=.*|AI_GATEWAY_API_KEY=$AI_GATEWAY_API_KEY|" .env.local 2>/dev/null || true
    sed -i.bak "s|STREAMLAKE_API_KEY=.*|STREAMLAKE_API_KEY=$STREAMLAKE_API_KEY|" .env.local 2>/dev/null || true

    # Update AI Gateway .env
    sed -i.bak "s|GATEWAY_API_KEY=.*|GATEWAY_API_KEY=$AI_GATEWAY_API_KEY|" services/ai-gateway/.env 2>/dev/null || true
    sed -i.bak "s|STREAMLAKE_API_KEY=.*|STREAMLAKE_API_KEY=$STREAMLAKE_API_KEY|" services/ai-gateway/.env 2>/dev/null || true

    print_success "Environment files updated"

    # Remove backup files
    rm -f .env.local.bak services/ai-gateway/.env.bak
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    # Install Next.js dependencies
    if [ -f "package.json" ]; then
        print_status "Installing Next.js dependencies..."
        npm install
        print_success "Next.js dependencies installed"
    else
        print_warning "package.json not found, skipping Next.js dependencies"
    fi

    # Install AI Gateway dependencies
    if [ -f "services/ai-gateway/requirements.txt" ]; then
        print_status "Installing AI Gateway dependencies..."
        cd services/ai-gateway
        pip install -r requirements.txt
        cd ../..
        print_success "AI Gateway dependencies installed"
    else
        print_warning "services/ai-gateway/requirements.txt not found, skipping AI Gateway dependencies"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Check if Supabase CLI is installed
    if command_exists supabase; then
        print_status "Supabase CLI found, running migrations..."
        supabase db push
        print_success "Database migrations completed"
    else
        print_warning "Supabase CLI not found. Please install it manually:"
        print_warning "npm install -g supabase"
        print_warning "Then run: supabase db push"
    fi
}

# Function to display next steps
display_next_steps() {
    echo
    echo "========================================"
    print_success "Setup completed successfully!"
    echo "========================================"
    echo
    print_status "Next steps:"
    echo "1. Start the AI Gateway:"
    echo "   cd services/ai-gateway && python app.py"
    echo
    echo "2. Start the Next.js application:"
    echo "   npm run dev"
    echo
    echo "3. Open your browser and go to:"
    echo "   http://localhost:3000"
    echo
    print_status "Default credentials:"
    echo "Email: admin@example.com"
    echo "Password: admin123"
    echo
    print_warning "IMPORTANT: Change the default credentials after first login!"
    echo
    print_status "For more information, see docs/setup-guide.md"
}

# Main setup function
main() {
    echo "========================================"
    echo "Mr.Prompt Setup Script"
    echo "========================================"
    echo

    # Check prerequisites
    check_node_version
    check_python_version

    # Setup environment
    setup_environment_files
    prompt_for_values

    # Install dependencies
    install_dependencies

    # Run migrations
    run_migrations

    # Display next steps
    display_next_steps
}

# Handle script interruption
trap 'print_error "Setup interrupted"; exit 1' INT

# Run main function
main "$@"