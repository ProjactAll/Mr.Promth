/**
 * Mr.Promth Extension - API Client
 * 
 * This module handles all communication with the backend API
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

export interface AuthResponse {
  api_key: string
  user_id: string
  user: {
    id: string
    email: string
    display_name: string
  }
}

export interface VerifyResponse {
  valid: boolean
  user_id?: string
  user?: any
  error?: string
}

export interface CaptureResponse {
  screenshot_id: string
  storage_url: string
  session_id: string
}

export interface AnalysisResponse {
  analysis_id: string
  results: any
  suggestions: string[]
  confidence_score: number
  processing_time: number
}

export class ApiClient {
  private apiKey: string | null = null
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Set API key for authenticated requests
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Get API key from storage
   */
  async loadApiKey(): Promise<string | null> {
    const result = await chrome.storage.local.get(['apiKey'])
    if (result.apiKey) {
      this.apiKey = result.apiKey
      return result.apiKey
    }
    return null
  }

  /**
   * Save API key to storage
   */
  async saveApiKey(apiKey: string) {
    await chrome.storage.local.set({ apiKey })
    this.apiKey = apiKey
  }

  /**
   * Clear API key from storage
   */
  async clearApiKey() {
    await chrome.storage.local.remove(['apiKey'])
    this.apiKey = null
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/extension/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data: AuthResponse = await response.json()
    
    // Save API key
    await this.saveApiKey(data.api_key)
    
    return data
  }

  /**
   * Verify API key
   */
  async verify(): Promise<VerifyResponse> {
    if (!this.apiKey) {
      await this.loadApiKey()
    }

    if (!this.apiKey) {
      return { valid: false, error: 'No API key found' }
    }

    const response = await fetch(`${this.baseUrl}/api/extension/auth`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
    })

    if (!response.ok) {
      return { valid: false, error: 'Invalid API key' }
    }

    return await response.json()
  }

  /**
   * Logout
   */
  async logout() {
    await this.clearApiKey()
  }

  /**
   * Capture screenshot
   */
  async capture(params: {
    screenshot: string
    url: string
    dom?: any
    clickable?: any[]
    session_id?: string
    metadata?: any
  }): Promise<CaptureResponse> {
    if (!this.apiKey) {
      await this.loadApiKey()
    }

    if (!this.apiKey) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${this.baseUrl}/api/extension/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Capture failed')
    }

    return await response.json()
  }

  /**
   * Get screenshots
   */
  async getScreenshots(params?: {
    limit?: number
    offset?: number
    session_id?: string
  }): Promise<{ screenshots: any[]; total: number }> {
    if (!this.apiKey) {
      await this.loadApiKey()
    }

    if (!this.apiKey) {
      throw new Error('Not authenticated')
    }

    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.offset) queryParams.set('offset', params.offset.toString())
    if (params?.session_id) queryParams.set('session_id', params.session_id)

    const response = await fetch(
      `${this.baseUrl}/api/extension/capture?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get screenshots')
    }

    return await response.json()
  }

  /**
   * Analyze screenshot
   */
  async analyze(params: {
    screenshot_id: string
    analysis_type?: 'full' | 'quick'
    custom_prompt?: string
  }): Promise<AnalysisResponse> {
    if (!this.apiKey) {
      await this.loadApiKey()
    }

    if (!this.apiKey) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${this.baseUrl}/api/extension/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Analysis failed')
    }

    return await response.json()
  }

  /**
   * Get analysis results
   */
  async getAnalyses(screenshotId: string): Promise<{ analyses: any[] }> {
    if (!this.apiKey) {
      await this.loadApiKey()
    }

    if (!this.apiKey) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(
      `${this.baseUrl}/api/extension/analyze?screenshot_id=${screenshotId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get analyses')
    }

    return await response.json()
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
