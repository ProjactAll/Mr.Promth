'use client'

import { useState, useEffect } from 'react'
import { FileText, Code, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface BuildFile {
  id: string
  name: string
  path: string
  type: 'component' | 'page' | 'api' | 'database' | 'config'
  status: 'pending' | 'building' | 'completed' | 'error'
  size?: string
  createdAt: Date
}

interface BuildLog {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

interface BuildMonitorProps {
  projectId?: string
}

export function BuildMonitor({ projectId }: BuildMonitorProps) {
  const [files, setFiles] = useState<BuildFile[]>([])
  const [logs, setLogs] = useState<BuildLog[]>([])
  const [isBuilding, setIsBuilding] = useState(false)

  useEffect(() => {
    if (!projectId) return

    // Fetch build files and logs from API
    const fetchBuildData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/build`)
        if (response.ok) {
          const data = await response.json()
          setFiles(data.files || [])
          setLogs(data.logs || [])
          setIsBuilding(data.isBuilding || false)
        }
      } catch (error) {
        console.error('Error fetching build data:', error)
      }
    }

    fetchBuildData()

    // Poll for updates every 3 seconds while building
    const interval = setInterval(fetchBuildData, 3000)
    return () => clearInterval(interval)
  }, [projectId])

  const getFileIcon = (type: BuildFile['type']) => {
    switch (type) {
      case 'component':
        return <Code className="w-4 h-4 text-blue-400" />
      case 'page':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'api':
        return <Code className="w-4 h-4 text-purple-400" />
      case 'database':
        return <Database className="w-4 h-4 text-yellow-400" />
      case 'config':
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusIcon = (status: BuildFile['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-2 h-2 rounded-full bg-gray-500" />
      case 'building':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getLogColor = (type: BuildLog['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-300'
      case 'success':
        return 'text-green-300'
      case 'warning':
        return 'text-yellow-300'
      case 'error':
        return 'text-red-300'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="font-semibold flex items-center gap-2">
          <Code className="w-5 h-5" />
          ไฟล์ที่ AI สร้าง
        </h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-4 border-b lg:border-b-0 lg:border-r border-gray-700">
          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีไฟล์ที่สร้าง</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      {getStatusIcon(file.status)}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{file.path}</p>
                  </div>
                  {file.size && (
                    <div className="text-xs text-gray-500">
                      {file.size}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm font-semibold mb-3 text-gray-400">Build Logs</h4>
          <div className="space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>ยังไม่มี logs</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-gray-600">[{formatTime(log.timestamp)}]</span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
