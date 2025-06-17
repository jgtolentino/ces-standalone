import { useState, useCallback } from 'react'
import { JulesAgent, JulesTask } from '../agents/jules'
import { CoderAgent, CodeTask } from '../agents/coder'
import { OperatorAgent } from '../agents/operator'

interface AgentTaskState {
  tasks: JulesTask[]
  codeTasks: CodeTask[]
  isProcessing: boolean
  error: string | null
}

interface TaskResult {
  taskId: string
  result: string
  success: boolean
  error?: string
}

export function useAgentTasks() {
  const [state, setState] = useState<AgentTaskState>({
    tasks: [],
    codeTasks: [],
    isProcessing: false,
    error: null
  })

  // Initialize agents
  const [agents] = useState(() => ({
    jules: new JulesAgent(),
    coder: new CoderAgent(),
    operator: new OperatorAgent()
  }))

  // Plan tasks with Jules
  const planTasks = useCallback(async (userInput: string, context?: any): Promise<JulesTask[]> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }))
      
      const newTasks = await agents.jules.planTask(userInput, context)
      
      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, ...newTasks],
        isProcessing: false
      }))
      
      return newTasks
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to plan tasks',
        isProcessing: false
      }))
      return []
    }
  }, [agents.jules])

  // Execute a Jules task
  const executeTask = useCallback(async (task: JulesTask, context?: any): Promise<TaskResult> => {
    try {
      // Update task status to running
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === task.id ? { ...t, status: 'running' } : t
        )
      }))

      const result = await agents.jules.executeTask(task, context)
      
      // Update task status to completed
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === task.id ? { ...t, status: 'completed' } : t
        )
      }))

      return {
        taskId: task.id,
        result,
        success: true
      }
    } catch (error) {
      // Update task status to failed
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === task.id ? { ...t, status: 'failed' } : t
        )
      }))

      return {
        taskId: task.id,
        result: '',
        success: false,
        error: error instanceof Error ? error.message : 'Task execution failed'
      }
    }
  }, [agents.jules])

  // Execute a code task with Coder agent
  const executeCodeTask = useCallback(async (task: CodeTask): Promise<TaskResult> => {
    try {
      // Update task status to running
      setState(prev => ({
        ...prev,
        codeTasks: prev.codeTasks.map(t => 
          t.id === task.id ? { ...t, status: 'running' } : t
        )
      }))

      const result = await agents.coder.executeCodeTask(task)
      
      // Update task with result and completed status
      setState(prev => ({
        ...prev,
        codeTasks: prev.codeTasks.map(t => 
          t.id === task.id ? { ...t, status: 'completed', result } : t
        )
      }))

      return {
        taskId: task.id,
        result: result.code,
        success: true
      }
    } catch (error) {
      // Update task status to failed
      setState(prev => ({
        ...prev,
        codeTasks: prev.codeTasks.map(t => 
          t.id === task.id ? { ...t, status: 'failed' } : t
        )
      }))

      return {
        taskId: task.id,
        result: '',
        success: false,
        error: error instanceof Error ? error.message : 'Code task execution failed'
      }
    }
  }, [agents.coder])

  // Add a code task
  const addCodeTask = useCallback((task: Omit<CodeTask, 'id' | 'status'>): string => {
    const id = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const codeTask: CodeTask = {
      ...task,
      id,
      status: 'pending'
    }

    setState(prev => ({
      ...prev,
      codeTasks: [...prev.codeTasks, codeTask]
    }))

    return id
  }, [])

  // Execute shell command with Operator
  const executeShellCommand = useCallback(async (command: string, options?: any) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }))
      
      const result = await agents.operator.executeShell(command, options)
      
      setState(prev => ({ ...prev, isProcessing: false }))
      
      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Shell command failed',
        isProcessing: false
      }))
      return null
    }
  }, [agents.operator])

  // Git operations
  const gitOperations = useCallback(() => ({
    status: () => agents.operator.gitStatus(),
    add: (files?: string[]) => agents.operator.gitAdd(files),
    commit: (message: string) => agents.operator.gitCommit(message),
    push: (remote?: string, branch?: string) => agents.operator.gitPush(remote, branch),
    pull: (remote?: string, branch?: string) => agents.operator.gitPull(remote, branch),
    createBranch: (name: string, checkout?: boolean) => agents.operator.createBranch(name, checkout)
  }), [agents.operator])

  // File operations
  const fileOperations = useCallback(() => ({
    read: (path: string) => agents.operator.readFile(path),
    write: (path: string, content: string) => agents.operator.writeFile(path, content),
    exists: (path: string) => agents.operator.fileExists(path),
    list: (directory?: string, recursive?: boolean) => agents.operator.listFiles(directory, recursive),
    createDir: (path: string) => agents.operator.createDirectory(path)
  }), [agents.operator])

  // Quick code operations
  const quickCodeOps = useCallback(() => ({
    fix: (code: string, language?: string) => agents.coder.quickFix(code, language),
    optimize: (code: string, language?: string) => agents.coder.optimize(code, language),
    document: (code: string, language?: string) => agents.coder.addDocumentation(code, language),
    generateTests: (code: string, language?: string) => agents.coder.generateTests(code, language),
    convert: (code: string, fromLang: string, toLang: string) => 
      agents.coder.convertLanguage(code, fromLang, toLang)
  }), [agents.coder])

  // Remove task
  const removeTask = useCallback((taskId: string, type: 'jules' | 'code' = 'jules') => {
    setState(prev => ({
      ...prev,
      tasks: type === 'jules' ? prev.tasks.filter(t => t.id !== taskId) : prev.tasks,
      codeTasks: type === 'code' ? prev.codeTasks.filter(t => t.id !== taskId) : prev.codeTasks
    }))
  }, [])

  // Clear all tasks
  const clearAllTasks = useCallback(() => {
    setState(prev => ({
      ...prev,
      tasks: [],
      codeTasks: []
    }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Get task statistics
  const getTaskStats = useCallback(() => {
    const allTasks = [...state.tasks, ...state.codeTasks]
    const stats = {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      running: allTasks.filter(t => t.status === 'running').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      failed: allTasks.filter(t => t.status === 'failed').length
    }
    return stats
  }, [state.tasks, state.codeTasks])

  return {
    // State
    tasks: state.tasks,
    codeTasks: state.codeTasks,
    isProcessing: state.isProcessing,
    error: state.error,
    
    // Jules Agent Actions
    planTasks,
    executeTask,
    
    // Coder Agent Actions
    addCodeTask,
    executeCodeTask,
    quickCodeOps: quickCodeOps(),
    
    // Operator Agent Actions
    executeShellCommand,
    gitOperations: gitOperations(),
    fileOperations: fileOperations(),
    
    // Task Management
    removeTask,
    clearAllTasks,
    clearError,
    getTaskStats,
    
    // Direct agent access
    agents
  }
}