"use client"

import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  delay = 200,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setShowTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout)
      }
    }
  }, [showTimeout])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent'
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 ${positionClasses[position]}
            animate-in fade-in duration-200
            ${className}
          `}
        >
          <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl border border-gray-700 max-w-xs">
            {content}
            <div 
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface InfoTooltipProps {
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  iconClassName?: string
}

export function InfoTooltip({ content, position = 'top', iconClassName = '' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <HelpCircle className={`w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help ${iconClassName}`} />
    </Tooltip>
  )
}

interface KeyboardShortcutProps {
  keys: string[]
  description: string
}

export function KeyboardShortcut({ keys, description }: KeyboardShortcutProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-gray-300">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-700 border border-gray-600 rounded"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: Array<{
    category: string
    items: Array<{ keys: string[]; description: string }>
  }>
}

export function KeyboardShortcutsDialog({ isOpen, onClose, shortcuts }: KeyboardShortcutsDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {shortcuts.map((category, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-white mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <KeyboardShortcut
                      key={itemIndex}
                      keys={item.keys}
                      description={item.description}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-700 border border-gray-600 rounded">?</kbd> to toggle this dialog
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
