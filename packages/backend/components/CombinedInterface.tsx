'use client'

import { useState } from 'react'
import { PanelLeft, PanelRight, File, Bot } from 'lucide-react'
import { FileExplorer } from './FileExplorer'
import { AISandbox } from './AISandbox'

interface CombinedInterfaceProps {
  sessionId: string
  onFileSelect?: (file: any) => void
  onTaskComplete?: (task: any) => void
}

export function CombinedInterface({ sessionId, onFileSelect, onTaskComplete }: CombinedInterfaceProps) {
  const [activePanel, setActivePanel] = useState<'files' | 'ai'>('files')
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header with Panel Controls */}
      <div className="p-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActivePanel('files')}
            className={`p-2 rounded transition-colors ${
              activePanel === 'files'
                ? 'bg-blue-900/50 text-blue-300'
                : 'text-gray-400 hover:text-white'
            }`}
            title="File Explorer"
          >
            <File className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActivePanel('ai')}
            className={`p-2 rounded transition-colors ${
              activePanel === 'ai'
                ? 'bg-blue-900/50 text-blue-300'
                : 'text-gray-400 hover:text-white'
            }`}
            title="AI Sandbox"
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isPanelCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Panel Content */}
      <div className={`flex-1 overflow-hidden transition-all ${
        isPanelCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'
      }`}>
        {activePanel === 'files' ? (
          <FileExplorer />
        ) : (
          <AISandbox sessionId={sessionId} onTaskComplete={onTaskComplete} />
        )}
      </div>

      {/* Collapsed Panel Indicator */}
      {isPanelCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-center">
            <button
              onClick={() => setIsPanelCollapsed(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Expand panel"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export individual components for flexibility
export { FileExplorer } from './FileExplorer'
export { AISandbox } from './AISandbox'