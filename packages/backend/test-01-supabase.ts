/**
 * Test 01: Supabase Connection
 * Verify database connection works
 */

import { createClient } from '@supabase/supabase-js'

async function testSupabaseConnection() {
  console.log('🧪 Test 01: Supabase Connection\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing')
    process.exit(1)
  }
  
  console.log('✅ Environment variables found')
  console.log(`  URL: ${supabaseUrl}`)
  console.log(`  Key: ${supabaseKey.substring(0, 20)}...`)
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('\n✅ Supabase client created')
    
    // Test connection by querying a table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('\n❌ Database query failed:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Database connection successful')
    console.log('\n📊 Test Result: PASSED ✅')
    process.exit(0)
    
  } catch (error: any) {
    console.error('\n❌ Connection failed:', error.message)
    process.exit(1)
  }
}

testSupabaseConnection()
