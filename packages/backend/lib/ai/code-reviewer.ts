/**
 * AI Code Reviewer
 * Analyzes code quality, security, and best practices
 */

import { vanchinChatCompletion } from './vanchin-client';

export interface CodeReviewRequest {
  files: Array<{
    path: string;
    content: string;
  }>;
  focusAreas?: ('security' | 'performance' | 'best-practices' | 'bugs' | 'readability')[];
}

export interface CodeReviewIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'best-practices' | 'bugs' | 'readability';
  file: string;
  line?: number;
  title: string;
  description: string;
  suggestion?: string;
}

export interface CodeReviewResult {
  success: boolean;
  issues: CodeReviewIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  overallScore: number; // 0-100
  recommendations: string[];
}

/**
 * Review code and provide feedback
 */
export async function reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
  const { files, focusAreas = ['security', 'performance', 'best-practices', 'bugs', 'readability'] } = request;

  // Build file context
  const filesContext = files
    .map((f) => `### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join('\n\n');

  const prompt = `You are an expert code reviewer. Analyze the following code files and provide detailed feedback.

**Focus Areas:**
${focusAreas.map(area => `- ${area}`).join('\n')}

**Code Files:**
${filesContext}

**Instructions:**
1. Analyze each file for issues in the specified focus areas
2. Identify security vulnerabilities, performance issues, bugs, and code quality problems
3. Provide specific suggestions for improvement
4. Rate the overall code quality (0-100)

**Response Format (JSON):**
{
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "category": "security" | "performance" | "best-practices" | "bugs" | "readability",
      "file": "path/to/file.ts",
      "line": 42,
      "title": "Brief issue title",
      "description": "Detailed description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "overallScore": 85,
  "recommendations": [
    "General recommendation 1",
    "General recommendation 2"
  ]
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await vanchinChatCompletion([
      { role: 'system', content: 'You are an expert code reviewer. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    // Parse AI response (vanchinChatCompletion returns string)
    let content = '';
    
    if (typeof response === 'string') {
      content = response;
    } else if (typeof response === 'object' && response !== null && 'choices' in response) {
      content = (response as any).choices[0]?.message?.content || '';
    } else if (typeof response === 'object' && response !== null && 'content' in response) {
      content = (response as any).content || '';
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Calculate summary
    const issues: CodeReviewIssue[] = result.issues || [];
    const summary = {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      info: issues.filter(i => i.severity === 'info').length,
    };

    return {
      success: true,
      issues,
      summary,
      overallScore: result.overallScore || 70,
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error('Error reviewing code:', error);
    return {
      success: false,
      issues: [],
      summary: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      overallScore: 0,
      recommendations: [],
    };
  }
}

/**
 * Quick security scan
 */
export async function quickSecurityScan(code: string): Promise<string[]> {
  const issues: string[] = [];

  // Basic security checks
  if (code.includes('eval(')) {
    issues.push('⚠️ Use of eval() detected - potential security risk');
  }

  if (code.match(/process\.env\.[A-Z_]+/g) && !code.includes('NEXT_PUBLIC_')) {
    issues.push('⚠️ Direct environment variable access - ensure proper sanitization');
  }

  if (code.includes('dangerouslySetInnerHTML')) {
    issues.push('⚠️ Use of dangerouslySetInnerHTML - XSS risk');
  }

  if (code.match(/password|secret|key/i) && code.includes('=')) {
    issues.push('⚠️ Potential hardcoded credentials detected');
  }

  if (code.includes('SELECT') && code.includes('+')) {
    issues.push('⚠️ Potential SQL injection vulnerability');
  }

  return issues;
}
