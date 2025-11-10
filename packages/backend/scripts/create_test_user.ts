/**
 * Create Test User in Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createTestUser() {
  console.log('Creating test user...\n')
  
  // Create admin client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const testEmail = 'test@mrpromth.com'
  const testPassword = 'Test123456!'
  
  console.log(`Email: ${testEmail}`)
  console.log(`Password: ${testPassword}`)
  console.log()
  
  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      name: 'Test User',
      role: 'tester'
    }
  })
  
  if (error) {
    console.log(`❌ Error: ${error.message}`)
    
    // Try to get existing user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (!listError && users) {
      const existingUser = users.find(u => u.email === testEmail)
      if (existingUser) {
        console.log(`\n✅ User already exists!`)
        console.log(`User ID: ${existingUser.id}`)
        console.log(`Email: ${existingUser.email}`)
        console.log(`Created: ${existingUser.created_at}`)
        return
      }
    }
  } else {
    console.log(`✅ User created successfully!`)
    console.log(`User ID: ${data.user.id}`)
    console.log(`Email: ${data.user.email}`)
    console.log(`Created: ${data.user.created_at}`)
  }
  
  console.log()
  console.log('You can now login with:')
  console.log(`  Email: ${testEmail}`)
  console.log(`  Password: ${testPassword}`)
  console.log()
}

createTestUser().catch(console.error)
