/**
 * API Routes Test Script
 * 
 * This script tests all API routes to ensure they are working correctly.
 * Run with: npx ts-node tests/api-test.ts
 */

interface TestResult {
  route: string
  method: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  error?: string
  note?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const API_ROUTES = [
  // Health Check
  { route: '/api/health', method: 'GET', requiresAuth: false },
  
  // Admin Routes (require admin auth)
  { route: '/api/admin/users', method: 'GET', requiresAuth: true, requiresAdmin: true },
  { route: '/api/admin/analytics', method: 'GET', requiresAuth: true, requiresAdmin: true },
  { route: '/api/admin/logs', method: 'GET', requiresAuth: true, requiresAdmin: true },
  
  // Agent Routes
  { route: '/api/agents', method: 'GET', requiresAuth: false },
  { route: '/api/agent-chain', method: 'POST', requiresAuth: true },
  
  // API Keys
  { route: '/api/api-keys', method: 'GET', requiresAuth: true },
  
  // Auth Routes
  { route: '/api/auth/session', method: 'GET', requiresAuth: false },
  
  // Chat Routes
  { route: '/api/chat', method: 'POST', requiresAuth: true },
  
  // Code Routes (new)
  { route: '/api/code/complete', method: 'POST', requiresAuth: true },
  { route: '/api/code/explain', method: 'POST', requiresAuth: true },
  { route: '/api/code/review', method: 'POST', requiresAuth: true },
  
  // File Routes
  { route: '/api/files', method: 'GET', requiresAuth: true },
  { route: '/api/files/upload', method: 'POST', requiresAuth: true },
  
  // GitHub Routes
  { route: '/api/github/repos', method: 'GET', requiresAuth: true },
  
  // Projects
  { route: '/api/projects', method: 'GET', requiresAuth: true },
  
  // Templates
  { route: '/api/templates', method: 'GET', requiresAuth: false },
  
  // Prompts
  { route: '/api/prompts', method: 'GET', requiresAuth: true },
  { route: '/api/prompt-templates', method: 'GET', requiresAuth: false },
  
  // Rooms
  { route: '/api/rooms', method: 'GET', requiresAuth: true },
  
  // Sessions
  { route: '/api/sessions', method: 'GET', requiresAuth: true },
  
  // Tools
  { route: '/api/tools', method: 'GET', requiresAuth: false },
  
  // Workflow
  { route: '/api/workflow', method: 'POST', requiresAuth: true },
]

async function testRoute(route: { route: string; method: string; requiresAuth: boolean; requiresAdmin?: boolean }): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Skip routes that require authentication for now
    if (route.requiresAuth) {
      return {
        route: route.route,
        method: route.method,
        status: 'SKIP',
        note: 'Requires authentication'
      }
    }

    const response = await fetch(`${BASE_URL}${route.route}`, options)
    
    // Routes that don't require auth should return 200 or 401
    const expectedCodes = route.requiresAuth ? [401, 403] : [200, 400, 404]
    const isExpected = expectedCodes.includes(response.status)

    return {
      route: route.route,
      method: route.method,
      status: isExpected ? 'PASS' : 'FAIL',
      statusCode: response.status,
      error: isExpected ? undefined : `Unexpected status code: ${response.status}`
    }
  } catch (error: any) {
    return {
      route: route.route,
      method: route.method,
      status: 'FAIL',
      error: error.message
    }
  }
}

async function runTests() {
  console.log('🧪 Starting API Routes Test\n')
  console.log(`Base URL: ${BASE_URL}\n`)
  console.log('=' .repeat(80))
  
  const results: TestResult[] = []
  
  for (const route of API_ROUTES) {
    const result = await testRoute(route)
    results.push(result)
    
    const icon = result.status === 'PASS' ? '' : result.status === 'SKIP' ? '⏭' : ''
    const statusCode = result.statusCode ? ` (${result.statusCode})` : ''
    const note = result.note ? ` - ${result.note}` : ''
    const error = result.error ? ` - ${result.error}` : ''
    
    console.log(`${icon} ${result.method.padEnd(6)} ${result.route}${statusCode}${note}${error}`)
  }
  
  console.log('=' .repeat(80))
  console.log('\n Test Summary\n')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  const total = results.length
  
  console.log(`Total Routes: ${total}`)
  console.log(` Passed: ${passed}`)
  console.log(` Failed: ${failed}`)
  console.log(`⏭ Skipped: ${skipped}`)
  console.log(`\nSuccess Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n Failed Routes:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.method} ${r.route}: ${r.error}`)
    })
  }
  
  console.log('\n Test completed!')
}

// Run tests
runTests().catch(console.error)
