'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'idle' | 'running' | 'completed' | 'failed'
}

interface WorkflowStep {
  id: string
  name: string
  command: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
}

const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Comprehensive code review and improvement suggestions',
    status: 'idle',
    steps: [
      { id: '1', name: 'Analyze code structure', command: 'analyze code structure and organization', status: 'pending' },
      { id: '2', name: 'Check best practices', command: 'review code for best practices and patterns', status: 'pending' },
      { id: '3', name: 'Security audit', command: 'audit code for security vulnerabilities', status: 'pending' },
      { id: '4', name: 'Performance review', command: 'analyze code for performance optimizations', status: 'pending' },
    ]
  },
  {
    id: 'repo-summary',
    name: 'Repository Summary',
    description: 'Generate comprehensive repository documentation',
    status: 'idle',
    steps: [
      { id: '1', name: 'Scan file structure', command: 'analyze repository file structure', status: 'pending' },
      { id: '2', name: 'Identify technologies', command: 'identify technologies and frameworks used', status: 'pending' },
      { id: '3', name: 'Extract key features', command: 'extract main features and functionality', status: 'pending' },
      { id: '4', name: 'Generate README', command: 'generate comprehensive README documentation', status: 'pending' },
    ]
  },
  {
    id: 'app-generator',
    name: 'App Generator',
    description: 'Generate a complete application from requirements',
    status: 'idle',
    steps: [
      { id: '1', name: 'Plan architecture', command: 'plan application architecture and structure', status: 'pending' },
      { id: '2', name: 'Generate components', command: 'generate core application components', status: 'pending' },
      { id: '3', name: 'Setup routing', command: 'implement routing and navigation', status: 'pending' },
      { id: '4', name: 'Add styling', command: 'apply consistent styling and themes', status: 'pending' },
    ]
  }
]

export default function WorkflowRunner() {
  const [workflows, setWorkflows] = useState<Workflow[]>(SAMPLE_WORKFLOWS)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null)

  const runWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    setActiveWorkflow(workflowId)
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'running' } : w
    ))

    // Simulate workflow execution
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]
      
      // Update step to running
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? {
          ...w,
          steps: w.steps.map(s => 
            s.id === step.id ? { ...s, status: 'running' } : s
          )
        } : w
      ))

      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Complete step
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? {
          ...w,
          steps: w.steps.map(s => 
            s.id === step.id ? { 
              ...s, 
              status: 'completed',
              output: `Step completed: ${step.name}`
            } : s
          )
        } : w
      ))
    }

    // Complete workflow
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'completed' } : w
    ))
    setActiveWorkflow(null)
  }

  const stopWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { 
        ...w, 
        status: 'failed',
        steps: w.steps.map(s => 
          s.status === 'running' ? { ...s, status: 'failed' } : s
        )
      } : w
    ))
    setActiveWorkflow(null)
  }

  const resetWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { 
        ...w, 
        status: 'idle',
        steps: w.steps.map(s => ({ ...s, status: 'pending', output: undefined }))
      } : w
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="animate-spin" size={16} />
      case 'completed': return <CheckCircle className="text-green-500" size={16} />
      case 'failed': return <XCircle className="text-red-500" size={16} />
      default: return <div className="w-4 h-4 rounded-full bg-gray-600" />
    }
  }

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      {/* Workflow Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-80 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText size={18} />
                Workflows
              </h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {workflows.map(workflow => (
                <div key={workflow.id} className="p-4 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{workflow.name}</h4>
                      <p className="text-gray-400 text-sm">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      {workflow.status === 'idle' && (
                        <button
                          onClick={() => runWorkflow(workflow.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Play size={14} className="text-green-500" />
                        </button>
                      )}
                      {workflow.status === 'running' && (
                        <button
                          onClick={() => stopWorkflow(workflow.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Square size={14} className="text-red-500" />
                        </button>
                      )}
                      {(workflow.status === 'completed' || workflow.status === 'failed') && (
                        <button
                          onClick={() => resetWorkflow(workflow.id)}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 text-xs"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Steps */}
                  <div className="space-y-1">
                    {workflow.steps.map(step => (
                      <div key={step.id} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(step.status)}
                        <span className={
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'running' ? 'text-blue-400' :
                          step.status === 'failed' ? 'text-red-400' :
                          'text-gray-400'
                        }>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FileText size={20} />
      </motion.button>
    </motion.div>
  )
}