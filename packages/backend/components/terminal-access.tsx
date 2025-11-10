'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Play, Square, ChevronRight, X } from 'lucide-react'

interface TerminalCommand {
  id: string
  command: string
  output: string
  timestamp: Date
  status: 'running' | 'completed' | 'error'
}

interface TerminalAccessProps {
  projectId?: string
  isActive?: boolean
  onStop?: () => void
}

export function TerminalAccess({ projectId, isActive = false, onStop }: TerminalAccessProps) {
  const [commands, setCommands] = useState<TerminalCommand[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !projectId) return

    // Fetch terminal commands from API
    const fetchCommands = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/terminal`)
        if (response.ok) {
          const data = await response.json()
          setCommands(data.commands || [])
        }
      } catch (error) {
        console.error('Error fetching terminal commands:', error)
      }
    }

    fetchCommands()

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchCommands, 2000)
    return () => clearInterval(interval)
  }, [isActive, projectId])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [commands])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getStatusColor = (status: TerminalCommand['status']) => {
    switch (status) {
      case 'running':
        return 'text-yellow-400'
      case 'completed':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
    }
  }

  const getStatusIcon = (status: TerminalCommand['status']) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3 animate-pulse" />
      case 'completed':
        return <ChevronRight className="w-3 h-3" />
      case 'error':
        return <X className="w-3 h-3" />
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-green-400 rounded-lg border border-green-900/30 hover:bg-gray-800 transition-colors shadow-lg"
        >
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-mono">Terminal Access</span>
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[600px] max-w-[90vw]">
      <div className="bg-black text-green-400 font-mono rounded-lg border border-green-900/30 shadow-2xl flex flex-col max-h-[500px]">
        {/* Header */}
        <div className="px-4 py-2 bg-gray-900 border-b border-green-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="text-sm">Terminal Access - AI Commands</span>
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isActive && onStop && (
              <button
                onClick={onStop}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="หยุดการทำงาน"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {commands.length === 0 ? (
            <div className="text-green-600">
              <p>Mr.Prompt Terminal v1.0.0</p>
              <p>รอคำสั่งจาก AI...</p>
            </div>
          ) : (
            commands.map((cmd) => (
              <div key={cmd.id} className="space-y-1">
                <div className="flex items-start gap-2">
                  <div className={getStatusColor(cmd.status)}>
                    {getStatusIcon(cmd.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">$</span>
                      <span className="text-green-300">{cmd.command}</span>
                    </div>
                    {cmd.output && (
                      <pre className="mt-1 text-xs text-gray-400 whitespace-pre-wrap pl-5">
                        {cmd.output}
                      </pre>
                    )}
                    <div className="text-xs text-gray-600 pl-5 mt-1">
                      [{formatTime(cmd.timestamp)}] {cmd.status}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-900 border-t border-green-900/30 text-xs text-gray-500">
          <p> คุณสามารถดูคำสั่งที่ AI ใช้สร้างโปรเจกต์ของคุณได้ที่นี่</p>
        </div>
      </div>
    </div>
  )
}
