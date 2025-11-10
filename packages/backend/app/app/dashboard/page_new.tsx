'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Bot, 
  Code, 
  Terminal as TerminalIcon,
  Sparkles,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatInput, setChatInput] = useState('')
  const [agentPrompt, setAgentPrompt] = useState('')
  const [webPrompt, setWebPrompt] = useState('')

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
          <p className="text-gray-600 mt-1">เลือกโหมดการทำงานที่ต้องการ</p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 rounded-lg border bg-white shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-gray-50 px-6 py-3">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="agent" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Agent
              </TabsTrigger>
              <TabsTrigger value="web" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Web Builder
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Zone */}
          <TabsContent value="chat" className="flex-1 flex flex-col p-6 m-0">
            <div className="flex-1 flex flex-col gap-4">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Chat with AI</h2>
                  <p className="text-sm text-gray-600">สนทนากับ AI ได้อย่างอิสระ</p>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto rounded-lg border bg-gray-50 p-6">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>เริ่มต้นการสนทนากับ AI</p>
                    <p className="text-sm mt-2">พิมพ์ข้อความด้านล่างเพื่อเริ่มต้น</p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="พิมพ์ข้อความ..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      // Handle send message
                    }
                  }}
                />
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Agent Zone */}
          <TabsContent value="agent" className="flex-1 flex flex-col p-6 m-0">
            <div className="flex-1 flex flex-col gap-4">
              {/* Agent Header */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">AI Agent</h2>
                  <p className="text-sm text-gray-600">ให้ AI ทำงานอัตโนมัติตามคำสั่ง</p>
                </div>
              </div>

              {/* Agent Workspace */}
              <div className="flex-1 overflow-y-auto rounded-lg border bg-gray-50 p-6">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>กำหนดงานให้ AI Agent</p>
                    <p className="text-sm mt-2">ระบุงานที่ต้องการให้ AI ทำอัตโนมัติ</p>
                  </div>
                </div>
              </div>

              {/* Agent Input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="ระบุงานที่ต้องการให้ AI ทำ เช่น 'วิเคราะห์ข้อมูลและสร้างรายงาน'"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button className="w-full">
                  <Bot className="h-4 w-4 mr-2" />
                  เริ่มทำงาน
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Web Builder Zone */}
          <TabsContent value="web" className="flex-1 flex flex-col p-6 m-0">
            <div className="flex-1 flex flex-col gap-4">
              {/* Web Builder Header */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Web Builder</h2>
                  <p className="text-sm text-gray-600">สร้างเว็บไซต์ด้วย AI</p>
                </div>
              </div>

              {/* Web Builder Workspace */}
              <div className="flex-1 overflow-y-auto rounded-lg border bg-gray-50 p-6">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>บอก AI ว่าคุณต้องการเว็บไซต์แบบไหน</p>
                    <p className="text-sm mt-2">AI จะสร้างเว็บไซต์ให้คุณอัตโนมัติ</p>
                  </div>
                </div>
              </div>

              {/* Web Builder Input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="บอก AI ว่าคุณต้องการเว็บไซต์แบบไหน เช่น 'สร้างเว็บขายกาแฟ มีระบบสั่งซื้อออนไลน์'"
                  value={webPrompt}
                  onChange={(e) => setWebPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  สร้างเว็บไซต์
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Terminal Zone */}
      <div className="h-64 rounded-lg border bg-black shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
          <TerminalIcon className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-gray-300">Terminal</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">Connected</span>
          </div>
        </div>
        <div className="p-4 font-mono text-sm text-green-400">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">$</span>
            <span className="animate-pulse">_</span>
          </div>
          <div className="mt-4 text-gray-500 text-center">
            Terminal will be connected to real user environment
          </div>
        </div>
      </div>
    </div>
  )
}
