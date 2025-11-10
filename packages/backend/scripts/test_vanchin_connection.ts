/**
 * Test Vanchin AI Connection
 * Tests all 19 models to ensure they are working properly
 */

import { createVanchinClient, getModelEndpoint, VANCHIN_MODELS } from './lib/ai/vanchin-client'

interface TestResult {
  modelKey: string
  modelName: string
  endpoint: string
  status: 'success' | 'failed'
  responseTime: number
  error?: string
  response?: string
}

async function testModel(modelKey: keyof typeof VANCHIN_MODELS): Promise<TestResult> {
  const startTime = Date.now()
  const model = VANCHIN_MODELS[modelKey]
  
  try {
    const client = createVanchinClient(modelKey)
    const endpoint = getModelEndpoint(modelKey)
    
    const response = await client.chat.completions.create({
      model: endpoint,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello, I am working!" in one sentence.' }
      ],
      max_tokens: 50,
      temperature: 0.7
    })
    
    const responseTime = Date.now() - startTime
    const content = response.choices[0]?.message?.content || 'No response'
    
    return {
      modelKey,
      modelName: model.name,
      endpoint: model.endpointId,
      status: 'success',
      responseTime,
      response: content
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    
    return {
      modelKey,
      modelName: model.name,
      endpoint: model.endpointId,
      status: 'failed',
      responseTime,
      error: error.message || 'Unknown error'
    }
  }
}

async function testAllModels() {
  console.log('🚀 Testing Vanchin AI Connection...\n')
  console.log('=' .repeat(80))
  console.log('Testing 19 Vanchin AI Models')
  console.log('=' .repeat(80))
  console.log()
  
  const modelKeys = Object.keys(VANCHIN_MODELS) as (keyof typeof VANCHIN_MODELS)[]
  const results: TestResult[] = []
  
  // Test models sequentially to avoid rate limiting
  for (let i = 0; i < modelKeys.length; i++) {
    const modelKey = modelKeys[i]
    const model = VANCHIN_MODELS[modelKey]
    
    console.log(`[${i + 1}/${modelKeys.length}] Testing ${model.name} (${modelKey})...`)
    
    const result = await testModel(modelKey)
    results.push(result)
    
    if (result.status === 'success') {
      console.log(`✅ SUCCESS - Response time: ${result.responseTime}ms`)
      console.log(`   Response: ${result.response?.substring(0, 60)}...`)
    } else {
      console.log(`❌ FAILED - ${result.error}`)
    }
    
    console.log()
    
    // Wait 1 second between requests to avoid rate limiting
    if (i < modelKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // Summary
  console.log('=' .repeat(80))
  console.log('Test Summary')
  console.log('=' .repeat(80))
  console.log()
  
  const successCount = results.filter(r => r.status === 'success').length
  const failedCount = results.filter(r => r.status === 'failed').length
  const avgResponseTime = results
    .filter(r => r.status === 'success')
    .reduce((sum, r) => sum + r.responseTime, 0) / successCount
  
  console.log(`Total Models: ${results.length}`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failedCount}`)
  console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`)
  console.log()
  
  if (failedCount > 0) {
    console.log('Failed Models:')
    results
      .filter(r => r.status === 'failed')
      .forEach(r => {
        console.log(`  - ${r.modelName} (${r.modelKey}): ${r.error}`)
      })
    console.log()
  }
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `test_results_${timestamp}.json`
  
  const fs = require('fs')
  fs.writeFileSync(filename, JSON.stringify(results, null, 2))
  
  console.log(`📝 Results saved to: ${filename}`)
  console.log()
  
  if (successCount === results.length) {
    console.log('🎉 All models are working perfectly!')
  } else {
    console.log('⚠️  Some models failed. Please check the errors above.')
  }
}

// Run tests
testAllModels().catch(console.error)
