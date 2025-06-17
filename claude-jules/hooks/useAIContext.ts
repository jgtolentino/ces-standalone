import { useState, useEffect, useCallback } from 'react'
import { RAGSystem, RAGContext, RAGResult } from '../core/context-router/rag-system'

interface AIContextState {
  ragSystem: RAGSystem | null
  isInitialized: boolean
  projectPath: string | null
  context: RAGContext | null
  isLoading: boolean
  error: string | null
}

export function useAIContext(projectPath?: string) {
  const [state, setState] = useState<AIContextState>({
    ragSystem: null,
    isInitialized: false,
    projectPath: null,
    context: null,
    isLoading: false,
    error: null
  })

  // Initialize RAG system
  useEffect(() => {
    const initializeRAG = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        
        const ragSystem = new RAGSystem()
        
        if (projectPath) {
          await ragSystem.initializeProject(projectPath)
        }
        
        setState(prev => ({
          ...prev,
          ragSystem,
          isInitialized: true,
          projectPath: projectPath || null,
          isLoading: false
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize AI context',
          isLoading: false
        }))
      }
    }

    initializeRAG()
  }, [projectPath])

  // Generate context for a query
  const generateContext = useCallback(async (query: string, options?: any): Promise<RAGContext | null> => {
    if (!state.ragSystem) return null

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const context = await state.ragSystem.generateContext(query, options)
      
      setState(prev => ({ 
        ...prev, 
        context, 
        isLoading: false 
      }))
      
      return context
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate context',
        isLoading: false
      }))
      return null
    }
  }, [state.ragSystem])

  // Enhance a prompt with context
  const enhancePrompt = useCallback(async (query: string, context?: RAGContext): Promise<RAGResult | null> => {
    if (!state.ragSystem) return null

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const result = await state.ragSystem.enhancePrompt(query, context)
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enhance prompt',
        isLoading: false
      }))
      return null
    }
  }, [state.ragSystem])

  // Add interaction to memory
  const addInteraction = useCallback(async (query: string, response: string, metadata?: any): Promise<void> => {
    if (!state.ragSystem) return

    try {
      await state.ragSystem.addInteraction(query, response, metadata)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save interaction'
      }))
    }
  }, [state.ragSystem])

  // Add task memory
  const addTaskMemory = useCallback(async (taskDescription: string, result: string, metadata?: any): Promise<void> => {
    if (!state.ragSystem) return

    try {
      await state.ragSystem.addTaskMemory(taskDescription, result, metadata)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save task memory'
      }))
    }
  }, [state.ragSystem])

  // Add code memory
  const addCodeMemory = useCallback(async (code: string, description: string, metadata?: any): Promise<void> => {
    if (!state.ragSystem) return

    try {
      await state.ragSystem.addCodeMemory(code, description, metadata)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save code memory'
      }))
    }
  }, [state.ragSystem])

  // Search memory
  const searchMemory = useCallback(async (query: string, type?: string): Promise<any[]> => {
    if (!state.ragSystem) return []

    try {
      return await state.ragSystem.searchMemory(query, type)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search memory'
      }))
      return []
    }
  }, [state.ragSystem])

  // Get memory stats
  const getMemoryStats = useCallback(async (): Promise<any> => {
    if (!state.ragSystem) return null

    try {
      return await state.ragSystem.getMemoryStats()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get memory stats'
      }))
      return null
    }
  }, [state.ragSystem])

  // Clear memory
  const clearMemory = useCallback(async (): Promise<void> => {
    if (!state.ragSystem) return

    try {
      await state.ragSystem.clearMemory()
      setState(prev => ({ ...prev, context: null }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear memory'
      }))
    }
  }, [state.ragSystem])

  // Get project analysis
  const getProjectAnalysis = useCallback(() => {
    if (!state.ragSystem) return null
    return state.ragSystem.getProjectAnalysis()
  }, [state.ragSystem])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    error: state.error,
    context: state.context,
    projectPath: state.projectPath,
    
    // Actions
    generateContext,
    enhancePrompt,
    addInteraction,
    addTaskMemory,
    addCodeMemory,
    searchMemory,
    getMemoryStats,
    clearMemory,
    getProjectAnalysis,
    clearError,
    
    // RAG System (for advanced usage)
    ragSystem: state.ragSystem
  }
}