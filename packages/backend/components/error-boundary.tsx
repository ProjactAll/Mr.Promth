'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send error to error tracking service
    this.logErrorToService(error, errorInfo)
  }
  
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send to Sentry if available
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          level: 'error',
          extra: errorInfo,
          tags: {
            component: 'ErrorBoundary',
            errorBoundary: true
          }
        });
      }
      
      // Add other error tracking services here
    } catch (trackingError) {
      // Fail silently
      console.error('Failed to send error to tracking service:', trackingError)
    }
  }
  
  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              
              {this.state.error && (
                <details className="text-left mb-6">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Error details
                  </summary>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

/**
 * Hook-based error boundary wrapper
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
