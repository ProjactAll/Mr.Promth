"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ChatInterfaceSimple } from '@/components/chat-interface-simple'
import { TerminalWindow } from '@/components/terminal-window'
import { ProgressDisplay, type ProgressSection } from '@/components/progress-display'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Task {
  id: string
  title: string
  preview: string
  timestamp: string
  isActive?: boolean
}

export default function ChatPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'สร้างเว็บขายกาแฟ',
      preview: 'เว็บ e-commerce สำหรับคาเฟ่ มีระบบสั่ง preorder',
      timestamp: '2 hours ago',
      isActive: true
    }
  ])
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'สวัสดีครับ! ผมคือ Mr.Prompt ผมสามารถช่วยคุณสร้างเว็บไซต์ ตอบคำถาม หรือคุยเรื่องทั่วไปได้ ลองถามอะไรผมสักอย่างสิครับ!',
      timestamp: new Date().toISOString()
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalLines, setTerminalLines] = useState<any[]>([])
  const [currentCommand, setCurrentCommand] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [progressSections, setProgressSections] = useState<ProgressSection[]>([])
  
  const user = {
    name: 'User',
    email: 'user@example.com'
  }

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Check if it's a website creation request
    const isWebsiteRequest = content.includes('สร้าง') || 
                            content.includes('เว็บ') || 
                            content.includes('website')

    if (isWebsiteRequest) {
      // Show terminal
      setIsTerminalOpen(true)
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `กำลังสร้างเว็บไซต์ให้คุณ...\n\nผมกำลังวิเคราะห์ความต้องการของคุณและเริ่มสร้างเว็บไซต์ คุณสามารถดูความคืบหน้าได้ทางด้านขวา`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
        
        // Simulate terminal output
        simulateWebsiteCreation()
      }, 1000)
    } else {
      // Normal chat response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `ขอบคุณสำหรับคำถามครับ! ผมเข้าใจว่าคุณต้องการทราบเกี่ยวกับ "${content}"\n\nผมสามารถช่วยคุณได้หลายอย่าง:\n- สร้างเว็บไซต์\n- ตอบคำถามทั่วไป\n- ให้คำแนะนำ\n\nลองถามอะไรผมเพิ่มเติมได้เลยครับ!`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 1000)
    }
  }

  const simulateWebsiteCreation = () => {
    // Simulate progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(interval)
      }
    }, 500)

    // Simulate terminal output
    const commands = [
      { command: 'mkdir project && cd project', delay: 500 },
      { command: 'npm init -y', delay: 1000 },
      { command: 'npm install next react react-dom', delay: 1500 },
      { command: 'npm run build', delay: 2000 },
    ]

    commands.forEach(({ command, delay }) => {
      setTimeout(() => {
        setCurrentCommand(command)
        setTerminalLines(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'command',
            content: `$ ${command}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ])
      }, delay)
    })

    // Simulate progress sections
    setTimeout(() => {
      setProgressSections([
        {
          id: '1',
          title: 'วิเคราะห์ความต้องการ',
          isExpanded: true,
          items: [
            {
              id: '1-1',
              title: 'อ่านและวิเคราะห์ prompt',
              status: 'done',
              timestamp: '10:30:45'
            },
            {
              id: '1-2',
              title: 'กำหนด features และ pages',
              status: 'done',
              timestamp: '10:30:46'
            }
          ]
        },
        {
          id: '2',
          title: 'สร้างโครงสร้างโปรเจกต์',
          isExpanded: false,
          items: [
            {
              id: '2-1',
              title: 'สร้าง folder structure',
              status: 'running',
              command: 'mkdir -p app components lib',
              timestamp: '10:30:47'
            },
            {
              id: '2-2',
              title: 'ติดตั้ง dependencies',
              status: 'pending'
            }
          ]
        }
      ])
    }, 1000)
  }

  const handleNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Chat',
      preview: 'Start a new conversation',
      timestamp: 'Just now',
      isActive: true
    }
    
    // Deactivate all tasks
    setTasks(prev => prev.map(t => ({ ...t, isActive: false })))
    
    // Add new task
    setTasks(prev => [newTask, ...prev])
    
    // Reset messages
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'สวัสดีครับ! ผมคือ Mr.Prompt ผมสามารถช่วยคุณสร้างเว็บไซต์ ตอบคำถาม หรือคุยเรื่องทั่วไปได้ ลองถามอะไรผมสักอย่างสิครับ!',
        timestamp: new Date().toISOString()
      }
    ])
    
    // Reset terminal
    setIsTerminalOpen(false)
    setTerminalLines([])
    setCurrentCommand('')
    setProgress(0)
    setProgressSections([])
  }

  const handleSelectTask = (taskId: string) => {
    setTasks(prev => prev.map(t => ({ ...t, isActive: t.id === taskId })))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={user}
        tasks={tasks}
        onNewTask={handleNewTask}
        onSelectTask={handleSelectTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterfaceSimple
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Terminal Window */}
      {isTerminalOpen && (
        <TerminalWindow
          isOpen={isTerminalOpen}
          onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
          lines={terminalLines}
          currentCommand={currentCommand}
          progress={progress}
          progressItems={progressSections.flatMap(s => s.items)}
          isLive={true}
        />
      )}
    </div>
  )
}
