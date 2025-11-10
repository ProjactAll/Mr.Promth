/**
 * Mr.Promth Extension - Content Script
 * 
 * This script runs on every webpage and provides:
 * - DOM analysis
 * - Screenshot capture coordination
 * - Page interaction tracking
 */

import { domAnalyzer } from './dom-analyzer'
import { apiClient } from './api-client'

console.log('Mr.Promth Extension - Content Script Loaded')

// Track DOM changes
let lastDomChange = Date.now()
let domObserver: MutationObserver | null = null

/**
 * Initialize content script
 */
function init() {
  console.log('Initializing Mr.Promth content script...')

  // Setup DOM mutation observer
  setupDomObserver()

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse)
    return true // Keep channel open for async response
  })

  // Notify background that content is loaded
  chrome.runtime.sendMessage({
    type: 'CONTENT_ONLOAD',
    timestamp: Date.now(),
  })

  console.log('Mr.Promth content script initialized')
}

/**
 * Setup DOM mutation observer
 */
function setupDomObserver() {
  if (domObserver) {
    domObserver.disconnect()
  }

  domObserver = new MutationObserver((mutations) => {
    lastDomChange = Date.now()
    
    // Notify background of DOM change
    chrome.runtime.sendMessage({
      type: 'DOM_CHANGED',
      timestamp: lastDomChange,
    })
  })

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })
}

/**
 * Handle messages from popup/background
 */
async function handleMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    switch (message.type) {
      case 'ANALYZE_DOM':
        await handleAnalyzeDom(sendResponse)
        break

      case 'CAPTURE_AND_ANALYZE':
        await handleCaptureAndAnalyze(sendResponse)
        break

      case 'GET_PAGE_INFO':
        handleGetPageInfo(sendResponse)
        break

      default:
        sendResponse({ error: 'Unknown message type' })
    }
  } catch (error) {
    console.error('Error handling message:', error)
    sendResponse({ error: (error as Error).message })
  }
}

/**
 * Analyze DOM structure
 */
async function handleAnalyzeDom(sendResponse: (response: any) => void) {
  console.log('Analyzing DOM...')
  
  try {
    const analysis = domAnalyzer.analyze()
    
    console.log('DOM analysis complete:', {
      clickable: analysis.clickable.length,
      forms: analysis.forms.length,
    })

    sendResponse({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('DOM analysis error:', error)
    sendResponse({
      success: false,
      error: (error as Error).message,
    })
  }
}

/**
 * Capture screenshot and analyze
 */
async function handleCaptureAndAnalyze(sendResponse: (response: any) => void) {
  console.log('Capturing and analyzing...')

  try {
    // Step 1: Analyze DOM
    const analysis = domAnalyzer.analyze()

    // Step 2: Request screenshot from background
    const screenshotResponse = await new Promise<any>((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'SCREENSHOT' }, (response) => {
        if (response.dataUrl) {
          resolve(response)
        } else {
          reject(new Error('Failed to capture screenshot'))
        }
      })
    })

    // Step 3: Upload to backend
    const captureResponse = await apiClient.capture({
      screenshot: screenshotResponse.dataUrl,
      url: window.location.href,
      dom: analysis.structure,
      clickable: analysis.clickable,
      metadata: {
        ...analysis.metadata,
        width: window.innerWidth,
        height: window.innerHeight,
        browser: navigator.userAgent,
      },
    })

    console.log('Screenshot uploaded:', captureResponse.screenshot_id)

    // Step 4: Request AI analysis (quick by default)
    const analysisResponse = await apiClient.analyze({
      screenshot_id: captureResponse.screenshot_id,
      analysis_type: 'quick',
    })

    console.log('Analysis complete:', analysisResponse.analysis_id)

    sendResponse({
      success: true,
      screenshot_id: captureResponse.screenshot_id,
      analysis_id: analysisResponse.analysis_id,
      results: analysisResponse.results,
      suggestions: analysisResponse.suggestions,
    })

  } catch (error) {
    console.error('Capture and analyze error:', error)
    sendResponse({
      success: false,
      error: (error as Error).message,
    })
  }
}

/**
 * Get page information
 */
function handleGetPageInfo(sendResponse: (response: any) => void) {
  sendResponse({
    success: true,
    info: {
      url: window.location.href,
      title: document.title,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    },
  })
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (domObserver) {
    domObserver.disconnect()
  }
})
