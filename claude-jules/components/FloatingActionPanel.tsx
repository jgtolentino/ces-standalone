'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles, Terminal, FileText } from 'lucide-react'

interface FloatingActionPanelProps {
  onCommand: (command: string) => void
}

export default function FloatingActionPanel({ onCommand }: FloatingActionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions = [
    { icon: Sparkles, label: 'AI Enhance', command: 'enhance this code with AI improvements' },
    { icon: Terminal, label: 'Debug', command: 'debug and fix any issues in this code' },
    { icon: FileText, label: 'Document', command: 'add comprehensive documentation to this code' },
  ]

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className="flex flex-col items-end gap-2"
        animate={{ height: isExpanded ? 'auto' : 56 }}
      >
        {/* Action Buttons */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isExpanded ? 1 : 0, 
            scale: isExpanded ? 1 : 0.8,
            y: isExpanded ? 0 : 20
          }}
          transition={{ staggerChildren: 0.1 }}
        >
          {actions.map((action, index) => (
            <motion.button
              key={index}
              onClick={() => onCommand(action.command)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 shadow-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon size={16} />
              <span className="text-sm">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isExpanded ? 45 : 0 }}
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}