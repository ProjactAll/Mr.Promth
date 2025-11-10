/**
 * Test Full Agent Chain (1-7)
 * ทดสอบการทำงานของ Agent chain ทั้งหมด
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
  console.log('✅ Environment variables loaded\n')
} catch (error) {
  console.warn('⚠️  Could not load .env.local file\n')
}

import { executeAgent1 } from './lib/agents/agent1'
import { executeAgent2 } from './lib/agents/agent2'
import { executeAgent3 } from './lib/agents/agent3'
import {
  executeAgent4Wrapper,
  executeAgent5Wrapper,
  executeAgent6Wrapper,
  executeAgent7Wrapper
} from './lib/agents/agent-wrappers'

async function testFullAgentChain() {
  console.log('🧪 Testing Full Agent Chain (1-7)...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const testPrompt = 'Create a simple todo app with Next.js and Supabase'
  const projectId = `test-${Date.now()}`
  
  const results: any = {
    success: false,
    agents: {},
    totalTime: 0,
    errors: []
  }

  try {
    // ============================================
    // Agent 1: Prompt Expander
    // ============================================
    console.log('1️⃣  Agent 1: Prompt Expander')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📝 Input:', testPrompt)
    console.log('⏳ Processing...\n')
    
    const startTime1 = Date.now()
    const agent1Output = await executeAgent1(testPrompt)
    const duration1 = Date.now() - startTime1
    
    console.log(`✅ Agent 1 completed in ${duration1}ms`)
    console.log(`   Features: ${agent1Output.features?.length || 0}`)
    console.log(`   Pages: ${agent1Output.pages?.length || 0}\n`)
    
    results.agents.agent1 = { success: true, duration: duration1, output: agent1Output }
    results.totalTime += duration1

    // ============================================
    // Agent 2: Architecture Designer
    // ============================================
    console.log('2️⃣  Agent 2: Architecture Designer')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⏳ Processing...\n')
    
    const startTime2 = Date.now()
    const agent2Output = await executeAgent2(agent1Output)
    const duration2 = Date.now() - startTime2
    
    console.log(`✅ Agent 2 completed in ${duration2}ms`)
    console.log(`   Tables: ${agent2Output.database_schema?.tables?.length || 0}`)
    console.log(`   Endpoints: ${agent2Output.api_endpoints?.length || 0}\n`)
    
    results.agents.agent2 = { success: true, duration: duration2, output: agent2Output }
    results.totalTime += duration2

    // ============================================
    // Agent 3: Database & Backend Developer
    // ============================================
    console.log('3️⃣  Agent 3: Database & Backend Developer')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⏳ Processing...\n')
    
    const startTime3 = Date.now()
    const agent3Output = await executeAgent3(agent2Output)
    const duration3 = Date.now() - startTime3
    
    console.log(`✅ Agent 3 completed in ${duration3}ms`)
    console.log(`   Migrations: ${agent3Output.migrations.length}`)
    console.log(`   API Routes: ${agent3Output.api_routes.length}`)
    console.log(`   Functions: ${agent3Output.database_functions.length}`)
    console.log(`   Policies: ${agent3Output.rls_policies.length}\n`)
    
    results.agents.agent3 = { success: true, duration: duration3, output: agent3Output }
    results.totalTime += duration3

    // ============================================
    // Agent 4: Frontend Generator
    // ============================================
    console.log('4️⃣  Agent 4: Frontend Generator')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⏳ Processing...\n')
    
    try {
      const startTime4 = Date.now()
      const agent4Output = await executeAgent4Wrapper(
        agent1Output,
        agent2Output,
        agent3Output,
        projectId
      )
      const duration4 = Date.now() - startTime4
      
      console.log(`✅ Agent 4 completed in ${duration4}ms`)
      console.log(`   Files Generated: ${agent4Output.filesGenerated?.length || 0}`)
      console.log(`   Components: ${agent4Output.componentsCreated?.length || 0}\n`)
      
      results.agents.agent4 = { success: true, duration: duration4, output: agent4Output }
      results.totalTime += duration4
    } catch (error) {
      console.log(`⚠️  Agent 4 failed: ${error instanceof Error ? error.message : String(error)}\n`)
      results.agents.agent4 = { success: false, error: String(error) }
      results.errors.push({ agent: 4, error: String(error) })
    }

    // ============================================
    // Agent 5: Testing & QA
    // ============================================
    console.log('5️⃣  Agent 5: Testing & QA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⏳ Processing...\n')
    
    try {
      const startTime5 = Date.now()
      const agent5Output = await executeAgent5Wrapper(
        agent1Output,
        agent2Output,
        agent3Output,
        results.agents.agent4?.output,
        projectId
      )
      const duration5 = Date.now() - startTime5
      
      console.log(`✅ Agent 5 completed in ${duration5}ms`)
      console.log(`   Tests Created: ${agent5Output.testsCreated?.length || 0}`)
      console.log(`   Coverage: ${agent5Output.coverageReport?.overall || 'N/A'}\n`)
      
      results.agents.agent5 = { success: true, duration: duration5, output: agent5Output }
      results.totalTime += duration5
    } catch (error) {
      console.log(`⚠️  Agent 5 failed: ${error instanceof Error ? error.message : String(error)}\n`)
      results.agents.agent5 = { success: false, error: String(error) }
      results.errors.push({ agent: 5, error: String(error) })
    }

    // ============================================
    // Agent 6: Deployment (Dry Run)
    // ============================================
    console.log('6️⃣  Agent 6: Deployment (Dry Run)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⏳ Processing...\n')
    
    try {
      const startTime6 = Date.now()
      const agent6Output = await executeAgent6Wrapper(
        agent1Output,
        agent2Output,
        agent3Output,
        results.agents.agent4?.output,
        results.agents.agent5?.output,
        projectId
      )
      const duration6 = Date.now() - startTime6
      
      console.log(`✅ Agent 6 completed in ${duration6}ms`)
      console.log(`   Deployment URL: ${agent6Output.deploymentUrl || 'N/A'}`)
      console.log(`   Status: ${agent6Output.status || 'N/A'}\n`)
      
      results.agents.agent6 = { success: true, duration: duration6, output: agent6Output }
      results.totalTime += duration6
    } catch (error) {
      console.log(`⚠️  Agent 6 failed: ${error instanceof Error ? error.message : String(error)}\n`)
      results.agents.agent6 = { success: false, error: String(error) }
      results.errors.push({ agent: 6, error: String(error) })
    }

    // ============================================
    // Agent 7: Monitoring
    // ============================================
    console.log('7️⃣  Agent 7: Monitoring')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⏳ Processing...\n')
    
    try {
      const startTime7 = Date.now()
      const agent7Output = await executeAgent7Wrapper(
        agent1Output,
        agent2Output,
        agent3Output,
        results.agents.agent4?.output,
        results.agents.agent5?.output,
        results.agents.agent6?.output,
        projectId
      )
      const duration7 = Date.now() - startTime7
      
      console.log(`✅ Agent 7 completed in ${duration7}ms`)
      console.log(`   Monitors Setup: ${agent7Output.monitorsSetup?.length || 0}`)
      console.log(`   Alerts Configured: ${agent7Output.alertsConfigured || 0}\n`)
      
      results.agents.agent7 = { success: true, duration: duration7, output: agent7Output }
      results.totalTime += duration7
    } catch (error) {
      console.log(`⚠️  Agent 7 failed: ${error instanceof Error ? error.message : String(error)}\n`)
      results.agents.agent7 = { success: false, error: String(error) }
      results.errors.push({ agent: 7, error: String(error) })
    }

    // ============================================
    // Summary
    // ============================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Test Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const successfulAgents = Object.values(results.agents).filter((a: any) => a.success).length
    const totalAgents = 7
    
    console.log(`✅ Successful Agents: ${successfulAgents}/${totalAgents}`)
    console.log(`⏱️  Total Time: ${results.totalTime}ms (${(results.totalTime / 1000).toFixed(1)}s)\n`)
    
    // Per-agent summary
    for (let i = 1; i <= 7; i++) {
      const agent = results.agents[`agent${i}`]
      if (agent) {
        if (agent.success) {
          console.log(`   ✅ Agent ${i}: ${agent.duration}ms`)
        } else {
          console.log(`   ❌ Agent ${i}: Failed - ${agent.error}`)
        }
      } else {
        console.log(`   ⏭️  Agent ${i}: Skipped`)
      }
    }
    console.log()
    
    // Errors
    if (results.errors.length > 0) {
      console.log('⚠️  Errors Encountered:')
      results.errors.forEach((err: any) => {
        console.log(`   Agent ${err.agent}: ${err.error}`)
      })
      console.log()
    }
    
    // Overall status
    if (successfulAgents === totalAgents) {
      console.log('✨ Full Agent Chain Test: PASSED')
      console.log('   All 7 agents executed successfully!')
      results.success = true
    } else if (successfulAgents >= 3) {
      console.log('⚠️  Full Agent Chain Test: PARTIAL')
      console.log(`   ${successfulAgents}/7 agents succeeded`)
      console.log('   Core functionality working, some agents need attention')
    } else {
      console.log('❌ Full Agent Chain Test: FAILED')
      console.log(`   Only ${successfulAgents}/7 agents succeeded`)
    }
    console.log()

    return results
  } catch (error) {
    console.error('\n❌ Fatal error in agent chain:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    results.success = false
    results.errors.push({ agent: 'chain', error: String(error) })
    return results
  }
}

// Run test
testFullAgentChain()
  .then((results) => {
    console.log('\n📊 Test Results Summary:')
    console.log(JSON.stringify({
      success: results.success,
      totalTime: results.totalTime,
      successfulAgents: Object.values(results.agents).filter((a: any) => a.success).length,
      totalAgents: 7,
      errors: results.errors.length
    }, null, 2))
    
    process.exit(results.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
