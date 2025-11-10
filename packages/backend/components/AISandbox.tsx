'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, RefreshCw, Terminal, Code, FileText, Folder } from 'lucide-react'

interface AITask {
  id: string
  type: 'code_generation' | 'file_operation' | 'analysis' | 'refactoring'
  status: 'pending' | 'running' | 'completed' | 'failed'
  title: string
  description: string
  progress: number
  startTime: Date
  endTime?: Date
  output?: string
  error?: string
}

interface AISandboxProps {
  sessionId: string
  onTaskComplete?: (task: AITask) => void
}

export function AISandbox({ sessionId, onTaskComplete }: AISandboxProps) {
  const [tasks, setTasks] = useState<AITask[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Establish SSE connection for real-time updates
    connectToAIStream()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [sessionId])

  const connectToAIStream = async () => {
    setConnectionStatus('connecting')

    try {
      // Connect to AI gateway SSE endpoint
      const eventSource = new EventSource(`/api/ai/stream?session=${sessionId}`)
      
      eventSource.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
      }

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleAIMessage(data)
      }

      eventSource.onerror = () => {
        setConnectionStatus('disconnected')
        setIsConnected(false)
        eventSource.close()
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('Failed to connect to AI stream:', error)
      setConnectionStatus('disconnected')
    }
  }

  const handleAIMessage = (data: any) => {
    switch (data.type) {
      case 'task_created':
        setTasks(prev => [...prev, data.task])
        break
      case 'task_progress':
        updateTaskProgress(data.taskId, data.progress, data.output)
        break
      case 'task_completed':
        completeTask(data.taskId, data.output, undefined)
        break
      case 'task_failed':
        completeTask(data.taskId, undefined, data.error)
        break
    }
  }

  const updateTaskProgress = (taskId: string, progress: number, output?: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'running' as const, progress, output }
        : task
    ))
  }

  const completeTask = (taskId: string, output?: string, error?: string) => {
    const endTime = new Date()
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            status: error ? 'failed' as const : 'completed' as const,
            progress: 100,
            output,
            error,
            endTime
          }
        : task
    ))

    // Notify parent component
    const completedTask = tasks.find(t => t.id === taskId)
    if (completedTask && onTaskComplete) {
      onTaskComplete({
        ...completedTask,
        status: error ? 'failed' : 'completed',
        progress: 100,
        output,
        error,
        endTime
      })
    }
  }

  const getTaskIcon = (type: AITask['type']) => {
    switch (type) {
      case 'code_generation':
        return <Code className="w-4 h-4" />
      case 'file_operation':
        return <FileText className="w-4 h-4" />
      case 'analysis':
        return <Terminal className="w-4 h-4" />
      case 'refactoring':
        return <RefreshCw className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: AITask['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400'
      case 'running':
        return 'text-blue-400'
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBgColor = (status: AITask['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-700'
      case 'running':
        return 'bg-blue-900/30'
      case 'completed':
        return 'bg-green-900/30'
      case 'failed':
        return 'bg-red-900/30'
      default:
        return 'bg-gray-700'
    }
  }

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              AI Sandbox
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : connectionStatus === 'connecting' ? 'bg-yellow-400 animate-spin' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-500 capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={connectToAIStream}
            disabled={connectionStatus === 'connecting'}
            className="w-full px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700 rounded text-xs text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connectionStatus === 'connecting' ? (
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Connecting...
              </div>
            ) : (
              'Reconnect'
            )}
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-sm text-gray-500 mb-2">No AI tasks running</p>
            <p className="text-xs text-gray-600">Upload files or start a chat to see AI in action</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`p-3 border rounded-lg transition-all ${
                  task.status === 'running' ? 'border-blue-500/50 bg-blue-900/20' :
                  task.status === 'completed' ? 'border-green-500/50 bg-green-900/20' :
                  task.status === 'failed' ? 'border-red-500/50 bg-red-900/20' :
                  'border-gray-600/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getStatusBgColor(task.status)}`}>
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">{task.title}</h4>
                      <p className="text-xs text-gray-500">{task.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {/* Progress Bar */}
                {task.status === 'running' && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Output */}
                {task.output && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 border-l-2 border-blue-500">
                    {task.output}
                  </div>
                )}

                {/* Error */}
                {task.error && (
                  <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300 border-l-2 border-red-500">
                    {task.error}
                  </div>
                )}

                {/* Task Duration */}
                {task.endTime ? (
                  <div className="text-xs text-gray-500 mt-2">
                    Completed in {(task.endTime.getTime() - task.startTime.getTime()) / 1000}s
                  </div>
                ) : task.status === 'running' && (
                  <div className="text-xs text-gray-500 mt-2">
                    Running for {(Date.now() - task.startTime.getTime()) / 1000}s
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-2">
          <button
            onClick={() => setTasks([])}
            className="w-full px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700 rounded text-sm text-red-300 transition-colors"
          >
            Clear Tasks
          </button>
        </div>
      </div>
    </div>
  )
}