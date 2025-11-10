"use client"

import { useState } from 'react'
import { ChevronRight, ChevronDown, Check, Loader2, X, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface ProgressItem {
  id: string
  title: string
  description?: string
  status: 'pending' | 'running' | 'done' | 'error'
  timestamp?: string
  details?: string[]
  command?: string
  output?: string
}

export interface ProgressSection {
  id: string
  title: string
  items: ProgressItem[]
  isExpanded?: boolean
}

interface ProgressDisplayProps {
  sections: ProgressSection[]
  onToggleSection?: (sectionId: string) => void
}

export function ProgressDisplay({ sections, onToggleSection }: ProgressDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.isExpanded).map(s => s.id))
  )
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
    onToggleSection?.(sectionId)
  }

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const getStatusIcon = (status: ProgressItem['status']) => {
    switch (status) {
      case 'done':
        return <Check className="h-3 w-3 text-green-600" />
      case 'running':
        return <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
      case 'error':
        return <X className="h-3 w-3 text-red-600" />
      case 'pending':
        return <Circle className="h-3 w-3 text-muted-foreground/40" />
    }
  }

  const getStatusColor = (status: ProgressItem['status']) => {
    switch (status) {
      case 'done':
        return 'text-green-600'
      case 'running':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
      case 'pending':
        return 'text-muted-foreground/60'
    }
  }

  return (
    <div className="space-y-2">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id)
        const doneCount = section.items.filter(i => i.status === 'done').length
        const totalCount = section.items.length
        const hasError = section.items.some(i => i.status === 'error')
        const isRunning = section.items.some(i => i.status === 'running')

        return (
          <div key={section.id} className="rounded-lg border bg-card overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-2 p-3 text-left hover:bg-accent transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">{section.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{totalCount} completed
                  </span>
                  {isRunning && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Running
                    </span>
                  )}
                  {hasError && (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <X className="h-3 w-3" />
                      Error
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Section Items */}
            {isExpanded && (
              <div className="border-t bg-muted/30">
                {section.items.map((item) => {
                  const isItemExpanded = expandedItems.has(item.id)
                  const hasDetails = item.details || item.command || item.output

                  return (
                    <div key={item.id} className="border-b last:border-b-0">
                      <div
                        className={cn(
                          "flex items-start gap-2 p-3",
                          hasDetails && "cursor-pointer hover:bg-accent/50 transition-colors"
                        )}
                        onClick={() => hasDetails && toggleItem(item.id)}
                      >
                        {hasDetails && (
                          isItemExpanded ? (
                            <ChevronDown className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          )
                        )}
                        
                        <div className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                          {getStatusIcon(item.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", getStatusColor(item.status))}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                          {item.timestamp && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              {item.timestamp}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      {isItemExpanded && hasDetails && (
                        <div className="bg-muted/50 px-3 pb-3 space-y-2">
                          {item.command && (
                            <div>
                              <p className="text-xs font-medium mb-1">Executing command:</p>
                              <code className="block text-xs bg-[#1E1E1E] text-[#4EC9B0] p-2 rounded font-mono">
                                {item.command}
                              </code>
                            </div>
                          )}
                          
                          {item.details && item.details.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">Details:</p>
                              <ul className="space-y-1">
                                {item.details.map((detail, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-muted-foreground/40 mt-0.5">•</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {item.output && (
                            <div>
                              <p className="text-xs font-medium mb-1">Output:</p>
                              <pre className="text-xs bg-[#1E1E1E] text-[#D4D4D4] p-2 rounded font-mono overflow-x-auto">
                                {item.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
