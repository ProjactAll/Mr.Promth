/**
 * Test Agent 4: Frontend Component Generator
 * This script tests the AI-powered frontend code generation
 */

import { agent4GenerateFrontend } from './lib/agents/agent4-frontend-generator'
import { mkdir } from 'fs/promises'
import { join } from 'path'

async function testAgent4() {
  console.log('🧪 Testing Agent 4: Frontend Component Generator\n')
  
  // Create test project directory
  const testProjectPath = join('/tmp', 'test-mr-prompt-frontend')
  await mkdir(testProjectPath, { recursive: true })
  
  console.log(' Test project path:', testProjectPath)
  console.log('')
  
  // Test 1: Generate Page Component
  console.log('Test 1: Generate Blog Post List Page')
  console.log(''.repeat(50))
  
  try {
    const result1 = await agent4GenerateFrontend({
      projectId: 'test-blog',
      projectPath: testProjectPath,
      task: {
        type: 'page',
        description: 'Blog post listing page with pagination and search',
        specifications: {
          route: 'blog',
          styling: 'tailwind',
          responsive: true,
          accessibility: true,
          dataSource: {
            type: 'api',
            endpoint: '/api/posts'
          }
        }
      }
    })
    
    console.log(' Success:', result1.success)
    console.log(' Files generated:', result1.filesGenerated.length)
    
    result1.filesGenerated.forEach(file => {
      console.log(`   - ${file.path}`)
      console.log(`     Type: ${file.type}`)
      console.log(`     Size: ${file.content.length} characters`)
    })
    
    console.log(' Dependencies:', result1.dependencies)
    console.log(' Next steps:', result1.nextSteps)
    
    if (result1.errors && result1.errors.length > 0) {
      console.log(' Errors:', result1.errors)
    }
    
  } catch (error) {
    console.error(' Test 1 failed:', error)
  }
  
  console.log('')
  console.log(''.repeat(50))
  console.log('')
  
  // Test 2: Generate Form Component
  console.log('Test 2: Generate Blog Post Form')
  console.log(''.repeat(50))
  
  try {
    const result2 = await agent4GenerateFrontend({
      projectId: 'test-blog',
      projectPath: testProjectPath,
      task: {
        type: 'form',
        description: 'Blog post creation form with title, content, category',
        specifications: {
          styling: 'tailwind',
          responsive: true,
          accessibility: true
        }
      }
    })
    
    console.log(' Success:', result2.success)
    console.log(' Files generated:', result2.filesGenerated.length)
    
    result2.filesGenerated.forEach(file => {
      console.log(`   - ${file.path}`)
      console.log(`     Type: ${file.type}`)
      console.log(`     Size: ${file.content.length} characters`)
    })
    
    if (result2.errors && result2.errors.length > 0) {
      console.log(' Errors:', result2.errors)
    }
    
  } catch (error) {
    console.error(' Test 2 failed:', error)
  }
  
  console.log('')
  console.log(''.repeat(50))
  console.log('')
  
  // Test 3: Generate Dashboard
  console.log('Test 3: Generate Analytics Dashboard')
  console.log(''.repeat(50))
  
  try {
    const result3 = await agent4GenerateFrontend({
      projectId: 'test-blog',
      projectPath: testProjectPath,
      task: {
        type: 'dashboard',
        description: 'Blog analytics dashboard with charts and metrics',
        specifications: {
          route: 'dashboard',
          styling: 'tailwind',
          responsive: true,
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics'
          }
        }
      }
    })
    
    console.log(' Success:', result3.success)
    console.log(' Files generated:', result3.filesGenerated.length)
    
    result3.filesGenerated.forEach(file => {
      console.log(`   - ${file.path}`)
      console.log(`     Type: ${file.type}`)
      console.log(`     Size: ${file.content.length} characters`)
    })
    
    if (result3.errors && result3.errors.length > 0) {
      console.log(' Errors:', result3.errors)
    }
    
  } catch (error) {
    console.error(' Test 3 failed:', error)
  }
  
  console.log('')
  console.log(''.repeat(50))
  console.log('')
  console.log(' Agent 4 testing complete!')
}

// Run tests
testAgent4().catch(console.error)
