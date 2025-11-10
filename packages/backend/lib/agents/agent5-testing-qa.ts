/**
 * Agent 5: Testing & QA Automation
 * Generates tests, runs them, and reports coverage
 */

import { createLogger } from '../utils/logger'
import { vanchinChatCompletion } from '../ai/vanchin-client'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface Agent5Request {
  projectId: string
  projectPath: string
  task: {
    type: 'generate-tests' | 'run-tests' | 'coverage' | 'e2e' | 'full-qa'
    targetFiles?: string[] // Files to test
    testFramework?: 'jest' | 'vitest' | 'playwright'
    coverageThreshold?: number // Minimum coverage percentage
  }
}

export interface Agent5Result {
  success: boolean
  testsGenerated?: {
    path: string
    content: string
  }[]
  testResults?: {
    passed: number
    failed: number
    total: number
    duration: number
    failures: Array<{
      test: string
      error: string
    }>
  }
  coverage?: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  recommendations: string[]
  errors?: string[]
}

/**
 * Agent 5 Main Function
 */
export async function agent5TestingQA(
  request: Agent5Request
): Promise<Agent5Result> {
  const result: Agent5Result = {
    success: false,
    recommendations: []
  }
  
  try {
    logger.info('[Agent 5] Starting testing & QA...')
    logger.info('[Agent 5] Task:', { data: request.task.type })
    
    switch (request.task.type) {
      case 'generate-tests':
        await generateTests(request, result)
        break
        
      case 'run-tests':
        await runTests(request, result)
        break
        
      case 'coverage':
        await checkCoverage(request, result)
        break
        
      case 'e2e':
        await runE2ETests(request, result)
        break
        
      case 'full-qa':
        await fullQA(request, result)
        break
    }
    
    result.success = true
    logger.info('[Agent 5] ✅ Testing & QA complete!')
    
    return result
    
  } catch (error) {
    logger.error('[Agent 5] ❌ Error:', error instanceof Error ? error : new Error(String(error)))
    result.errors = result.errors || []
    result.errors.push(error instanceof Error ? error.message : String(error))
    return result
  }
}

/**
 * Generate test files using AI
 */
async function generateTests(
  request: Agent5Request,
  result: Agent5Result
): Promise<void> {
  const { projectPath, task } = request
  const targetFiles = task.targetFiles || []
  
  result.testsGenerated = []
  
  for (const filePath of targetFiles) {
    try {
      // Read the source file (filePath is already absolute)
      const sourceCode = await readFile(filePath, 'utf-8')
      
      // Generate test using AI
      const testCode = await generateTestWithAI(sourceCode, filePath, task.testFramework || 'jest')
      
      // Determine test file path (filePath is already absolute)
      const testFilePath = filePath.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1')
      
      // Write test file
      const testDir = testFilePath.split('/').slice(0, -1).join('/')
      await mkdir(testDir, { recursive: true })
      await writeFile(testFilePath, testCode, 'utf-8')
      
      result.testsGenerated.push({
        path: testFilePath,
        content: testCode
      })
      
      logger.info('[Agent 5] ✅ Generated test:', { data: testFilePath })
      
    } catch (error) {
      logger.error('[Agent 5] Error generating test for', filePath, error instanceof Error ? filePath, error : new Error(String(filePath, error)))
    }
  }
  
  result.recommendations.push(`Generated ${result.testsGenerated.length} test files`)
  result.recommendations.push('Run tests with: pnpm test')
}

/**
 * Generate test code using AI
 */
async function generateTestWithAI(
  sourceCode: string,
  filePath: string,
  framework: string
): Promise<string> {
  const prompt = `Generate comprehensive unit tests for the following code.

File: ${filePath}
Test Framework: ${framework}

Source Code:
\`\`\`typescript
${sourceCode}
\`\`\`

Requirements:
1. Test all exported functions/components
2. Test edge cases and error handling
3. Use proper mocking for external dependencies
4. Include setup and teardown if needed
5. Use descriptive test names
6. Aim for high code coverage

Generate ONLY the test code, no explanations.`

  const response = await vanchinChatCompletion([
    {
      role: 'system',
      content: 'You are an expert in writing comprehensive unit tests. Generate clean, well-structured test code.'
    },
    {
      role: 'user',
      content: prompt
    }
  ], {
    temperature: 0.3,
    maxTokens: 2000
  })
  
  // Type guard to ensure we have a ChatCompletion response
  if (!response || typeof response === 'object' && 'choices' in response === false) {
    throw new Error('Invalid response from AI')
  }
  
  let testCode = response.choices[0].message.content || ''
  
  // Extract code from markdown if present
  const codeMatch = testCode.match(/```(?:typescript|javascript|ts|js)?\n([\s\S]*?)\n```/)
  if (codeMatch) {
    testCode = codeMatch[1]
  }
  
  return testCode.trim()
}

/**
 * Run tests
 */
async function runTests(
  request: Agent5Request,
  result: Agent5Result
): Promise<void> {
  const { projectPath, task } = request
  const framework = task.testFramework || 'jest'
  
  try {
    let command = ''
    
    switch (framework) {
      case 'jest':
        command = 'pnpm test --json --coverage'
        break
      case 'vitest':
        command = 'pnpm vitest run --reporter=json'
        break
      case 'playwright':
        command = 'pnpm playwright test --reporter=json'
        break
    }
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    })
    
    // Parse results
    const testOutput = JSON.parse(stdout)
    
    result.testResults = {
      passed: testOutput.numPassedTests || 0,
      failed: testOutput.numFailedTests || 0,
      total: testOutput.numTotalTests || 0,
      duration: testOutput.testResults?.reduce((sum: number, r: any) => sum + (r.perfStats?.runtime || 0), 0) || 0,
      failures: (testOutput.testResults || [])
        .filter((r: any) => r.status === 'failed')
        .map((r: any) => ({
          test: r.fullName || r.name,
          error: r.failureMessage || 'Unknown error'
        }))
    }
    
    if (result.testResults.failed === 0) {
      result.recommendations.push('✅ All tests passed!')
    } else {
      result.recommendations.push(`⚠️ ${result.testResults.failed} tests failed`)
      result.recommendations.push('Check test output for details')
    }
    
  } catch (error: any) {
    // Tests might fail but still produce output
    if (error.stdout) {
      try {
        const testOutput = JSON.parse(error.stdout)
        result.testResults = {
          passed: testOutput.numPassedTests || 0,
          failed: testOutput.numFailedTests || 0,
          total: testOutput.numTotalTests || 0,
          duration: 0,
          failures: []
        }
      } catch (parseError) {
        logger.error('[Agent 5] Error parsing test output:', parseError instanceof Error ? parseError : new Error(String(parseError)))
      }
    }
    
    result.recommendations.push('Some tests failed or could not run')
    result.recommendations.push('Check that test framework is installed: pnpm add -D jest @types/jest')
  }
}

/**
 * Check code coverage
 */
async function checkCoverage(
  request: Agent5Request,
  result: Agent5Result
): Promise<void> {
  const { projectPath, task } = request
  const threshold = task.coverageThreshold || 80
  
  try {
    // Run tests with coverage
    const { stdout } = await execAsync('pnpm test --coverage --json', {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024
    })
    
    const coverageData = JSON.parse(stdout)
    
    result.coverage = {
      statements: coverageData.total?.statements?.pct || 0,
      branches: coverageData.total?.branches?.pct || 0,
      functions: coverageData.total?.functions?.pct || 0,
      lines: coverageData.total?.lines?.pct || 0
    }
    
    const avgCoverage = (
      result.coverage.statements +
      result.coverage.branches +
      result.coverage.functions +
      result.coverage.lines
    ) / 4
    
    if (avgCoverage >= threshold) {
      result.recommendations.push(`✅ Coverage ${avgCoverage.toFixed(1)}% meets threshold ${threshold}%`)
    } else {
      result.recommendations.push(`⚠️ Coverage ${avgCoverage.toFixed(1)}% below threshold ${threshold}%`)
      result.recommendations.push('Consider adding more tests')
    }
    
  } catch (error) {
    logger.error('[Agent 5] Error checking coverage:', error instanceof Error ? error : new Error(String(error)))
    result.recommendations.push('Could not check coverage')
    result.recommendations.push('Ensure jest is configured with coverage enabled')
  }
}

/**
 * Run E2E tests
 */
async function runE2ETests(
  request: Agent5Request,
  result: Agent5Result
): Promise<void> {
  const { projectPath } = request
  
  try {
    const { stdout } = await execAsync('pnpm playwright test --reporter=json', {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024
    })
    
    const e2eResults = JSON.parse(stdout)
    
    result.testResults = {
      passed: e2eResults.stats?.expected || 0,
      failed: e2eResults.stats?.unexpected || 0,
      total: e2eResults.stats?.total || 0,
      duration: e2eResults.stats?.duration || 0,
      failures: []
    }
    
    if (result.testResults.failed === 0) {
      result.recommendations.push('✅ All E2E tests passed!')
    } else {
      result.recommendations.push(`⚠️ ${result.testResults.failed} E2E tests failed`)
    }
    
  } catch (error) {
    logger.error('[Agent 5] Error running E2E tests:', error instanceof Error ? error : new Error(String(error)))
    result.recommendations.push('Could not run E2E tests')
    result.recommendations.push('Install Playwright: pnpm add -D @playwright/test')
  }
}

/**
 * Full QA - Generate tests, run them, check coverage
 */
async function fullQA(
  request: Agent5Request,
  result: Agent5Result
): Promise<void> {
  logger.info('[Agent 5] Running full QA...')
  
  // Step 1: Generate tests
  if (request.task.targetFiles && request.task.targetFiles.length > 0) {
    await generateTests(request, result)
  }
  
  // Step 2: Run tests
  await runTests(request, result)
  
  // Step 3: Check coverage
  await checkCoverage(request, result)
  
  // Step 4: Run E2E tests
  await runE2ETests(request, result)
  
  // Final recommendations
  result.recommendations.push('Full QA cycle complete')
  result.recommendations.push('Review test results and coverage reports')
}

/**
 * Validate Agent 5 request
 */
export function validateAgent5Request(request: Agent5Request): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!request.projectId) {
    errors.push('Project ID is required')
  }
  
  if (!request.projectPath) {
    errors.push('Project path is required')
  }
  
  if (!request.task) {
    errors.push('Task is required')
  } else {
    if (!request.task.type) {
      errors.push('Task type is required')
    }
    
    if (request.task.type === 'generate-tests' && (!request.task.targetFiles || request.task.targetFiles.length === 0)) {
      errors.push('Target files required for generate-tests task')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
