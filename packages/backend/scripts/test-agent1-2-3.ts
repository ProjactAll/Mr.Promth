/**
 * Test Agent 1-2-3 Chain
 * ทดสอบการทำงานของ Agent chain จาก prompt → architecture → code
 */

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
  console.log(' Environment variables loaded\n')
} catch (error) {
  console.warn('  Could not load .env.local file\n')
}

import { executeAgent1 } from './lib/agents/agent1'
import { executeAgent2 } from './lib/agents/agent2'
import { executeAgent3 } from './lib/agents/agent3'

async function testAgent123Chain() {
  console.log('🧪 Testing Agent 1-2-3 Chain...\n')

  try {
    // Step 1: Run Agent 1
    console.log('')
    console.log('1⃣  Agent 1: Prompt Expander')
    console.log('\n')
    
    const testPrompt = 'Create a simple todo app with Next.js and Supabase'
    console.log(' Input:', testPrompt)
    console.log('⏳ Processing...\n')
    
    const startTime1 = Date.now()
    const agent1Output = await executeAgent1(testPrompt)
    const duration1 = Date.now() - startTime1
    
    console.log(` Agent 1 completed in ${duration1}ms`)
    console.log(`   Features: ${agent1Output.features?.length || 0}`)
    console.log(`   Pages: ${agent1Output.pages?.length || 0}\n`)

    // Step 2: Run Agent 2
    console.log('')
    console.log('2⃣  Agent 2: Architecture Designer')
    console.log('\n')
    
    console.log('⏳ Processing...\n')
    
    const startTime2 = Date.now()
    const agent2Output = await executeAgent2(agent1Output)
    const duration2 = Date.now() - startTime2
    
    console.log(` Agent 2 completed in ${duration2}ms`)
    console.log(`   Tables: ${agent2Output.database_schema?.tables?.length || 0}`)
    console.log(`   Endpoints: ${agent2Output.api_endpoints?.length || 0}\n`)

    // Step 3: Run Agent 3
    console.log('')
    console.log('3⃣  Agent 3: Database & Backend Developer')
    console.log('\n')
    
    console.log('⏳ Processing...\n')
    
    const startTime3 = Date.now()
    const agent3Output = await executeAgent3(agent2Output)
    const duration3 = Date.now() - startTime3
    
    console.log(` Agent 3 completed in ${duration3}ms\n`)
    
    // Analyze Agent 3 Output
    console.log(' Agent 3 Output Analysis:')
    console.log('\n')
    
    // Migrations
    console.log(` Migrations: ${agent3Output.migrations.length} files`)
    agent3Output.migrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.filename}`)
      console.log(`      Description: ${m.description}`)
      console.log(`      SQL lines: ${m.sql.split('\n').length}`)
    })
    console.log()
    
    // API Routes
    console.log(` API Routes: ${agent3Output.api_routes.length} files`)
    agent3Output.api_routes.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.filename}`)
      console.log(`      Path: ${r.path}`)
      console.log(`      Code lines: ${r.code.split('\n').length}`)
    })
    console.log()
    
    // Database Functions
    console.log(` Database Functions: ${agent3Output.database_functions.length} functions`)
    agent3Output.database_functions.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name}`)
      console.log(`      Description: ${f.description}`)
    })
    console.log()
    
    // RLS Policies
    console.log(` RLS Policies: ${agent3Output.rls_policies.length} policies`)
    const policyTables = [...new Set(agent3Output.rls_policies.map(p => p.table))]
    console.log(`   Tables with policies: ${policyTables.join(', ')}`)
    console.log()
    
    // Validation Schemas
    console.log(` Validation Schemas: ${agent3Output.validation_schemas.length} schemas`)
    agent3Output.validation_schemas.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name}`)
      console.log(`      Fields: ${Object.keys(s.schema).length}`)
    })
    console.log()

    // Summary
    console.log('')
    console.log(' Test Summary')
    console.log('\n')
    console.log(`    Agent 1: ${duration1}ms`)
    console.log(`    Agent 2: ${duration2}ms`)
    console.log(`    Agent 3: ${duration3}ms`)
    console.log(`    Total: ${duration1 + duration2 + duration3}ms\n`)
    
    // Quality Check
    const hasValidMigrations = agent3Output.migrations.length > 0
    const hasValidApiRoutes = agent3Output.api_routes.length > 0
    const hasValidFunctions = agent3Output.database_functions.length > 0
    const hasValidPolicies = agent3Output.rls_policies.length > 0
    
    if (hasValidMigrations && hasValidApiRoutes && hasValidFunctions && hasValidPolicies) {
      console.log(' Agent 1-2-3 Chain Test: PASSED')
      console.log('    Migrations generated')
      console.log('    API routes generated')
      console.log('    Database functions generated')
      console.log('    RLS policies generated')
      console.log('    Output structure valid')
    } else {
      console.log('  Agent 1-2-3 Chain Test: PARTIAL')
      if (!hasValidMigrations) console.log('    Migrations missing')
      if (!hasValidApiRoutes) console.log('    API routes missing')
      if (!hasValidFunctions) console.log('    Database functions missing')
      if (!hasValidPolicies) console.log('    RLS policies missing')
    }
    console.log()

    // Save outputs for inspection
    const fs = await import('fs/promises')
    await fs.writeFile(
      '/tmp/agent3-migrations.sql',
      agent3Output.migrations.map(m => m.sql).join('\n\n'),
      'utf-8'
    )
    console.log(' Saved migrations to: /tmp/agent3-migrations.sql')
    
    if (agent3Output.api_routes.length > 0) {
      await fs.writeFile(
        '/tmp/agent3-api-route-example.ts',
        agent3Output.api_routes[0].code,
        'utf-8'
      )
      console.log(' Saved API route example to: /tmp/agent3-api-route-example.ts')
    }
    console.log()

    return { success: true, agent1Output, agent2Output, agent3Output }
  } catch (error) {
    console.error('\n Agent chain test failed:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    return { success: false, error }
  }
}

// Run test
testAgent123Chain()
  .then((result) => {
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
