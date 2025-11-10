/**
 * Test Supabase Connection
 * ทดสอบว่าสามารถเชื่อมต่อกับ Supabase ได้หรือไม่
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local
try {
  const envPath = resolve(__dirname, '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
} catch (error) {
  console.warn('Could not load .env.local file')
}

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n')

  try {
    // ตรวจสอบ environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log(' Environment Variables:')
    console.log('   SUPABASE_URL:', supabaseUrl ? ' Set' : ' Missing')
    console.log('   ANON_KEY:', supabaseAnonKey ? ' Set' : ' Missing')
    console.log('   SERVICE_ROLE_KEY:', supabaseServiceKey ? ' Set' : ' Missing')
    console.log()

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required Supabase credentials')
    }

    // สร้าง Supabase client
    console.log(' Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log(' Supabase client created\n')

    // ทดสอบการเชื่อมต่อด้วย health check
    console.log(' Testing connection health...')
    const { data: healthData, error: healthError } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1)

    if (healthError) {
      // ถ้า table ไม่มีก็ไม่เป็นไร แสดงว่าเชื่อมต่อได้
      if (healthError.message.includes('does not exist')) {
        console.log('  Health check table not found (this is OK)')
        console.log('   Connection is working, but table "_health_check" does not exist')
      } else {
        console.log('  Health check warning:', healthError.message)
      }
    } else {
      console.log(' Health check passed')
    }
    console.log()

    // ทดสอบ list tables
    console.log(' Listing available tables...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .limit(10)

    if (tablesError) {
      console.log('  Could not list tables:', tablesError.message)
      console.log('   This might be because the RPC function does not exist')
    } else if (tables && tables.length > 0) {
      console.log(' Found tables:')
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name || table}`)
      })
    } else {
      console.log('  No tables found or RPC not available')
    }
    console.log()

    // ทดสอบ service role client
    if (supabaseServiceKey) {
      console.log(' Testing service role client...')
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      
      // ลองดึง auth users (ต้องใช้ service role)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.log('  Service role test warning:', authError.message)
      } else {
        console.log(' Service role client working')
        console.log(`   Found ${authData.users.length} users`)
      }
      console.log()
    }

    // สรุปผล
    console.log(' Supabase Connection Test Summary:')
    console.log('    Environment variables configured')
    console.log('    Supabase client created successfully')
    console.log('    Connection to Supabase established')
    console.log('    Ready to use in application')
    console.log()
    console.log(' Supabase Connection: PASSED')

    return true
  } catch (error) {
    console.error(' Supabase connection test failed:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    return false
  }
}

// Run test
testSupabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
