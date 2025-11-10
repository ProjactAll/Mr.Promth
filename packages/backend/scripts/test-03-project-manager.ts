/**
 * Test 03: Project Manager
 * Test project creation and management functions
 */

import { promises as fs } from 'fs'
import path from 'path'

interface Project {
  id: string
  name: string
  description: string
  files: string[]
}

async function createProject(name: string, description: string): Promise<Project> {
  const id = `proj-${Date.now()}`
  const projectDir = path.join(process.cwd(), 'test-projects', id)
  
  await fs.mkdir(projectDir, { recursive: true })
  
  const project: Project = {
    id,
    name,
    description,
    files: []
  }
  
  await fs.writeFile(
    path.join(projectDir, 'project.json'),
    JSON.stringify(project, null, 2)
  )
  
  return project
}

async function addFile(projectId: string, filename: string, content: string): Promise<void> {
  const projectDir = path.join(process.cwd(), 'test-projects', projectId)
  const filePath = path.join(projectDir, filename)
  
  await fs.writeFile(filePath, content)
  
  // Update project.json
  const projectFile = path.join(projectDir, 'project.json')
  const projectData = JSON.parse(await fs.readFile(projectFile, 'utf-8'))
  projectData.files.push(filename)
  await fs.writeFile(projectFile, JSON.stringify(projectData, null, 2))
}

async function listFiles(projectId: string): Promise<string[]> {
  const projectDir = path.join(process.cwd(), 'test-projects', projectId)
  const files = await fs.readdir(projectDir)
  return files.filter(f => f !== 'project.json')
}

async function deleteProject(projectId: string): Promise<void> {
  const projectDir = path.join(process.cwd(), 'test-projects', projectId)
  await fs.rm(projectDir, { recursive: true, force: true })
}

async function testProjectManager() {
  console.log('🧪 Test 03: Project Manager\n')
  
  try {
    // Test 1: Create project
    console.log('1. Creating project...')
    const project = await createProject('Test Project', 'A test project')
    console.log(`   ✅ Project created: ${project.id}`)
    
    // Test 2: Add files
    console.log('\n2. Adding files...')
    await addFile(project.id, 'index.html', '<html><body>Hello</body></html>')
    await addFile(project.id, 'style.css', 'body { margin: 0; }')
    await addFile(project.id, 'script.js', 'console.log("Hello");')
    console.log('   ✅ Files added')
    
    // Test 3: List files
    console.log('\n3. Listing files...')
    const files = await listFiles(project.id)
    console.log('   ✅ Files:', files)
    
    if (files.length !== 3) {
      throw new Error(`Expected 3 files, got ${files.length}`)
    }
    
    // Test 4: Delete project
    console.log('\n4. Deleting project...')
    await deleteProject(project.id)
    console.log('   ✅ Project deleted')
    
    // Cleanup
    await fs.rm(path.join(process.cwd(), 'test-projects'), { recursive: true, force: true })
    
    console.log('\n📊 Test Result: PASSED ✅')
    process.exit(0)
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testProjectManager()
