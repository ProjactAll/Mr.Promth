/**
 * Test 02: File System Operations
 * Test file creation, reading, writing, and deletion
 */

import { promises as fs } from 'fs'
import path from 'path'

async function testFileSystem() {
  console.log('🧪 Test 02: File System Operations\n')
  
  const testDir = path.join(process.cwd(), 'test-temp')
  const testFile = path.join(testDir, 'test.txt')
  
  try {
    // Test 1: Create directory
    console.log('1. Creating test directory...')
    await fs.mkdir(testDir, { recursive: true })
    console.log('   ✅ Directory created')
    
    // Test 2: Write file
    console.log('\n2. Writing test file...')
    await fs.writeFile(testFile, 'Hello, World!')
    console.log('   ✅ File written')
    
    // Test 3: Read file
    console.log('\n3. Reading test file...')
    const content = await fs.readFile(testFile, 'utf-8')
    if (content === 'Hello, World!') {
      console.log('   ✅ File read correctly:', content)
    } else {
      throw new Error(`Content mismatch: ${content}`)
    }
    
    // Test 4: List directory
    console.log('\n4. Listing directory...')
    const files = await fs.readdir(testDir)
    console.log('   ✅ Files found:', files)
    
    // Test 5: Delete file
    console.log('\n5. Deleting test file...')
    await fs.unlink(testFile)
    console.log('   ✅ File deleted')
    
    // Test 6: Delete directory
    console.log('\n6. Deleting test directory...')
    await fs.rmdir(testDir)
    console.log('   ✅ Directory deleted')
    
    console.log('\n📊 Test Result: PASSED ✅')
    process.exit(0)
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testFileSystem()
