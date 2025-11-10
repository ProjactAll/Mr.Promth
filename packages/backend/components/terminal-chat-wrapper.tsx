'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal, Send, Loader2 } from 'lucide-react'
import type { ChatMessage } from './chat/types'

interface TerminalChatWrapperProps {
  messages: ChatMessage[]
  onSend: (content: string) => void
  isStreaming: boolean
  sessionId: string
}

export function TerminalChatWrapper({ 
  messages, 
  onSend, 
  isStreaming,
  sessionId 
}: TerminalChatWrapperProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    
    onSend(input.trim())
    setInput('')
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'text-cyan-400'
      case 'assistant':
        return 'text-green-400'
      case 'system':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRolePrefix = (role: string) => {
    switch (role) {
      case 'user':
        return 'user@mrprompt'
      case 'assistant':
        return 'ai@mrprompt'
      case 'system':
        return 'system@mrprompt'
      default:
        return 'unknown'
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono rounded-lg border border-green-900/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-900 border-b border-green-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="text-sm">Mr.Prompt Terminal Chat</span>
          <span className="text-xs text-gray-500">Session: {sessionId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>AI กำลังตอบ...</span>
            </div>
          )}
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Welcome Message */}
        <div className="text-green-600 text-sm">
          <p>Mr.Prompt Terminal Chat v1.0.0</p>
          <p>พิมพ์ข้อความเพื่อเริ่มสนทนากับ AI...</p>
          <p className="text-xs mt-1">พิมพ์ &apos;help&apos; เพื่อดูคำสั่งที่ใช้ได้</p>
        </div>

        {/* Chat Messages */}
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <div className="flex items-start gap-2">
              <div className={`${getRoleColor(message.role)} flex-shrink-0`}>
                <span className="text-xs">[{formatTime(message.createdAt)}]</span>
                <span className="ml-2">{getRolePrefix(message.role)}$</span>
              </div>
              <div className="flex-1">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse" />
                  )}
                </pre>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-green-900/30">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-sm">user@mrprompt$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="พิมพ์ข้อความของคุณ..."
            className="flex-1 bg-transparent border-none outline-none text-green-300 placeholder-green-800 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2 text-green-400 hover:text-green-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-900 border-t border-green-900/30 text-xs text-gray-600">
        <p> กด Enter เพื่อส่งข้อความ | ESC เพื่อล้างข้อความ</p>
      </div>
    </div>
  )
}
