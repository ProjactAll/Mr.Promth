"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, FileText, Settings, User, LogOut } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

interface MobileNavProps {
  items: NavItem[]
  currentPath?: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onLogout?: () => void
}

export function MobileNav({ items, currentPath, user, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out menu */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-700 z-40
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Mr.Prompt</h2>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${currentPath === item.href
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          {onLogout && (
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  onLogout()
                  closeMenu()
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Default navigation items
export const defaultNavItems: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: <Home className="w-5 h-5" />
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: <FileText className="w-5 h-5" />
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />
  }
]
