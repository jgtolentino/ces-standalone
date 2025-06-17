'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Search, Zap, Code, GitBranch } from 'lucide-react'

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: string) => void
}

const QUICK_COMMANDS = [
  { icon: Code, label: 'Fix this code', command: 'fix the current code for bugs and improvements' },
  { icon: Search, label: 'Summarize repo', command: 'summarize this repository structure and purpose' },
  { icon: Zap, label: 'Generate tests', command: 'generate comprehensive tests for the current file' },
  { icon: GitBranch, label: 'Code review', command: 'review this code for best practices and issues' },
]

export default function CommandBar({ isOpen, onClose, onCommand }: CommandBarProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onCommand(input.trim())
      setInput('')
    }
  }

  const handleQuickCommand = (command: string) => {
    onCommand(command)
    setInput('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Command size={20} className="text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What can I help you with?"
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                  />
                </div>
              </form>

              {/* Quick Commands */}
              <div className="p-2">
                <div className="text-xs text-gray-400 px-3 py-2 uppercase tracking-wide">Quick Actions</div>
                {QUICK_COMMANDS.map((cmd, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickCommand(cmd.command)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded text-left transition-colors"
                  >
                    <cmd.icon size={16} className="text-gray-400" />
                    <span className="text-white">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}