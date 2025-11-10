'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Terminal, User, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface TerminalChatProps {
  sessionId: string
  initialMessages?: Message[]
}

export function TerminalChat({ sessionId, initialMessages = [] }: TerminalChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `กำลังประมวลผล: "${inputValue}"`,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="bg-black text-green-400 font-mono h-full flex flex-col rounded-lg border border-green-900/30">
      {/* Terminal Header */}
      <div className="px-4 py-2 bg-gray-900 border-b border-green-900/30 flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        <span className="text-sm">Terminal Chat - Session: {sessionId}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-green-600">
            <p>Mr.Prompt Terminal v1.0.0</p>
            <p>พิมพ์คำสั่งหรือข้อความเพื่อเริ่มต้น...</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            {message.role === 'user' ? (
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-1 text-green-500" />
                <div className="flex-1">
                  <span className="text-green-300">{message.content}</span>
                </div>
              </div>
            ) : message.role === 'assistant' ? (
              <div className="flex items-start gap-2">
                <Terminal className="w-4 h-4 mt-1 text-blue-400" />
                <div className="flex-1">
                  <span className="text-blue-300">{message.content}</span>
                </div>
              </div>
            ) : (
              <div className="text-yellow-400">
                <span>[SYSTEM] {message.content}</span>
              </div>
            )}
            <div className="text-xs text-gray-600 pl-6">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-blue-300">กำลังพิมพ์...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-green-900/30">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-green-500" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="พิมพ์คำสั่ง..."
            className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-900"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2 text-green-500 hover:text-green-300 disabled:text-green-900 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
