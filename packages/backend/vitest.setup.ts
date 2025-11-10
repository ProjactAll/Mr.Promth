/**
 * Vitest Setup File
 * Runs before all tests
 */

import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  // Setup test environment variables
  // NODE_ENV is read-only in Next.js
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
  
  console.log('🧪 Test environment initialized')
})

afterAll(() => {
  console.log('✅ All tests completed')
})
