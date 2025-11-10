'use client'

export enum ErrorType {
  AI_ERROR = 'ai_error',
  VALIDATION_ERROR = 'validation_error',
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
  PERMISSION_ERROR = 'permission_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  DATABASE_ERROR = 'database_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface AppError {
  type: ErrorType
  message: string
  details?: any
  code?: string
}

interface ErrorDisplayProps {
  error: AppError | Error | string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  // Normalize error to AppError
  const appError: AppError = typeof error === 'string'
    ? { type: ErrorType.UNKNOWN_ERROR, message: error }
    : error instanceof Error
    ? { type: ErrorType.UNKNOWN_ERROR, message: error.message }
    : error

  const getErrorIcon = () => {
    switch (appError.type) {
      case ErrorType.AI_ERROR:
        return '🤖'
      case ErrorType.VALIDATION_ERROR:
        return ''
      case ErrorType.NETWORK_ERROR:
        return '🌐'
      case ErrorType.AUTH_ERROR:
        return ''
      case ErrorType.PERMISSION_ERROR:
        return '🚫'
      case ErrorType.RATE_LIMIT_ERROR:
        return '⏱️'
      case ErrorType.DATABASE_ERROR:
        return '💾'
      default:
        return ''
    }
  }

  const getErrorTitle = () => {
    switch (appError.type) {
      case ErrorType.AI_ERROR:
        return 'AI เกิดข้อผิดพลาด'
      case ErrorType.VALIDATION_ERROR:
        return 'ข้อมูลไม่ถูกต้อง'
      case ErrorType.NETWORK_ERROR:
        return 'เกิดปัญหาการเชื่อมต่อ'
      case ErrorType.AUTH_ERROR:
        return 'ปัญหาการยืนยันตัวตน'
      case ErrorType.PERMISSION_ERROR:
        return 'ไม่มีสิทธิ์เข้าถึง'
      case ErrorType.RATE_LIMIT_ERROR:
        return 'ใช้งานเกินขีดจำกัด'
      case ErrorType.DATABASE_ERROR:
        return 'ปัญหาฐานข้อมูล'
      default:
        return 'เกิดข้อผิดพลาด'
    }
  }

  const getErrorColor = () => {
    switch (appError.type) {
      case ErrorType.VALIDATION_ERROR:
        return 'yellow'
      case ErrorType.RATE_LIMIT_ERROR:
        return 'orange'
      default:
        return 'red'
    }
  }

  const color = getErrorColor()

  return (
    <div className={`bg-${color}-50 border-l-4 border-${color}-500 p-4 rounded-lg shadow-sm`}>
      <div className="flex items-start">
        <span className="text-3xl mr-3 flex-shrink-0">{getErrorIcon()}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-bold text-${color}-900 mb-1`}>
                {getErrorTitle()}
              </h4>
              <p className={`text-${color}-800`}>
                {appError.message}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`ml-4 text-${color}-600 hover:text-${color}-800 transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {appError.code && (
            <p className={`text-sm text-${color}-700 mt-1`}>
              รหัสข้อผิดพลาด: <code className="font-mono">{appError.code}</code>
            </p>
          )}

          {appError.details && (
            <details className="mt-2">
              <summary className={`text-sm text-${color}-700 cursor-pointer hover:underline`}>
                รายละเอียดเพิ่มเติม
              </summary>
              <pre className={`mt-2 text-xs text-${color}-700 bg-${color}-100 p-2 rounded overflow-x-auto`}>
                {JSON.stringify(appError.details, null, 2)}
              </pre>
            </details>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 inline-flex items-center px-4 py-2 bg-${color}-600 text-white text-sm font-medium rounded-lg hover:bg-${color}-700 transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ลองอีกครั้ง
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
