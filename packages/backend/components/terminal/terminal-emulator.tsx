'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import 'xterm/css/xterm.css'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface TerminalEmulatorProps {
  roomId?: string
  sessionId?: string
  onConnect?: () => void
  onDisconnect?: () => void
}

export function TerminalEmulator({
  roomId,
  sessionId,
  onConnect,
  onDisconnect
}: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize terminal
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#0000ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#808080',
        brightRed: '#ff8080',
        brightGreen: '#80ff80',
        brightYellow: '#ffff80',
        brightBlue: '#8080ff',
        brightMagenta: '#ff80ff',
        brightCyan: '#80ffff',
        brightWhite: '#ffffff'
      },
      rows: 24,
      cols: 80
    })

    // Add addons
    const fit = new FitAddon()
    const webLinks = new WebLinksAddon()
    
    terminal.loadAddon(fit)
    terminal.loadAddon(webLinks)
    
    fitAddon.current = fit
    terminalInstance.current = terminal

    // Open terminal
    terminal.open(terminalRef.current)
    fit.fit()

    // Welcome message
    terminal.writeln('\x1b[1;32m\x1b[0m')
    terminal.writeln('\x1b[1;32m         Welcome to Mr.Prompt Terminal                     \x1b[0m')
    terminal.writeln('\x1b[1;32m\x1b[0m')
    terminal.writeln('')
    
    if (roomId) {
      terminal.writeln(`\x1b[1;36mConnecting to room: ${roomId}\x1b[0m`)
      connectToRoom(terminal, roomId)
    } else {
      terminal.writeln('\x1b[1;33mNo room specified. Terminal is in local mode.\x1b[0m')
      terminal.writeln('')
      terminal.write('\x1b[1;32m$\x1b[0m ')
    }

    // Handle input
    terminal.onData((data) => {
      handleTerminalInput(terminal, data)
    })

    // Handle resize
    const handleResize = () => {
      fit.fit()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [roomId])

  const connectToRoom = async (terminal: Terminal, roomId: string) => {
    try {
      // Create terminal session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        terminal.writeln('\x1b[1;31mError: Not authenticated\x1b[0m')
        return
      }

      // Check if user is member of room
      const { data: membership } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', session.user.id)
        .single()

      if (!membership) {
        terminal.writeln('\x1b[1;31mError: You are not a member of this room\x1b[0m')
        return
      }

      // Create terminal session
      const { data: terminalSession, error } = await supabase
        .from('terminal_sessions')
        .insert({
          room_id: roomId,
          user_id: session.user.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        terminal.writeln(`\x1b[1;31mError: ${error.message}\x1b[0m`)
        return
      }

      setCurrentSessionId(terminalSession.id)
      setIsConnected(true)
      
      terminal.writeln('\x1b[1;32m Connected successfully\x1b[0m')
      terminal.writeln('')
      terminal.write('\x1b[1;32m$\x1b[0m ')

      if (onConnect) onConnect()

      // Subscribe to terminal messages
      subscribeToMessages(terminal, terminalSession.id)
    } catch (error: any) {
      terminal.writeln(`\x1b[1;31mError: ${error.message}\x1b[0m`)
    }
  }

  const subscribeToMessages = (terminal: Terminal, sessionId: string) => {
    // Subscribe to real-time messages
    const channel = supabase
      .channel(`terminal:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'terminal_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const message = payload.new as any
          if (message.message_type === 'output') {
            terminal.write(message.content)
          } else if (message.message_type === 'error') {
            terminal.writeln(`\x1b[1;31m${message.content}\x1b[0m`)
          } else if (message.message_type === 'system') {
            terminal.writeln(`\x1b[1;36m${message.content}\x1b[0m`)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  const handleTerminalInput = async (terminal: Terminal, data: string) => {
    // Handle special keys
    if (data === '\r') { // Enter
      terminal.write('\r\n')
      
      // Send command to backend for execution
      const command = currentCommand.trim();
      
      if (command && currentSessionId) {
        try {
          // Execute command via API
          const response = await fetch('/api/terminal/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: currentSessionId,
              command: command
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Display output
            if (result.output) {
              terminal.write(result.output + '\r\n');
            }
            
            // Display error if any
            if (result.error) {
              terminal.write('\x1b[1;31m' + result.error + '\x1b[0m\r\n');
            }
          } else {
            terminal.write('\x1b[1;31mError: Failed to execute command\x1b[0m\r\n');
          }
        } catch (error) {
          terminal.write('\x1b[1;31mError: ' + (error instanceof Error ? error.message : 'Unknown error') + '\x1b[0m\r\n');
        }
      }
      
      // Reset command buffer
      setCurrentCommand('');
      
      // Show prompt
      terminal.write('\x1b[1;32m$\x1b[0m ')
      
      if (currentSessionId && isConnected) {
        // Save input to database
        await supabase.from('terminal_messages').insert({
          session_id: currentSessionId,
          message_type: 'input',
          content: data
        })
      }
    } else if (data === '\u007F') { // Backspace
      terminal.write('\b \b')
    } else if (data === '\u0003') { // Ctrl+C
      terminal.write('^C\r\n')
      terminal.write('\x1b[1;32m$\x1b[0m ')
    } else {
      terminal.write(data)
    }
  }

  const disconnect = async () => {
    if (currentSessionId) {
      await supabase
        .from('terminal_sessions')
        .update({
          status: 'disconnected',
          ended_at: new Date().toISOString()
        })
        .eq('id', currentSessionId)

      setIsConnected(false)
      setCurrentSessionId(null)

      if (onDisconnect) onDisconnect()
    }
  }

  return (
    <div className="relative h-full w-full">
      <div ref={terminalRef} className="h-full w-full" />
      
      {isConnected && (
        <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-xs text-green-400 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Connected</span>
        </div>
      )}
    </div>
  )
}
