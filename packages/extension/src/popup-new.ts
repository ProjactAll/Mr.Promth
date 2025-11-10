/**
 * Mr.Promth Extension - Popup Script
 * 
 * Handles UI interactions in the extension popup
 */

import { apiClient } from './api-client'

// UI Elements
let loginScreen: HTMLElement
let mainScreen: HTMLElement
let loadingScreen: HTMLElement
let statusMessage: HTMLElement

let emailInput: HTMLInputElement
let passwordInput: HTMLInputElement
let loginBtn: HTMLButtonElement

let userName: HTMLElement
let userEmail: HTMLElement

let captureBtn: HTMLButtonElement
let analyzeDomBtn: HTMLButtonElement
let viewHistoryBtn: HTMLButtonElement
let settingsBtn: HTMLButtonElement
let logoutBtn: HTMLButtonElement

let loadingText: HTMLElement

/**
 * Initialize popup
 */
async function init() {
  console.log('Initializing popup...')

  // Get UI elements
  loginScreen = document.getElementById('loginScreen')!
  mainScreen = document.getElementById('mainScreen')!
  loadingScreen = document.getElementById('loadingScreen')!
  statusMessage = document.getElementById('statusMessage')!

  emailInput = document.getElementById('email') as HTMLInputElement
  passwordInput = document.getElementById('password') as HTMLInputElement
  loginBtn = document.getElementById('loginBtn') as HTMLButtonElement

  userName = document.getElementById('userName')!
  userEmail = document.getElementById('userEmail')!

  captureBtn = document.getElementById('captureBtn') as HTMLButtonElement
  analyzeDomBtn = document.getElementById('analyzeDomBtn') as HTMLButtonElement
  viewHistoryBtn = document.getElementById('viewHistoryBtn') as HTMLButtonElement
  settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement
  logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement

  loadingText = document.getElementById('loadingText')!

  // Setup event listeners
  loginBtn.addEventListener('click', handleLogin)
  captureBtn.addEventListener('click', handleCapture)
  analyzeDomBtn.addEventListener('click', handleAnalyzeDom)
  viewHistoryBtn.addEventListener('click', handleViewHistory)
  settingsBtn.addEventListener('click', handleSettings)
  logoutBtn.addEventListener('click', handleLogout)

  // Allow Enter key to login
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  })

  // Check if already logged in
  await checkAuth()
}

/**
 * Check authentication status
 */
async function checkAuth() {
  showLoading('Checking authentication...')

  try {
    const response = await apiClient.verify()

    if (response.valid && response.user) {
      // User is logged in
      showMainScreen(response.user)
    } else {
      // User is not logged in
      showLoginScreen()
    }
  } catch (error) {
    console.error('Auth check error:', error)
    showLoginScreen()
  }

  hideLoading()
}

/**
 * Handle login
 */
async function handleLogin() {
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    showStatus('Please enter email and password', 'error')
    return
  }

  showLoading('Logging in...')
  loginBtn.disabled = true

  try {
    const response = await apiClient.login(email, password)

    showStatus('Login successful!', 'success')
    showMainScreen(response.user)

  } catch (error) {
    console.error('Login error:', error)
    showStatus((error as Error).message, 'error')
  } finally {
    loginBtn.disabled = false
    hideLoading()
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  showLoading('Logging out...')

  try {
    await apiClient.logout()
    showStatus('Logged out successfully', 'success')
    showLoginScreen()
  } catch (error) {
    console.error('Logout error:', error)
    showStatus('Logout failed', 'error')
  } finally {
    hideLoading()
  }
}

/**
 * Handle capture and analyze
 */
async function handleCapture() {
  showLoading('Capturing screenshot...')
  captureBtn.disabled = true

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.id) {
      throw new Error('No active tab found')
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_AND_ANALYZE',
    })

    if (response.success) {
      showStatus('Analysis complete!', 'success')
      
      // Show results in a new window or tab
      // For now, just log to console
      console.log('Analysis results:', response.results)
      console.log('Suggestions:', response.suggestions)

      // TODO: Open results page
      // chrome.tabs.create({
      //   url: `results.html?screenshot_id=${response.screenshot_id}`
      // })

    } else {
      throw new Error(response.error || 'Capture failed')
    }

  } catch (error) {
    console.error('Capture error:', error)
    showStatus((error as Error).message, 'error')
  } finally {
    captureBtn.disabled = false
    hideLoading()
  }
}

/**
 * Handle analyze DOM only
 */
async function handleAnalyzeDom() {
  showLoading('Analyzing DOM...')
  analyzeDomBtn.disabled = true

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.id) {
      throw new Error('No active tab found')
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'ANALYZE_DOM',
    })

    if (response.success) {
      showStatus('DOM analysis complete!', 'success')
      console.log('DOM analysis:', response.analysis)
    } else {
      throw new Error(response.error || 'Analysis failed')
    }

  } catch (error) {
    console.error('DOM analysis error:', error)
    showStatus((error as Error).message, 'error')
  } finally {
    analyzeDomBtn.disabled = false
    hideLoading()
  }
}

/**
 * Handle view history
 */
async function handleViewHistory() {
  showLoading('Loading history...')

  try {
    const response = await apiClient.getScreenshots({ limit: 10 })

    console.log('Screenshots:', response.screenshots)
    showStatus(`Found ${response.total} screenshots`, 'success')

    // TODO: Show history in UI or new page

  } catch (error) {
    console.error('History error:', error)
    showStatus((error as Error).message, 'error')
  } finally {
    hideLoading()
  }
}

/**
 * Handle settings
 */
function handleSettings() {
  // TODO: Open settings page
  showStatus('Settings page coming soon!', 'info')
}

/**
 * Show login screen
 */
function showLoginScreen() {
  loginScreen.classList.remove('hidden')
  mainScreen.classList.add('hidden')
  emailInput.value = ''
  passwordInput.value = ''
}

/**
 * Show main screen
 */
function showMainScreen(user: any) {
  loginScreen.classList.add('hidden')
  mainScreen.classList.remove('hidden')

  userName.textContent = user.display_name || user.email
  userEmail.textContent = user.email
}

/**
 * Show loading screen
 */
function showLoading(text: string) {
  loadingText.textContent = text
  loadingScreen.classList.remove('hidden')
}

/**
 * Hide loading screen
 */
function hideLoading() {
  loadingScreen.classList.add('hidden')
}

/**
 * Show status message
 */
function showStatus(message: string, type: 'success' | 'error' | 'info') {
  statusMessage.textContent = message
  statusMessage.className = `status status-${type}`
  statusMessage.classList.remove('hidden')

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden')
  }, 3000)
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
