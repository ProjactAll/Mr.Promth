'use client'

import { useState } from 'react'
import { Play, Pause, StopCircle, RotateCcw, Settings, Zap } from 'lucide-react'

interface ControlPanelProps {
  onStart?: () => void
  onPause?: () => void
  onStop?: () => void
  onContinue?: () => void
  onReset?: () => void
  isRunning?: boolean
  isPaused?: boolean
}

export function ControlPanel({
  onStart,
  onPause,
  onStop,
  onContinue,
  onReset,
  isRunning = false,
  isPaused = false,
}: ControlPanelProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'stopped'>('idle')

  const handleStart = () => {
    setStatus('running')
    onStart?.()
  }

  const handlePause = () => {
    setStatus('paused')
    onPause?.()
  }

  const handleStop = () => {
    setStatus('stopped')
    onStop?.()
  }

  const handleContinue = () => {
    setStatus('running')
    onContinue?.()
  }

  const handleReset = () => {
    setStatus('idle')
    onReset?.()
  }

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'พร้อมใช้งาน'
      case 'running':
        return 'กำลังทำงาน'
      case 'paused':
        return 'หยุดชั่วคราว'
      case 'stopped':
        return 'หยุดแล้ว'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'bg-gray-500'
      case 'running':
        return 'bg-green-500 animate-pulse'
      case 'paused':
        return 'bg-yellow-500'
      case 'stopped':
        return 'bg-red-500'
    }
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg border border-gray-700 p-4">
      {/* Status */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <span className="text-sm font-medium">สถานะ:</span>
        </div>
        <span className="text-sm text-gray-300">{getStatusText()}</span>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Start/Continue Button */}
          {(status === 'idle' || status === 'stopped') && (
            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">เริ่มต้น</span>
            </button>
          )}

          {status === 'paused' && (
            <button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">ดำเนินการต่อ</span>
            </button>
          )}

          {/* Pause Button */}
          {status === 'running' && (
            <button
              onClick={handlePause}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span className="text-sm font-medium">หยุดชั่วคราว</span>
            </button>
          )}

          {/* Stop Button */}
          {(status === 'running' || status === 'paused') && (
            <button
              onClick={handleStop}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span className="text-sm font-medium">หยุด</span>
            </button>
          )}

          {/* Reset Button */}
          {status !== 'idle' && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors col-span-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">รีเซ็ต</span>
            </button>
          )}
        </div>

        {/* Additional Controls */}
        <div className="pt-3 border-t border-gray-700">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">ตั้งค่า</span>
          </button>
        </div>
      </div>

      {/* Info */}
      {status === 'running' && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-300">
            <Zap className="w-4 h-4" />
            <span className="text-xs">AI กำลังสร้างโปรเจกต์ของคุณ...</span>
          </div>
        </div>
      )}
    </div>
  )
}
