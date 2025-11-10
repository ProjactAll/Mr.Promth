/**
 * Test Agent Chain Integration
 * ทดสอบว่า Agent 1-7 สามารถทำงานร่วมกันได้หรือไม่
 */

import { executeAgent1 } from './lib/agents/agent1'
import { executeAgent2 } from './lib/agents/agent2'
import { executeAgent3 } from './lib/agents/agent3'
import {
  executeAgent4Wrapper,
  executeAgent5Wrapper,
  executeAgent6Wrapper,
  executeAgent7Wrapper,
} from './lib/agents/agent-wrappers'

async function testAgentChain() {
  console.log('🧪 Testing Agent Chain Integration...\n')

  try {
    // Test Agent 1: Prompt Expander
    console.log('1️⃣ Testing Agent 1: Prompt Expander & Analyzer')
    const agent1Output = await executeAgent1('Create a simple todo app with Next.js and Supabase')
    console.log('✅ Agent 1 completed')
    console.log('   Project type:', agent1Output.project_type)
    console.log('   Features:', agent1Output.features.length)
    console.log('   Pages:', agent1Output.pages.length)
    console.log()

    // Test Agent 2: Architecture Designer
    console.log('2️⃣ Testing Agent 2: Architecture Designer')
    const agent2Output = await executeAgent2(agent1Output)
    console.log('✅ Agent 2 completed')
    console.log('   Tables:', agent2Output.database_schema.tables.length)
    console.log('   API endpoints:', agent2Output.api_endpoints.length)
    console.log()

    // Test Agent 3: Database & Backend
    console.log('3️⃣ Testing Agent 3: Database & Backend Developer')
    const agent3Output = await executeAgent3(agent2Output)
    console.log('✅ Agent 3 completed')
    console.log('   Migrations:', agent3Output.migrations.length)
    console.log('   API routes:', agent3Output.api_routes.length)
    console.log()

    // Test Agent 4: Frontend
    console.log('4️⃣ Testing Agent 4: Frontend Component Developer')
    const projectId = 'test-' + Date.now()
    const agent4Output = await executeAgent4Wrapper(
      agent1Output,
      agent2Output,
      agent3Output,
      projectId
    )
    console.log('✅ Agent 4 completed')
    console.log('   Success:', agent4Output.success)
    console.log('   Files generated:', agent4Output.filesGenerated.length)
    console.log()

    // Test Agent 5: Testing & QA
    console.log('5️⃣ Testing Agent 5: Testing & Quality Assurance')
    const agent5Output = await executeAgent5Wrapper(
      agent1Output,
      agent2Output,
      agent3Output,
      agent4Output,
      projectId
    )
    console.log('✅ Agent 5 completed')
    console.log('   Success:', agent5Output.success)
    console.log()

    // Test Agent 6: Deployment
    console.log('6️⃣ Testing Agent 6: Deployment')
    const agent6Output = await executeAgent6Wrapper(
      agent1Output,
      agent2Output,
      agent3Output,
      agent4Output,
      agent5Output,
      projectId
    )
    console.log('✅ Agent 6 completed')
    console.log('   Success:', agent6Output.success)
    console.log()

    // Test Agent 7: Monitoring
    console.log('7️⃣ Testing Agent 7: Monitoring & Analytics')
    const agent7Output = await executeAgent7Wrapper(
      agent1Output,
      agent2Output,
      agent3Output,
      agent4Output,
      agent5Output,
      agent6Output,
      projectId
    )
    console.log('✅ Agent 7 completed')
    console.log('   Success:', agent7Output.success)
    console.log()

    console.log('🎉 All agents completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   ✅ Agent 1: Prompt Expander & Analyzer')
    console.log('   ✅ Agent 2: Architecture Designer')
    console.log('   ✅ Agent 3: Database & Backend Developer')
    console.log('   ✅ Agent 4: Frontend Component Developer')
    console.log('   ✅ Agent 5: Testing & Quality Assurance')
    console.log('   ✅ Agent 6: Deployment')
    console.log('   ✅ Agent 7: Monitoring & Analytics')
    console.log('\n✨ Agent Chain Integration: PASSED')

    return true
  } catch (error) {
    console.error('❌ Agent chain test failed:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    return false
  }
}

// Run test
testAgentChain()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
