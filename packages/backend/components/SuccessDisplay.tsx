'use client'

interface SuccessDisplayProps {
  message: string
  details?: string | React.ReactNode
  onDismiss?: () => void
  icon?: string
}

export function SuccessDisplay({ 
  message, 
  details, 
  onDismiss,
  icon = ''
}: SuccessDisplayProps) {
  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
      <div className="flex items-start">
        <span className="text-3xl mr-3 flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-1">
                สำเร็จ!
              </h4>
              <p className="text-green-800">
                {message}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-4 text-green-600 hover:text-green-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {details && (
            <div className="mt-2 text-sm text-green-700">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface InfoDisplayProps {
  message: string
  details?: string | React.ReactNode
  onDismiss?: () => void
  icon?: string
}

export function InfoDisplay({ 
  message, 
  details, 
  onDismiss,
  icon = 'ℹ️'
}: InfoDisplayProps) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
      <div className="flex items-start">
        <span className="text-3xl mr-3 flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">
                ข้อมูล
              </h4>
              <p className="text-blue-800">
                {message}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-4 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {details && (
            <div className="mt-2 text-sm text-blue-700">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface WarningDisplayProps {
  message: string
  details?: string | React.ReactNode
  onDismiss?: () => void
  icon?: string
}

export function WarningDisplay({ 
  message, 
  details, 
  onDismiss,
  icon = ''
}: WarningDisplayProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
      <div className="flex items-start">
        <span className="text-3xl mr-3 flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-yellow-900 mb-1">
                คำเตือน
              </h4>
              <p className="text-yellow-800">
                {message}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-4 text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {details && (
            <div className="mt-2 text-sm text-yellow-700">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
