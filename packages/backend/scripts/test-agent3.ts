/**
 * Test Agent 3: Backend Code Generator
 * This script tests the AI-powered code generation
 */

import { agent3GenerateBackend } from './lib/agents/agent3-code-generator'
import { mkdir } from 'fs/promises'
import { join } from 'path'

async function testAgent3() {
  console.log('🧪 Testing Agent 3: Backend Code Generator\n')
  
  // Create test project directory
  const testProjectPath = join('/tmp', 'test-mr-prompt-project')
  await mkdir(testProjectPath, { recursive: true })
  
  console.log('📁 Test project path:', testProjectPath)
  console.log('')
  
  // Test 1: Generate API Route
  console.log('Test 1: Generate API Route for Blog Posts')
  console.log('─'.repeat(50))
  
  try {
    const result1 = await agent3GenerateBackend({
      projectId: 'test-blog',
      projectPath: testProjectPath,
      task: {
        type: 'api',
        description: 'Create a blog post API with CRUD operations',
        specifications: {
          endpoints: ['posts', 'posts/[id]'],
          authentication: true,
          rateLimit: true
        }
      }
    })
    
    console.log('✅ Success:', result1.success)
    console.log('📝 Files generated:', result1.filesGenerated.length)
    
    result1.filesGenerated.forEach(file => {
      console.log(`   - ${file.path}`)
      console.log(`     Type: ${file.type}`)
      console.log(`     Size: ${file.content.length} characters`)
    })
    
    console.log('📦 Dependencies:', result1.dependencies)
    console.log('🔜 Next steps:', result1.nextSteps)
    
    if (result1.errors && result1.errors.length > 0) {
      console.log('❌ Errors:', result1.errors)
    }
    
  } catch (error) {
    console.error('❌ Test 1 failed:', error)
  }
  
  console.log('')
  console.log('─'.repeat(50))
  console.log('')
  
  // Test 2: Generate Database Migration
  console.log('Test 2: Generate Database Migration')
  console.log('─'.repeat(50))
  
  try {
    const result2 = await agent3GenerateBackend({
      projectId: 'test-blog',
      projectPath: testProjectPath,
      task: {
        type: 'migration',
        description: 'Create database schema for blog system',
        specifications: {
          database: {
            tables: ['posts', 'categories', 'comments'],
            relationships: [
              'posts.category_id -> categories.id',
              'comments.post_id -> posts.id'
            ]
          }
        }
      }
    })
    
    console.log('✅ Success:', result2.success)
    console.log('📝 Files generated:', result2.filesGenerated.length)
    
    result2.filesGenerated.forEach(file => {
      console.log(`   - ${file.path}`)
      console.log(`     Type: ${file.type}`)
      console.log(`     Size: ${file.content.length} characters`)
    })
    
    if (result2.errors && result2.errors.length > 0) {
      console.log('❌ Errors:', result2.errors)
    }
    
  } catch (error) {
    console.error('❌ Test 2 failed:', error)
  }
  
  console.log('')
  console.log('─'.repeat(50))
  console.log('')
  console.log('🎉 Agent 3 testing complete!')
}

// Run tests
testAgent3().catch(console.error)
