'use client'

import { useState, useEffect } from 'react'
import { Menu, X, FileText, Bot, MessageSquare, Settings } from 'lucide-react'
import { CombinedInterface } from './CombinedInterface'
import { ChatInterface } from './ChatInterface'

interface MainLayoutProps {
  children?: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'settings'>('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessionId] = useState(() => Date.now().toString())

  // Handle window resize to auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      } else {
        setSidebarCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'chat':
        return <MessageSquare className="w-5 h-5" />
      case 'files':
        return <FileText className="w-5 h-5" />
      case 'settings':
        return <Settings className="w-5 h-5" />
      default:
        return <MessageSquare className="w-5 h-5" />
    }
  }

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-700 rounded transition-colors lg:hidden"
              title="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">Mr.Prompt</h1>
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h1 className="text-lg font-bold">Mr.Prompt</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            {(['chat', 'files', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded transition-all text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {getTabIcon(tab)}
                <span className="ml-2 capitalize">{tab}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Tab Selector */}
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="chat">Chat</option>
              <option value="files">Files</option>
              <option value="settings">Settings</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-0' : 'w-64'
          } bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-hidden`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-center">
                {activeTab === 'chat' ? 'AI Chat' : activeTab === 'files' ? 'File Explorer' : 'Settings'}
              </h2>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {activeTab === 'files' ? (
                <CombinedInterface
                  sessionId={sessionId}
                  onTaskComplete={(task) => {
                    console.log('Task completed:', task)
                  }}
                />
              ) : activeTab === 'chat' ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-sm text-gray-500">
                    Chat interface will appear here when not in sidebar mode
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-sm text-gray-500">Settings coming soon</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatInterface sessionId={sessionId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {activeTab === 'files' ? 'File Explorer' : 'Settings'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'files'
                    ? 'Manage your files and see AI in action'
                    : 'Configure your preferences and settings'}
                </p>
                {activeTab === 'files' && (
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="mt-4 px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded transition-colors"
                  >
                    Switch to Chat
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-gray-800 border-t border-gray-700 md:hidden">
        <div className="flex items-center justify-around">
          {(['chat', 'files', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                activeTab === tab ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {getTabIcon(tab)}
              <span className="text-xs mt-1 capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// Export individual components for flexibility
export { CombinedInterface } from './CombinedInterface'
export { ChatInterface } from './ChatInterface'
export { FileExplorer } from './FileExplorer'
export { AISandbox } from './AISandbox'