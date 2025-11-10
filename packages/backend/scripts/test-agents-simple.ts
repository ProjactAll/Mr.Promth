/**
 * Simple Agent Test
 * ทดสอบ Agent 1-2 ที่ใช้งานได้แน่นอน
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

async function testAgentsSimple() {
  console.log('🧪 Testing Agent 1-2 Integration...\n')

  try {
    // Test Agent 1: Prompt Expander
    console.log('')
    console.log('1⃣  Agent 1: Prompt Expander & Analyzer')
    console.log('\n')
    
    const testPrompt = 'Create a simple todo app with Next.js and Supabase'
    console.log(' Input prompt:', testPrompt)
    console.log('⏳ Processing...\n')
    
    const startTime1 = Date.now()
    const agent1Output = await executeAgent1(testPrompt)
    const duration1 = Date.now() - startTime1
    
    console.log(' Agent 1 completed in', duration1, 'ms')
    console.log('\n Agent 1 Output:')
    console.log('   Project type:', agent1Output.project_type)
    
    // Handle tech_stack (might be array or object)
    if (Array.isArray(agent1Output.tech_stack)) {
      console.log('   Tech stack:', agent1Output.tech_stack.join(', '))
    } else if (agent1Output.tech_stack) {
      console.log('   Tech stack:', JSON.stringify(agent1Output.tech_stack))
    }
    
    // Handle features
    if (agent1Output.features && Array.isArray(agent1Output.features)) {
      console.log('   Features:', agent1Output.features.length, 'features')
      agent1Output.features.forEach((f: any, i: number) => {
        console.log(`     ${i + 1}. ${f.name || f}`)
      })
    } else {
      console.log('   Features:', JSON.stringify(agent1Output.features))
    }
    
    // Handle pages
    if (agent1Output.pages && Array.isArray(agent1Output.pages)) {
      console.log('   Pages:', agent1Output.pages.length, 'pages')
      agent1Output.pages.forEach((p: any, i: number) => {
        console.log(`     ${i + 1}. ${p.path || p.route || '/'} - ${p.name || p.title || 'Page'}`)
      })
    } else {
      console.log('   Pages:', JSON.stringify(agent1Output.pages))
    }
    console.log()

    // Test Agent 2: Architecture Designer
    console.log('')
    console.log('2⃣  Agent 2: Architecture Designer')
    console.log('\n')
    
    console.log('⏳ Processing...\n')
    
    const startTime2 = Date.now()
    const agent2Output = await executeAgent2(agent1Output)
    const duration2 = Date.now() - startTime2
    
    console.log(' Agent 2 completed in', duration2, 'ms')
    console.log('\n Agent 2 Output:')
    
    // Handle database tables
    if (agent2Output.database_schema?.tables && Array.isArray(agent2Output.database_schema.tables)) {
      console.log('   Database tables:', agent2Output.database_schema.tables.length, 'tables')
      agent2Output.database_schema.tables.forEach((t: any, i: number) => {
        const colCount = t.columns?.length || 0
        console.log(`     ${i + 1}. ${t.name} (${colCount} columns)`)
      })
    } else {
      console.log('   Database schema:', JSON.stringify(agent2Output.database_schema))
    }
    
    // Handle API endpoints
    if (agent2Output.api_endpoints && Array.isArray(agent2Output.api_endpoints)) {
      console.log('   API endpoints:', agent2Output.api_endpoints.length, 'endpoints')
      agent2Output.api_endpoints.forEach((e: any, i: number) => {
        console.log(`     ${i + 1}. ${e.method || 'GET'} ${e.path || e.route || e.endpoint || 'N/A'}`)
      })
    } else {
      console.log('   API endpoints:', JSON.stringify(agent2Output.api_endpoints))
    }
    
    // Handle folder structure
    if (agent2Output.folder_structure && Array.isArray(agent2Output.folder_structure)) {
      console.log('   Folder structure:', agent2Output.folder_structure.length, 'folders')
    } else {
      console.log('   Folder structure:', typeof agent2Output.folder_structure)
    }
    
    // Handle components
    if (agent2Output.components && Array.isArray(agent2Output.components)) {
      console.log('   Components:', agent2Output.components.length, 'components')
    } else {
      console.log('   Components:', typeof agent2Output.components)
    }
    console.log()

    // Summary
    console.log('')
    console.log(' Test Summary')
    console.log('\n')
    console.log('    Agent 1: Prompt Expander & Analyzer')
    console.log(`      Duration: ${duration1}ms`)
    console.log(`      Output: ${agent1Output.features.length} features, ${agent1Output.pages.length} pages`)
    console.log()
    console.log('    Agent 2: Architecture Designer')
    console.log(`      Duration: ${duration2}ms`)
    console.log(`      Output: ${agent2Output.database_schema.tables.length} tables, ${agent2Output.api_endpoints.length} endpoints`)
    console.log()
    console.log('    Total time:', duration1 + duration2, 'ms')
    console.log()
    console.log(' Agent 1-2 Integration: PASSED')
    console.log()

    return { success: true, agent1Output, agent2Output }
  } catch (error) {
    console.error('\n Agent test failed:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    return { success: false, error }
  }
}

// Run test
testAgentsSimple()
  .then((result) => {
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
