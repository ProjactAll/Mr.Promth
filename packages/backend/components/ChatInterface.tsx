'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Settings, Code, Terminal, RefreshCw, Play, StopCircle } from 'lucide-react'
import { CombinedInterface } from './CombinedInterface'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'code' | 'task_update'
  metadata?: {
    task_id?: string
    task_type?: string
    progress?: number
    status?: string
  }
}

interface ChatInterfaceProps {
  sessionId: string
  initialMessages?: Message[]
}

export function ChatInterface({ sessionId, initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'executing' | 'completed'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    await simulateAIResponse(inputValue, isAgentMode)
    setIsTyping(false)
  }

  const simulateAIResponse = async (userInput: string, agentMode: boolean) => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: agentMode
        ? `I'm analyzing your request in Agent mode and will execute the necessary tasks. Let me process: "${userInput}"`
        : `I understand you're in Normal mode. Here's my response to: "${userInput}"`,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, assistantMessage])

    // If in agent mode, simulate task execution
    if (agentMode) {
      setAgentStatus('executing')

      // Simulate multiple task updates
      await new Promise(resolve => setTimeout(resolve, 2000))

      const taskUpdate: Message = {
        id: (Date.now() + 2).toString(),
        role: 'system',
        content: 'Task execution in progress...',
        timestamp: new Date(),
        type: 'task_update',
        metadata: {
          task_id: 'task_1',
          task_type: 'code_generation',
          progress: 50,
          status: 'running'
        }
      }

      setMessages(prev => [...prev, taskUpdate])

      await new Promise(resolve => setTimeout(resolve, 2000))

      const taskComplete: Message = {
        id: (Date.now() + 3).toString(),
        role: 'system',
        content: 'Task completed successfully!',
        timestamp: new Date(),
        type: 'task_update',
        metadata: {
          task_id: 'task_1',
          task_type: 'code_generation',
          progress: 100,
          status: 'completed'
        }
      }

      setMessages(prev => [...prev, taskComplete])
      setAgentStatus('completed')
    }
  }

  const toggleAgentMode = () => {
    setIsAgentMode(!isAgentMode)
    setAgentStatus('idle')
  }

  const clearChat = () => {
    setMessages([])
    setAgentStatus('idle')
  }

  const regenerateResponse = () => {
    // Remove last assistant message and regenerate
    const lastMessageIndex = messages.findIndex(m => m.role === 'assistant')
    if (lastMessageIndex !== -1) {
      setMessages(prev => prev.slice(0, lastMessageIndex))
      const lastUserMessage = messages[lastMessageIndex - 1]
      if (lastUserMessage) {
        simulateAIResponse(lastUserMessage.content, isAgentMode)
      }
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getAgentStatusIcon = () => {
    switch (agentStatus) {
      case 'thinking':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'executing':
        return <Terminal className="w-4 h-4 animate-pulse" />
      case 'completed':
        return <Code className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const getAgentStatusText = () => {
    switch (agentStatus) {
      case 'thinking':
        return 'Thinking...'
      case 'executing':
        return 'Executing tasks...'
      case 'completed':
        return 'Task completed'
      default:
        return 'Ready'
    }
  }

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Chat</h2>

            {/* Agent Mode Toggle */}
            <button
              onClick={toggleAgentMode}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isAgentMode
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {isAgentMode ? (
                  <Play className="w-3 h-3" />
                ) : (
                  <StopCircle className="w-3 h-3" />
                )}
                Agent Mode
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Clear chat"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agent Status */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className={`p-1 rounded ${agentStatus === 'idle' ? 'text-gray-400' : 'text-blue-400'}`}>
            {getAgentStatusIcon()}
          </div>
          <span>{getAgentStatusText()}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {isAgentMode ? 'Agent Mode Ready' : 'Start Chatting'}
            </h3>
            <p className="text-gray-500">
              {isAgentMode
                ? 'I\'m ready to execute tasks and analyze your requests. Send me a message to begin.'
                : 'Send a message to start the conversation.'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-green-900/50 text-green-300'
                    : message.role === 'assistant'
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'bg-yellow-900/50 text-yellow-300'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : message.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <Terminal className="w-4 h-4" />
                )}
              </div>

              <div
                className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-900/50 text-white'
                      : message.role === 'assistant'
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-yellow-900/30 text-yellow-100 border border-yellow-700/50'
                  }`}
                >
                  {message.type === 'code' ? (
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {message.content}
                    </pre>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </div>

                {/* Task Progress Indicator */}
                {message.metadata && message.metadata.progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{message.metadata.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${message.metadata.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/50 text-blue-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 max-w-3xl">
              <div className="inline-block px-4 py-2 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Type your message... ${isAgentMode ? 'Agent mode is active - I will execute tasks based on your requests.' : ''}`}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg resize-none text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={1}
              disabled={isTyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            <div className="absolute right-2 top-2 text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>

          <div className="flex gap-2">
            {messages.some(m => m.role === 'assistant') && (
              <button
                type="button"
                onClick={regenerateResponse}
                disabled={isTyping}
                className="p-3 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Regenerate response"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-3 bg-blue-900/50 hover:bg-blue-900/70 disabled:opacity-50 disabled:cursor-not-allowed text-blue-300 rounded-lg transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Mode Description */}
        <div className="mt-2 text-xs text-gray-500">
          {isAgentMode ? (
            <div className="flex items-center gap-2 p-2 bg-blue-900/20 border border-blue-700/50 rounded">
              <Bot className="w-3 h-3 text-blue-400" />
              <span>
                Agent mode: I will actively execute tasks, analyze files, and perform actions based on your requests.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-600 rounded">
              <User className="w-3 h-3 text-gray-400" />
              <span>
                Normal mode: I will respond to your messages with analysis and suggestions.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}