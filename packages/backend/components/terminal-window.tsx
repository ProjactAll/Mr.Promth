"use client"

import { useState, useRef, useEffect } from 'react'
import { 
  Terminal, 
  ChevronRight, 
  ChevronDown,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  SkipForward
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error' | 'info'
  content: string
  timestamp?: string
}

interface ProgressItem {
  id: string
  title: string
  description?: string
  status: 'pending' | 'running' | 'done' | 'error'
  timestamp?: string
  details?: string[]
  command?: string
  output?: string
  isExpanded?: boolean
}

interface TerminalWindowProps {
  isOpen?: boolean
  onToggle?: () => void
  lines?: TerminalLine[]
  currentCommand?: string
  progress?: number
  progressItems?: ProgressItem[]
  isLive?: boolean
  onJumpToLive?: () => void
}

export function TerminalWindow({
  isOpen = true,
  onToggle,
  lines = [],
  currentCommand,
  progress = 0,
  progressItems = [],
  isLive = true,
  onJumpToLive
}: TerminalWindowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom when new lines arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current && isLive) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [lines, autoScroll, isLive])

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Terminal className="mr-2 h-4 w-4" />
        Show Terminal
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col border-l bg-card transition-all duration-300",
        isExpanded ? "w-full" : "w-[400px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Mr.Prompt&apos;s Computer</span>
          {currentCommand && (
            <span className="text-xs text-muted-foreground">
              • Running
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onToggle}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Current Command */}
      {currentCommand && (
        <div className="border-b bg-muted/30 px-3 py-2">
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 items-center justify-center flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5">Executing command</p>
              <code className="text-xs text-muted-foreground break-all">
                {currentCommand}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Progress Items */}
      {progressItems.length > 0 && (
        <div className="border-b">
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              {progressItems.map((item) => (
                <div key={item.id} className="rounded-md border bg-card">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center gap-2 p-2 text-left hover:bg-accent transition-colors"
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    )}
                    
                    <div className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                      {item.status === 'done' && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {item.status === 'running' && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      {item.status === 'error' && (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                      {item.status === 'pending' && (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    
                    <span className="text-xs flex-1 min-w-0 truncate">
                      {item.title}
                    </span>
                  </button>
                  
                  {expandedItems.has(item.id) && (
                    <div className="border-t bg-muted/30 p-2 space-y-1">
                      {item.command && (
                        <div>
                          <p className="text-xs font-medium mb-1">Command:</p>
                          <code className="text-xs text-muted-foreground block">
                            {item.command}
                          </code>
                        </div>
                      )}
                      {item.output && (
                        <div>
                          <p className="text-xs font-medium mb-1">Output:</p>
                          <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
                            {item.output}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Terminal Output */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-[#1E1E1E]">
        <div className="p-3 font-mono text-xs">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Terminal className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground/50 text-xs">
                Terminal output will appear here
              </p>
            </div>
          ) : (
            lines.map((line) => (
              <div
                key={line.id}
                className={cn(
                  "mb-1",
                  line.type === 'command' && "text-[#4EC9B0]",
                  line.type === 'output' && "text-[#D4D4D4]",
                  line.type === 'error' && "text-[#F48771]",
                  line.type === 'info' && "text-[#569CD6]"
                )}
              >
                {line.timestamp && (
                  <span className="text-muted-foreground/50 mr-2">
                    [{line.timestamp}]
                  </span>
                )}
                <span className="whitespace-pre-wrap break-all">
                  {line.content}
                </span>
              </div>
            ))
          )}
          
          {/* Cursor */}
          {currentCommand && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[#4EC9B0]">$</span>
              <span className="inline-block w-2 h-4 bg-[#D4D4D4] animate-pulse ml-1" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t bg-card px-3 py-2 space-y-2">
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setAutoScroll(!autoScroll)}
            >
              {autoScroll ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          {!isLive && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={onJumpToLive}
            >
              <SkipForward className="mr-1 h-3 w-3" />
              Jump to live
            </Button>
          )}
          
          {isLive && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
