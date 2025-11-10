/**
 * AI-Powered Code Generator
 * Uses OpenAI GPT-4 to generate code based on specifications
 */

import { getNextModel, vanchinChatCompletion } from '../ai/vanchin-client'

// Use Vanchin AI with load balancing
// Automatically rotates between 19 models with 20M free tokens total

export interface CodeGenerationRequest {
  type: 'migration' | 'api-route' | 'component' | 'function' | 'test'
  description: string
  context?: {
    projectName?: string
    techStack?: string[]
    existingCode?: string
    dependencies?: string[]
  }
  constraints?: {
    maxLines?: number
    style?: 'functional' | 'class-based'
    typescript?: boolean
  }
}

export interface CodeGenerationResult {
  code: string
  filename: string
  description: string
  dependencies?: string[]
  tests?: string
}

/**
 * Generate code using AI
 */
export async function generateCode(
  request: CodeGenerationRequest
): Promise<CodeGenerationResult> {
  const prompt = buildPrompt(request)
  
  try {
  // Get next available model (load balancing)
  const { client, endpoint } = getNextModel()
  
  const completion = await client.chat.completions.create({
    model: endpoint,
      messages: [
        {
          role: 'system',
          content: `You are an expert full-stack developer specializing in Next.js, TypeScript, React, and Supabase.
Generate clean, production-ready code following best practices.
Always include proper error handling, type safety, and comments.
Format: Return ONLY valid code without markdown code blocks or explanations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
    
    const generatedCode = completion.choices[0]?.message?.content || ''
    
    // Clean up the code (remove markdown if present)
    const cleanCode = cleanGeneratedCode(generatedCode)
    
    // Extract filename and description
    const result = parseGeneratedCode(cleanCode, request)
    
    return result
  } catch (error) {
    console.error('AI Code Generation Error:', error)
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Build prompt for code generation
 */
function buildPrompt(request: CodeGenerationRequest): string {
  let prompt = `Generate ${request.type} code for: ${request.description}\n\n`
  
  if (request.context) {
    if (request.context.projectName) {
      prompt += `Project: ${request.context.projectName}\n`
    }
    if (request.context.techStack) {
      prompt += `Tech Stack: ${request.context.techStack.join(', ')}\n`
    }
    if (request.context.existingCode) {
      prompt += `\nExisting Code Context:\n${request.context.existingCode}\n`
    }
  }
  
  if (request.constraints) {
    prompt += '\nConstraints:\n'
    if (request.constraints.typescript) {
      prompt += '- Use TypeScript\n'
    }
    if (request.constraints.style) {
      prompt += `- Style: ${request.constraints.style}\n`
    }
    if (request.constraints.maxLines) {
      prompt += `- Max lines: ${request.constraints.maxLines}\n`
    }
  }
  
  // Type-specific instructions
  switch (request.type) {
    case 'migration':
      prompt += '\nGenerate a Supabase migration SQL file with:\n'
      prompt += '- CREATE TABLE statements\n'
      prompt += '- Proper indexes\n'
      prompt += '- RLS policies\n'
      prompt += '- Comments for documentation\n'
      break
      
    case 'api-route':
      prompt += '\nGenerate a Next.js API route with:\n'
      prompt += '- GET, POST, PUT, DELETE methods as needed\n'
      prompt += '- Supabase client integration\n'
      prompt += '- Authentication check\n'
      prompt += '- Error handling\n'
      prompt += '- TypeScript types\n'
      break
      
    case 'component':
      prompt += '\nGenerate a React component with:\n'
      prompt += '- TypeScript interfaces\n'
      prompt += '- Props validation\n'
      prompt += '- Hooks (useState, useEffect as needed)\n'
      prompt += '- Tailwind CSS styling\n'
      prompt += '- Accessibility attributes\n'
      break
      
    case 'function':
      prompt += '\nGenerate a utility function with:\n'
      prompt += '- TypeScript types\n'
      prompt += '- JSDoc comments\n'
      prompt += '- Error handling\n'
      prompt += '- Unit test examples\n'
      break
      
    case 'test':
      prompt += '\nGenerate test code with:\n'
      prompt += '- Vitest or Jest syntax\n'
      prompt += '- Multiple test cases\n'
      prompt += '- Edge cases\n'
      prompt += '- Mocking as needed\n'
      break
  }
  
  prompt += '\nReturn ONLY the code, no explanations or markdown.'
  
  return prompt
}

/**
 * Clean generated code (remove markdown, extra whitespace)
 */
function cleanGeneratedCode(code: string): string {
  // Remove markdown code blocks
  let cleaned = code.replace(/```[\w]*\n?/g, '')
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Parse generated code and extract metadata
 */
function parseGeneratedCode(
  code: string,
  request: CodeGenerationRequest
): CodeGenerationResult {
  // Generate filename based on type
  let filename = ''
  let description = request.description
  
  switch (request.type) {
    case 'migration':
      const timestamp = Date.now()
      filename = `${timestamp}_${slugify(request.description)}.sql`
      break
      
    case 'api-route':
      filename = 'route.ts'
      break
      
    case 'component':
      const componentName = extractComponentName(code) || 'Component'
      filename = `${componentName}.tsx`
      break
      
    case 'function':
      const functionName = extractFunctionName(code) || 'function'
      filename = `${functionName}.ts`
      break
      
    case 'test':
      filename = 'test.spec.ts'
      break
  }
  
  // Extract dependencies from imports
  const dependencies = extractDependencies(code)
  
  return {
    code,
    filename,
    description,
    dependencies
  }
}

/**
 * Extract component name from code
 */
function extractComponentName(code: string): string | null {
  // Try to find: export default function ComponentName
  const match1 = code.match(/export\s+default\s+function\s+(\w+)/)
  if (match1) return match1[1]
  
  // Try to find: function ComponentName
  const match2 = code.match(/function\s+(\w+)/)
  if (match2) return match2[1]
  
  // Try to find: const ComponentName =
  const match3 = code.match(/const\s+(\w+)\s*=/)
  if (match3) return match3[1]
  
  return null
}

/**
 * Extract function name from code
 */
function extractFunctionName(code: string): string | null {
  // Try to find: export function functionName
  const match1 = code.match(/export\s+(?:async\s+)?function\s+(\w+)/)
  if (match1) return match1[1]
  
  // Try to find: function functionName
  const match2 = code.match(/function\s+(\w+)/)
  if (match2) return match2[1]
  
  return null
}

/**
 * Extract dependencies from import statements
 */
function extractDependencies(code: string): string[] {
  const dependencies: string[] = []
  
  // Match: import ... from 'package'
  const importMatches = code.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)
  
  for (const match of importMatches) {
    const pkg = match[1]
    // Skip relative imports
    if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
      // Extract package name (before /)
      const pkgName = pkg.split('/')[0]
      if (!dependencies.includes(pkgName)) {
        dependencies.push(pkgName)
      }
    }
  }
  
  return dependencies
}

/**
 * Convert string to slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
}

/**
 * Generate multiple related files at once
 */
export async function generateRelatedFiles(
  baseRequest: CodeGenerationRequest
): Promise<CodeGenerationResult[]> {
  const results: CodeGenerationResult[] = []
  
  // Generate main file
  const mainFile = await generateCode(baseRequest)
  results.push(mainFile)
  
  // Generate test file if not already a test
  if (baseRequest.type !== 'test') {
    try {
      const testRequest: CodeGenerationRequest = {
        type: 'test',
        description: `Tests for: ${baseRequest.description}`,
        context: {
          ...baseRequest.context,
          existingCode: mainFile.code
        }
      }
      
      const testFile = await generateCode(testRequest)
      results.push(testFile)
    } catch (error) {
      console.warn('Failed to generate test file:', error)
    }
  }
  
  return results
}
