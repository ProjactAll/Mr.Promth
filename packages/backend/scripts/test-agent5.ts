/**
 * Test Agent 5: Testing & QA Automation
 * This script tests the AI-powered test generation
 */

import { agent5TestingQA } from './lib/agents/agent5-testing-qa'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

async function testAgent5() {
  console.log('🧪 Testing Agent 5: Testing & QA Automation\n')
  
  // Create test project directory
  const testProjectPath = join('/tmp', 'test-mr-prompt-testing')
  await mkdir(testProjectPath, { recursive: true })
  await mkdir(join(testProjectPath, 'lib', 'utils'), { recursive: true })
  
  console.log('📁 Test project path:', testProjectPath)
  console.log('')
  
  // Create a sample function to test
  const sampleFunction = `
/**
 * Slugify a string (convert to URL-friendly format)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\\s+/g, '-')
    .replace(/[^\\w\\-]+/g, '')
    .replace(/\\-\\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
`
  
  const sampleFilePath = join(testProjectPath, 'lib', 'utils', 'string.ts')
  await writeFile(sampleFilePath, sampleFunction, 'utf-8')
  
  console.log('📝 Created sample file:', sampleFilePath)
  console.log('')
  
  // Test 1: Generate Tests
  console.log('Test 1: Generate Tests for String Utilities')
  console.log('─'.repeat(50))
  
  try {
    const result1 = await agent5TestingQA({
      projectId: 'test-project',
      projectPath: testProjectPath,
      task: {
        type: 'generate-tests',
        targetFiles: [sampleFilePath],
        testFramework: 'vitest'
      }
    })
    
    console.log('✅ Success:', result1.success)
    
    if (result1.testsGenerated) {
      console.log('📝 Tests generated:', result1.testsGenerated.length)
      result1.testsGenerated.forEach(test => {
        console.log(`   - ${test.path}`)
        console.log(`     Size: ${test.content.length} characters`)
      })
    }
    
    console.log('💡 Recommendations:', result1.recommendations)
    
    if (result1.errors && result1.errors.length > 0) {
      console.log('❌ Errors:', result1.errors)
    }
    
  } catch (error) {
    console.error('❌ Test 1 failed:', error)
  }
  
  console.log('')
  console.log('─'.repeat(50))
  console.log('')
  console.log('🎉 Agent 5 testing complete!')
  console.log('')
  console.log('Note: Agent 5 can also:')
  console.log('  - Run tests (type: run-tests)')
  console.log('  - Check coverage (type: coverage)')
  console.log('  - Run E2E tests (type: e2e)')
  console.log('  - Full QA workflow (type: full-qa)')
}

// Run tests
testAgent5().catch(console.error)
