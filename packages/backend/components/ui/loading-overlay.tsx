"use client"

import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: number
  children: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  progress,
  children 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-white font-medium mb-2">{message}</p>
              
              {progress !== undefined && (
                <div className="w-full">
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">{progress}%</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500 ${className}`} />
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className = '' }: LoadingDotsProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-700 rounded ${className}`}
        />
      ))}
    </>
  )
}

interface SkeletonCardProps {
  showAvatar?: boolean
}

export function SkeletonCard({ showAvatar = false }: SkeletonCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="animate-pulse">
        {showAvatar && (
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full mr-4" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-700 rounded w-4/6" />
        </div>
        
        <div className="mt-6 flex gap-3">
          <div className="h-10 bg-gray-700 rounded w-24" />
          <div className="h-10 bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-750 border-b border-gray-700 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-gray-700 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface FullPageLoadingProps {
  message?: string
}

export function FullPageLoading({ message = 'Loading...' }: FullPageLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">{message}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  )
}
