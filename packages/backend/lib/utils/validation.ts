/**
 * Input Validation Utilities
 * Prevent injection attacks and validate user input
 */

import { z } from 'zod'

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name is required' }
  }
  
  if (name.length < 3) {
    return { valid: false, error: 'Project name must be at least 3 characters' }
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'Project name must be less than 100 characters' }
  }
  
  // Allow alphanumeric, spaces, hyphens, underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/
  if (!validPattern.test(name)) {
    return { valid: false, error: 'Project name contains invalid characters' }
  }
  
  return { valid: true }
}

/**
 * Validate GitHub repository name
 */
export function validateRepoName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Repository name is required' }
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'Repository name must be less than 100 characters' }
  }
  
  // GitHub repo name rules: alphanumeric, hyphens, underscores, dots
  const validPattern = /^[a-zA-Z0-9\-_.]+$/
  if (!validPattern.test(name)) {
    return { valid: false, error: 'Repository name contains invalid characters' }
  }
  
  // Cannot start with dot or hyphen
  if (name.startsWith('.') || name.startsWith('-')) {
    return { valid: false, error: 'Repository name cannot start with . or -' }
  }
  
  return { valid: true }
}

/**
 * Validate file path
 */
export function validateFilePath(path: string): { valid: boolean; error?: string } {
  if (!path || path.trim().length === 0) {
    return { valid: false, error: 'File path is required' }
  }
  
  // Prevent directory traversal
  if (path.includes('..')) {
    return { valid: false, error: 'File path cannot contain ..' }
  }
  
  // Prevent absolute paths
  if (path.startsWith('/')) {
    return { valid: false, error: 'File path cannot be absolute' }
  }
  
  // Prevent Windows paths
  if (path.includes('\\')) {
    return { valid: false, error: 'File path cannot contain backslashes' }
  }
  
  return { valid: true }
}

/**
 * Validate API token
 */
export function validateApiToken(token: string): { valid: boolean; error?: string } {
  if (!token || token.trim().length === 0) {
    return { valid: false, error: 'API token is required' }
  }
  
  if (token.length < 20) {
    return { valid: false, error: 'API token is too short' }
  }
  
  if (token.length > 500) {
    return { valid: false, error: 'API token is too long' }
  }
  
  return { valid: true }
}

/**
 * Validate environment variable name
 */
export function validateEnvVarName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Environment variable name is required' }
  }
  
  // Must be uppercase with underscores
  const validPattern = /^[A-Z][A-Z0-9_]*$/
  if (!validPattern.test(name)) {
    return { valid: false, error: 'Environment variable name must be uppercase with underscores' }
  }
  
  return { valid: true }
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL is required' }
  }
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use http or https protocol' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Zod schemas for common validations
 */
export const schemas = {
  projectName: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name contains invalid characters'),
  
  repoName: z.string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Repository name contains invalid characters')
    .refine(name => !name.startsWith('.') && !name.startsWith('-'), 
      'Repository name cannot start with . or -'),
  
  filePath: z.string()
    .min(1, 'File path is required')
    .refine(path => !path.includes('..'), 'File path cannot contain ..')
    .refine(path => !path.startsWith('/'), 'File path cannot be absolute')
    .refine(path => !path.includes('\\'), 'File path cannot contain backslashes'),
  
  apiToken: z.string()
    .min(20, 'API token is too short')
    .max(500, 'API token is too long'),
  
  envVarName: z.string()
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Environment variable name must be uppercase with underscores'),
  
  url: z.string()
    .url('Invalid URL format')
    .refine(url => {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    }, 'URL must use http or https protocol'),
  
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(10000, 'Prompt must be less than 10000 characters'),
  
  email: z.string()
    .email('Invalid email format'),
  
  uuid: z.string()
    .uuid('Invalid UUID format')
}

/**
 * Validate request body against schema
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

/**
 * Check if string contains SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Check if string contains XSS patterns
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize(input: string): { 
  valid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  
  if (containsSqlInjection(input)) {
    errors.push('Input contains potential SQL injection')
  }
  
  if (containsXss(input)) {
    errors.push('Input contains potential XSS attack')
  }
  
  const sanitized = sanitizeInput(input)
  
  return {
    valid: errors.length === 0,
    sanitized,
    errors
  }
}
