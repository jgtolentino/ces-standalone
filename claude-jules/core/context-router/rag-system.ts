import { MemoryManager, ContextEntry } from './memory-manager'
import { CodebaseAnalyzer, ProjectAnalysis } from './codebase-analyzer'

export interface RAGContext {
  query: string
  relevantMemory: ContextEntry[]
  codebaseContext: string
  recentTasks: any[]
  systemPrompt: string
}

export interface RAGResult {
  context: RAGContext
  enhancedPrompt: string
  confidence: number
}

export class RAGSystem {
  private memoryManager: MemoryManager
  private codebaseAnalyzer: CodebaseAnalyzer
  private projectAnalysis?: ProjectAnalysis

  constructor(memoryDir: string = './memory') {
    this.memoryManager = new MemoryManager(memoryDir)
    this.codebaseAnalyzer = new CodebaseAnalyzer()
  }

  async initializeProject(projectPath: string): Promise<void> {
    console.log('Analyzing project structure...')
    this.projectAnalysis = await this.codebaseAnalyzer.analyzeProject(projectPath)
    
    // Store project analysis in memory
    await this.memoryManager.addMemory({
      type: 'code',
      content: `Project Analysis: ${this.projectAnalysis.summary}`,
      metadata: {
        languages: this.projectAnalysis.languages,
        dependencies: this.projectAnalysis.dependencies,
        totalLines: this.projectAnalysis.totalLines,
        fileCount: this.projectAnalysis.files.length
      }
    })
  }

  async generateContext(query: string, options: {
    includeMemory?: boolean
    includeCodebase?: boolean
    maxMemoryItems?: number
  } = {}): Promise<RAGContext> {
    const {
      includeMemory = true,
      includeCodebase = true,
      maxMemoryItems = 5
    } = options

    // Get relevant memory
    const relevantMemory = includeMemory ? 
      await this.memoryManager.getRelevantContext(query, maxMemoryItems) : []

    // Get codebase context
    const codebaseContext = includeCodebase && this.projectAnalysis ? 
      this.generateCodebaseContext(query) : ''

    // Get recent tasks
    const recentTasks = await this.memoryManager.getMemoryByType('task', 3)

    // Generate system prompt
    const systemPrompt = this.generateSystemPrompt(query, codebaseContext, relevantMemory)

    return {
      query,
      relevantMemory,
      codebaseContext,
      recentTasks,
      systemPrompt
    }
  }

  async enhancePrompt(query: string, context?: RAGContext): Promise<RAGResult> {
    const ragContext = context || await this.generateContext(query)
    
    let enhancedPrompt = ragContext.systemPrompt + '\n\n'
    
    // Add memory context
    if (ragContext.relevantMemory.length > 0) {
      enhancedPrompt += 'Relevant previous context:\n'
      ragContext.relevantMemory.forEach((entry, i) => {
        enhancedPrompt += `${i + 1}. ${entry.content}\n`
      })
      enhancedPrompt += '\n'
    }

    // Add codebase context
    if (ragContext.codebaseContext) {
      enhancedPrompt += 'Current codebase context:\n'
      enhancedPrompt += ragContext.codebaseContext + '\n\n'
    }

    // Add recent tasks context
    if (ragContext.recentTasks.length > 0) {
      enhancedPrompt += 'Recent tasks:\n'
      ragContext.recentTasks.forEach((task, i) => {
        enhancedPrompt += `${i + 1}. ${task.content}\n`
      })
      enhancedPrompt += '\n'
    }

    // Add the actual query
    enhancedPrompt += `User Query: ${query}`

    // Calculate confidence based on available context
    const confidence = this.calculateConfidence(ragContext)

    return {
      context: ragContext,
      enhancedPrompt,
      confidence
    }
  }

  async addInteraction(query: string, response: string, metadata: any = {}): Promise<void> {
    await this.memoryManager.addMemory({
      type: 'conversation',
      content: `Q: ${query}\nA: ${response}`,
      metadata: {
        ...metadata,
        query,
        response
      }
    })
  }

  async addTaskMemory(taskDescription: string, result: string, metadata: any = {}): Promise<void> {
    await this.memoryManager.addMemory({
      type: 'task',
      content: `Task: ${taskDescription}\nResult: ${result}`,
      metadata: {
        ...metadata,
        taskDescription,
        result
      }
    })
  }

  async addCodeMemory(code: string, description: string, metadata: any = {}): Promise<void> {
    await this.memoryManager.addMemory({
      type: 'code',
      content: `${description}\n\nCode:\n${code}`,
      metadata: {
        ...metadata,
        description,
        codeLength: code.length
      }
    })
  }

  private generateCodebaseContext(query: string): string {
    if (!this.projectAnalysis) return ''

    let context = `Project: ${this.projectAnalysis.summary}\n\n`
    
    // Add relevant file information based on query
    const queryLower = query.toLowerCase()
    const relevantFiles = this.projectAnalysis.files.filter(file => 
      file.name.toLowerCase().includes(queryLower) || 
      file.path.toLowerCase().includes(queryLower)
    ).slice(0, 5)

    if (relevantFiles.length > 0) {
      context += 'Relevant files:\n'
      relevantFiles.forEach(file => {
        context += `- ${file.path} (${file.language})\n`
      })
      context += '\n'
    }

    // Add technology stack
    const languages = Object.keys(this.projectAnalysis.languages)
    if (languages.length > 0) {
      context += `Technologies: ${languages.join(', ')}\n`
    }

    // Add key dependencies
    if (this.projectAnalysis.dependencies.length > 0) {
      context += `Dependencies: ${this.projectAnalysis.dependencies.slice(0, 5).join(', ')}\n`
    }

    return context
  }

  private generateSystemPrompt(query: string, codebaseContext: string, memory: ContextEntry[]): string {
    let prompt = 'You are Claude-Jules, an advanced AI coding assistant with access to project context and memory.\n\n'
    
    if (codebaseContext) {
      prompt += 'You have knowledge of the current project structure and can reference files, dependencies, and technologies in use.\n'
    }
    
    if (memory.length > 0) {
      prompt += 'You have access to previous conversations and can build upon past context.\n'
    }
    
    prompt += `
Key capabilities:
- Code generation and modification
- Bug fixing and optimization
- Project analysis and documentation
- Task planning and execution
- Context-aware responses

Always provide:
- Clear, actionable responses
- Code examples when relevant
- Step-by-step instructions for complex tasks
- References to project context when applicable

Be concise but comprehensive. Focus on practical solutions.`

    return prompt
  }

  private calculateConfidence(context: RAGContext): number {
    let confidence = 0.5 // Base confidence

    // Boost confidence based on available context
    if (context.relevantMemory.length > 0) {
      confidence += 0.2 * Math.min(context.relevantMemory.length / 5, 1)
    }

    if (context.codebaseContext) {
      confidence += 0.2
    }

    if (context.recentTasks.length > 0) {
      confidence += 0.1
    }

    // Boost based on memory relevance scores
    if (context.relevantMemory.length > 0) {
      const avgRelevance = context.relevantMemory.reduce((sum, entry) => 
        sum + entry.relevanceScore, 0) / context.relevantMemory.length
      confidence += 0.1 * Math.min(avgRelevance / 10, 1)
    }

    return Math.min(confidence, 1.0)
  }

  async getMemoryStats(): Promise<any> {
    return this.memoryManager.getMemoryStats()
  }

  async searchMemory(query: string, type?: string): Promise<any[]> {
    return this.memoryManager.searchMemory(query, type as any)
  }

  async clearMemory(): Promise<void> {
    return this.memoryManager.clearMemory()
  }

  getProjectAnalysis(): ProjectAnalysis | undefined {
    return this.projectAnalysis
  }
}