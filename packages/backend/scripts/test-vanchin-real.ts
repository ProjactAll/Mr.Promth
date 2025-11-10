/**
 * Real Vanchin AI Test
 * Test actual API calls to verify configuration
 */

import { createVanchinClient, getModelEndpoint, VANCHIN_MODELS } from './lib/ai/vanchin-client'

async function testVanchinAI() {
  console.log('🧪 Testing Vanchin AI Configuration...\n')
  
  // Test Model 1
  console.log('Testing Model 1...')
  try {
    const client = createVanchinClient('model_1')
    const endpoint = getModelEndpoint('model_1')
    
    console.log(`  API Key: ${VANCHIN_MODELS.model_1.apiKey.substring(0, 10)}...`)
    console.log(`  Endpoint: ${endpoint}`)
    console.log(`  Base URL: https://vanchin.streamlake.ai/api/gateway/v1/endpoints`)
    
    const response = await client.chat.completions.create({
      model: endpoint,
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Say "Hello from Vanchin AI!" in one sentence.' }
      ],
      max_tokens: 50
    })
    
    console.log(`   Response: ${response.choices[0].message.content}\n`)
  } catch (error: any) {
    console.error(`   Error: ${error.message}\n`)
    throw error
  }
  
  // Test Model 2
  console.log('Testing Model 2...')
  try {
    const client = createVanchinClient('model_2')
    const endpoint = getModelEndpoint('model_2')
    
    console.log(`  API Key: ${VANCHIN_MODELS.model_2.apiKey.substring(0, 10)}...`)
    console.log(`  Endpoint: ${endpoint}`)
    
    const response = await client.chat.completions.create({
      model: endpoint,
      messages: [
        { role: 'user', content: 'What is 2+2? Answer in one word.' }
      ],
      max_tokens: 10
    })
    
    console.log(`   Response: ${response.choices[0].message.content}\n`)
  } catch (error: any) {
    console.error(`   Error: ${error.message}\n`)
    throw error
  }
  
  // Test Model 3
  console.log('Testing Model 3...')
  try {
    const client = createVanchinClient('model_3')
    const endpoint = getModelEndpoint('model_3')
    
    console.log(`  API Key: ${VANCHIN_MODELS.model_3.apiKey.substring(0, 10)}...`)
    console.log(`  Endpoint: ${endpoint}`)
    
    const response = await client.chat.completions.create({
      model: endpoint,
      messages: [
        { role: 'user', content: 'Say "Test successful" in Thai.' }
      ],
      max_tokens: 20
    })
    
    console.log(`   Response: ${response.choices[0].message.content}\n`)
  } catch (error: any) {
    console.error(`   Error: ${error.message}\n`)
    throw error
  }
  
  console.log(' All Vanchin AI tests passed!')
  console.log('\n Summary:')
  console.log(`  Total models configured: ${Object.keys(VANCHIN_MODELS).length}`)
  console.log(`  Models tested: 3`)
  console.log(`  All tests: PASSED `)
}

// Run tests
testVanchinAI()
  .then(() => {
    console.log('\n Vanchin AI is working correctly!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n Vanchin AI test failed:', error)
    process.exit(1)
  })
