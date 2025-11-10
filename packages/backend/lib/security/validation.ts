/**
 * Input Validation & Sanitization
 * Prevents injection attacks and validates user input
 */

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Project name is required' }
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Project name must be less than 50 characters' }
  }
  
  if (!/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: 'Project name can only contain lowercase letters, numbers, and hyphens' }
  }
  
  if (name.startsWith('-') || name.endsWith('-')) {
    return { valid: false, error: 'Project name cannot start or end with a hyphen' }
  }
  
  return { valid: true }
}

/**
 * Validate prompt
 */
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' }
  }
  
  if (prompt.length < 10) {
    return { valid: false, error: 'Prompt must be at least 10 characters' }
  }
  
  if (prompt.length > 5000) {
    return { valid: false, error: 'Prompt must be less than 5000 characters' }
  }
  
  return { valid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' }
  }
  
  return { valid: true }
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL' }
  }
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): { valid: boolean; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!uuid || !uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID' }
  }
  
  return { valid: true }
}

/**
 * Sanitize SQL input (basic)
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove /* comments
    .replace(/\*\//g, '')
}

/**
 * Validate file path (prevent directory traversal)
 */
export function validateFilePath(path: string): { valid: boolean; error?: string } {
  // Check for directory traversal attempts
  if (path.includes('..') || path.includes('~')) {
    return { valid: false, error: 'Invalid file path: directory traversal detected' }
  }
  
  // Check for absolute paths
  if (path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
    return { valid: false, error: 'Absolute paths are not allowed' }
  }
  
  return { valid: true }
}

/**
 * Validate JSON
 */
export function validateJson(json: string): { valid: boolean; error?: string; data?: any } {
  try {
    const data = JSON.parse(json)
    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: 'Invalid JSON' }
  }
}

/**
 * Escape HTML
 */
export function escapeHtml(html: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return html.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate and sanitize workflow request
 */
export function validateWorkflowRequest(request: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate project name
  if (request.projectName) {
    const result = validateProjectName(request.projectName)
    if (!result.valid) {
      errors.push(result.error!)
    }
  } else {
    errors.push('Project name is required')
  }
  
  // Validate prompt
  if (request.prompt) {
    const result = validatePrompt(request.prompt)
    if (!result.valid) {
      errors.push(result.error!)
    }
  } else {
    errors.push('Prompt is required')
  }
  
  // Validate user ID
  if (!request.userId) {
    errors.push('User ID is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
