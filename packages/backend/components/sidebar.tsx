"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Library, 
  List, 
  Settings,
  User,
  ChevronDown,
  MessageSquare,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  preview: string
  timestamp: string
  isActive?: boolean
}

interface SidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  tasks?: Task[]
  onNewTask?: () => void
  onSelectTask?: (taskId: string) => void
  onDeleteTask?: (taskId: string) => void
}

export function Sidebar({ 
  user = { name: 'User', email: 'user@example.com' },
  tasks = [],
  onNewTask,
  onSelectTask,
  onDeleteTask
}: SidebarProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen w-[250px] flex-col border-r bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            MP
          </div>
          <span className="font-semibold text-sm">Mr.Prompt</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="ml-auto h-8 w-8"
          onClick={onNewTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2 border-b">
        <nav className="space-y-1">
          <Link href="/app/library">
            <Button
              variant={pathname === '/app/library' ? 'secondary' : 'ghost'}
              className="w-full justify-start h-9"
            >
              <Library className="mr-2 h-4 w-4" />
              <span className="text-sm">Library</span>
            </Button>
          </Link>
          <Link href="/app/tasks">
            <Button
              variant={pathname === '/app/tasks' ? 'secondary' : 'ghost'}
              className="w-full justify-start h-9"
            >
              <List className="mr-2 h-4 w-4" />
              <span className="text-sm">All tasks</span>
            </Button>
          </Link>
        </nav>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No tasks found' : 'No tasks yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={onNewTask}
                >
                  Create your first task
                </Button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "group relative flex flex-col gap-1 rounded-lg p-2.5 hover:bg-accent cursor-pointer transition-colors",
                  task.isActive && "bg-accent"
                )}
                onClick={() => onSelectTask?.(task.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium line-clamp-1 flex-1">
                    {task.title}
                  </h4>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTask?.(task.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.preview}
                </p>
                <span className="text-xs text-muted-foreground">
                  {task.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Menu */}
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-2"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="rounded-full" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate w-full">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {user.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
