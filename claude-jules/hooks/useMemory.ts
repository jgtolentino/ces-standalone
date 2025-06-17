import { useState, useEffect, useCallback } from 'react'
import { MemoryManager, MemoryEntry, ContextEntry } from '../core/context-router/memory-manager'

interface MemoryState {
  memoryManager: MemoryManager | null
  recentMemory: MemoryEntry[]
  relevantContext: ContextEntry[]
  stats: any
  isLoading: boolean
  error: string | null
}

interface MemoryFilter {
  type?: MemoryEntry['type']
  limit?: number
  timeRange?: {
    start: number
    end: number
  }
}

export function useMemory(memoryDir?: string) {
  const [state, setState] = useState<MemoryState>({
    memoryManager: null,
    recentMemory: [],
    relevantContext: [],
    stats: null,
    isLoading: false,
    error: null
  })

  // Initialize memory manager
  useEffect(() => {
    const initializeMemory = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))
        
        const manager = new MemoryManager(memoryDir)
        await manager.loadMemory()
        
        const recentMemory = await manager.getRecentMemory(10)
        const stats = manager.getMemoryStats()
        
        setState(prev => ({
          ...prev,
          memoryManager: manager,
          recentMemory,
          stats,
          isLoading: false
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize memory',
          isLoading: false
        }))
      }
    }

    initializeMemory()
  }, [memoryDir])

  // Add memory entry
  const addMemory = useCallback(async (
    entry: Omit<MemoryEntry, 'id' | 'timestamp'>
  ): Promise<string | null> => {
    if (!state.memoryManager) return null

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const id = await state.memoryManager.addMemory(entry)
      
      // Refresh recent memory and stats
      const recentMemory = await state.memoryManager.getRecentMemory(10)
      const stats = state.memoryManager.getMemoryStats()
      
      setState(prev => ({
        ...prev,
        recentMemory,
        stats,
        isLoading: false
      }))
      
      return id
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add memory',
        isLoading: false
      }))
      return null
    }
  }, [state.memoryManager])

  // Add conversation memory
  const addConversation = useCallback(async (
    query: string, 
    response: string, 
    metadata?: Record<string, any>
  ): Promise<string | null> => {
    return await addMemory({
      type: 'conversation',
      content: `Q: ${query}\nA: ${response}`,
      metadata: { query, response, ...metadata }
    })
  }, [addMemory])

  // Add task memory
  const addTask = useCallback(async (
    taskDescription: string, 
    result: string, 
    metadata?: Record<string, any>
  ): Promise<string | null> => {
    return await addMemory({
      type: 'task',
      content: `Task: ${taskDescription}\nResult: ${result}`,
      metadata: { taskDescription, result, ...metadata }
    })
  }, [addMemory])

  // Add code memory
  const addCode = useCallback(async (
    code: string, 
    description: string, 
    metadata?: Record<string, any>
  ): Promise<string | null> => {
    return await addMemory({
      type: 'code',
      content: `${description}\n\nCode:\n${code}`,
      metadata: { description, codeLength: code.length, ...metadata }
    })
  }, [addMemory])

  // Add workflow memory
  const addWorkflow = useCallback(async (
    workflowName: string, 
    steps: string[], 
    result: string, 
    metadata?: Record<string, any>
  ): Promise<string | null> => {
    return await addMemory({
      type: 'workflow',
      content: `Workflow: ${workflowName}\nSteps: ${steps.join(', ')}\nResult: ${result}`,
      metadata: { workflowName, steps, result, ...metadata }
    })
  }, [addMemory])

  // Get relevant context for a query
  const getRelevantContext = useCallback(async (
    query: string, 
    limit: number = 5
  ): Promise<ContextEntry[]> => {
    if (!state.memoryManager) return []

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const context = await state.memoryManager.getRelevantContext(query, limit)
      
      setState(prev => ({
        ...prev,
        relevantContext: context,
        isLoading: false
      }))
      
      return context
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get relevant context',
        isLoading: false
      }))
      return []
    }
  }, [state.memoryManager])

  // Search memory
  const searchMemory = useCallback(async (
    query: string, 
    filter?: MemoryFilter
  ): Promise<MemoryEntry[]> => {
    if (!state.memoryManager) return []

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      let results = await state.memoryManager.searchMemory(query, filter?.type)
      
      // Apply additional filters
      if (filter?.timeRange) {
        results = results.filter(entry => 
          entry.timestamp >= filter.timeRange!.start && 
          entry.timestamp <= filter.timeRange!.end
        )
      }
      
      if (filter?.limit) {
        results = results.slice(0, filter.limit)
      }
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      return results
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search memory',
        isLoading: false
      }))
      return []
    }
  }, [state.memoryManager])

  // Get memory by type
  const getMemoryByType = useCallback(async (
    type: MemoryEntry['type'], 
    limit: number = 10
  ): Promise<MemoryEntry[]> => {
    if (!state.memoryManager) return []

    try {
      return await state.memoryManager.getMemoryByType(type, limit)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get memory by type'
      }))
      return []
    }
  }, [state.memoryManager])

  // Delete memory entry
  const deleteMemory = useCallback(async (id: string): Promise<boolean> => {
    if (!state.memoryManager) return false

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const success = await state.memoryManager.deleteMemory(id)
      
      if (success) {
        // Refresh memory data
        const recentMemory = await state.memoryManager.getRecentMemory(10)
        const stats = state.memoryManager.getMemoryStats()
        
        setState(prev => ({
          ...prev,
          recentMemory,
          stats,
          isLoading: false
        }))
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
      
      return success
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete memory',
        isLoading: false
      }))
      return false
    }
  }, [state.memoryManager])

  // Clear all memory
  const clearAllMemory = useCallback(async (): Promise<void> => {
    if (!state.memoryManager) return

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      await state.memoryManager.clearMemory()
      
      setState(prev => ({
        ...prev,
        recentMemory: [],
        relevantContext: [],
        stats: { totalEntries: 0, byType: {}, oldestEntry: null, newestEntry: null },
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear memory',
        isLoading: false
      }))
    }
  }, [state.memoryManager])

  // Refresh memory stats
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!state.memoryManager) return

    try {
      const stats = state.memoryManager.getMemoryStats()
      const recentMemory = await state.memoryManager.getRecentMemory(10)
      
      setState(prev => ({
        ...prev,
        stats,
        recentMemory
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh stats'
      }))
    }
  }, [state.memoryManager])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Memory insights
  const getInsights = useCallback(() => {
    if (!state.stats) return null

    const insights = {
      totalMemories: state.stats.totalEntries,
      mostActiveType: Object.keys(state.stats.byType).reduce((a, b) => 
        (state.stats.byType[a] || 0) > (state.stats.byType[b] || 0) ? a : b, 
        Object.keys(state.stats.byType)[0]
      ),
      memoryAge: state.stats.oldestEntry ? 
        Math.floor((Date.now() - state.stats.oldestEntry) / (1000 * 60 * 60 * 24)) : 0,
      recentActivity: state.recentMemory.length,
      typeDistribution: state.stats.byType
    }

    return insights
  }, [state.stats, state.recentMemory])

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    recentMemory: state.recentMemory,
    relevantContext: state.relevantContext,
    stats: state.stats,
    
    // Core operations
    addMemory,
    getRelevantContext,
    searchMemory,
    deleteMemory,
    clearAllMemory,
    
    // Specialized add operations
    addConversation,
    addTask,
    addCode,
    addWorkflow,
    
    // Query operations
    getMemoryByType,
    
    // Utility operations
    refreshStats,
    clearError,
    getInsights,
    
    // Direct manager access
    memoryManager: state.memoryManager
  }
}