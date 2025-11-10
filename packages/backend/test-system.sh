#!/bin/bash
# System Integration Test Script
# Tests all major features of Mr.Prompt

set -e

echo "🧪 Mr.Prompt System Integration Test"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local endpoint=$2
  local expected_status=$3
  
  echo -n "Testing $name... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
  
  if [ "$response" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $response)"
    ((FAILED++))
  fi
}

echo "1. Health Checks"
echo "----------------"
test_endpoint "API Health" "/api/health" "200"
test_endpoint "Homepage" "/" "200"
test_endpoint "Login Page" "/login" "200"
test_endpoint "Generate Page" "/generate" "200"
echo ""

echo "2. API Endpoints"
echo "----------------"
test_endpoint "Templates API" "/api/templates" "200"
test_endpoint "Sessions API" "/api/sessions" "401"  # Should require auth
test_endpoint "Chat API" "/api/chat" "401"  # Should require auth
echo ""

echo "3. Static Assets"
echo "----------------"
test_endpoint "Favicon" "/favicon.ico" "200"
echo ""

echo "======================================"
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
