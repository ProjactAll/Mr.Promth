/**
 * Extension API Endpoints Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

describe('Extension API Tests', () => {
  let apiKey: string
  let userId: string
  let screenshotId: string
  let sessionId: string

  // Test credentials (should be created in Supabase first)
  const TEST_EMAIL = 'test@mrpromth.com'
  const TEST_PASSWORD = 'testpassword123'

  describe('POST /api/extension/auth - Login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data).toHaveProperty('api_key')
      expect(data).toHaveProperty('user_id')
      expect(data).toHaveProperty('user')
      expect(data.user.email).toBe(TEST_EMAIL)

      // Save for later tests
      apiKey = data.api_key
      userId = data.user_id
    })

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpassword',
        }),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should reject missing credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })

  describe('GET /api/extension/auth - Verify API Key', () => {
    it('should verify valid API key', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/auth`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data.valid).toBe(true)
      expect(data.user_id).toBe(userId)
      expect(data).toHaveProperty('user')
    })

    it('should reject invalid API key', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/auth`, {
        method: 'GET',
        headers: {
          'X-API-Key': 'invalid_key',
        },
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.valid).toBe(false)
    })

    it('should reject missing API key', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/auth`, {
        method: 'GET',
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.valid).toBe(false)
    })
  })

  describe('POST /api/extension/capture - Upload Screenshot', () => {
    it('should upload screenshot with valid API key', async () => {
      // Create a fake screenshot data URL
      const fakeScreenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

      const response = await fetch(`${API_BASE_URL}/api/extension/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          screenshot: fakeScreenshot,
          url: 'https://example.com',
          dom: {
            tag: 'body',
            children: [],
          },
          clickable: [],
          metadata: {
            width: 1920,
            height: 1080,
          },
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data).toHaveProperty('screenshot_id')
      expect(data).toHaveProperty('storage_url')
      expect(data).toHaveProperty('session_id')

      // Save for later tests
      screenshotId = data.screenshot_id
      sessionId = data.session_id
    })

    it('should reject upload without API key', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshot: 'data:image/png;base64,xxx',
          url: 'https://example.com',
        }),
      })

      expect(response.status).toBe(401)
    })

    it('should reject upload without screenshot', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          url: 'https://example.com',
        }),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/extension/capture - Get Screenshots', () => {
    it('should get user screenshots', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/capture`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data).toHaveProperty('screenshots')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.screenshots)).toBe(true)
      expect(data.total).toBeGreaterThan(0)
    })

    it('should filter by session_id', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/extension/capture?session_id=${sessionId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data.screenshots.length).toBeGreaterThan(0)
      expect(data.screenshots[0].session_id).toBe(sessionId)
    })
  })

  describe('POST /api/extension/analyze - Analyze Screenshot', () => {
    it('should analyze screenshot with quick mode', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          screenshot_id: screenshotId,
          analysis_type: 'quick',
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data).toHaveProperty('analysis_id')
      expect(data).toHaveProperty('results')
      expect(data).toHaveProperty('suggestions')
      expect(data).toHaveProperty('confidence_score')
      expect(data).toHaveProperty('processing_time')

      expect(Array.isArray(data.suggestions)).toBe(true)
      expect(data.confidence_score).toBeGreaterThan(0)
    }, 30000) // 30 second timeout for AI processing

    it('should reject analysis without screenshot_id', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
    })

    it('should reject analysis with invalid screenshot_id', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          screenshot_id: '00000000-0000-0000-0000-000000000000',
        }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/extension/analyze - Get Analysis Results', () => {
    it('should get analysis results for screenshot', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/extension/analyze?screenshot_id=${screenshotId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      expect(response.status).toBe(200)

      const data = await response.json()

      expect(data).toHaveProperty('analyses')
      expect(Array.isArray(data.analyses)).toBe(true)
      expect(data.analyses.length).toBeGreaterThan(0)
    })

    it('should reject without screenshot_id', async () => {
      const response = await fetch(`${API_BASE_URL}/api/extension/analyze`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      })

      expect(response.status).toBe(400)
    })
  })
})
