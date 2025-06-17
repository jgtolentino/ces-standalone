'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { JulesAgent, JulesTask } from '../agents/jules'
import CommandBar from './CommandBar'
import FloatingActionPanel from './FloatingActionPanel'
import WorkflowRunner from './WorkflowRunner'
import AIAssistant from './AIAssistant'

interface Tab {
  id: string
  name: string
  content: string
  language: string
}

export default function SmartCanvas() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'main.ts', content: '// Welcome to Claude-Jules OS\nconsole.log("AI Operating System Ready");', language: 'typescript' }
  ])
  const [activeTab, setActiveTab] = useState('1')
  const [tasks, setTasks] = useState<JulesTask[]>([])
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [julesAgent] = useState(() => new JulesAgent())

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const handleCommand = async (command: string) => {
    const newTasks = await julesAgent.planTask(command, {
      currentFile: activeTabData?.name,
      currentCode: activeTabData?.content
    })
    setTasks(prev => [...prev, ...newTasks])
    setIsCommandOpen(false)
  }

  const executeTask = async (task: JulesTask) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'running' } : t
    ))

    try {
      const result = await julesAgent.executeTask(task, {
        currentFile: activeTabData?.name,
        currentCode: activeTabData?.content
      })
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'completed' } : t
      ))

      // If task generated code, apply it
      if (task.type === 'code' || task.type === 'fix') {
        const codeBlocks = result.match(/```[\s\S]*?```/g)
        if (codeBlocks && activeTabData) {
          const cleanCode = codeBlocks[0].replace(/```\w*\n?/, '').replace(/```$/, '')
          updateTabContent(cleanCode)
        }
      }
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'failed' } : t
      ))
    }
  }

  const updateTabContent = (content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTab ? { ...tab, content } : tab
    ))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setIsCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-white font-semibold">Claude-Jules OS</h1>
        <button
          onClick={() => setIsCommandOpen(true)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        >
          Command ⌘K
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="bg-gray-800 border-b border-gray-700 flex items-center px-2 py-1">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`px-3 py-1.5 cursor-pointer text-sm rounded ${
                  activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1">
            {activeTabData && (
              <Editor
                height="100%"
                defaultLanguage={activeTabData.language}
                value={activeTabData.content}
                onChange={(value) => updateTabContent(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            )}
          </div>
        </div>

        {/* Task Panel */}
        <motion.div 
          className="w-80 bg-gray-800 border-l border-gray-700 p-4"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h3 className="text-white font-semibold mb-4">Active Tasks</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {tasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-3 rounded border ${
                    task.status === 'completed' ? 'bg-green-900 border-green-700' :
                    task.status === 'running' ? 'bg-blue-900 border-blue-700' :
                    task.status === 'failed' ? 'bg-red-900 border-red-700' :
                    'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="text-white text-sm font-medium">{task.description}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {task.type} • {task.priority} • {task.status}
                  </div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => executeTask(task)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Execute
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Command Bar */}
      <CommandBar 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onCommand={handleCommand}
      />

      {/* Floating Action Panel */}
      <FloatingActionPanel onCommand={handleCommand} />

      {/* Workflow Runner */}
      <WorkflowRunner />

      {/* AI Assistant */}
      <AIAssistant onCommand={handleCommand} />
    </div>
  )
}