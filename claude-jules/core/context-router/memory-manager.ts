import * as fs from 'fs/promises'
import * as path from 'path'

export interface MemoryEntry {
  id: string
  timestamp: number
  type: 'conversation' | 'task' | 'code' | 'workflow'
  content: string
  metadata: Record<string, any>
  embedding?: number[]
}

export interface ContextEntry {
  id: string
  content: string
  relevanceScore: number
  timestamp: number
}

export class MemoryManager {
  private memoryFile: string
  private memory: MemoryEntry[] = []
  private maxMemorySize: number = 1000

  constructor(memoryDir: string = './memory') {
    this.memoryFile = path.join(memoryDir, 'vector-store.json')
    this.loadMemory()
  }

  async loadMemory(): Promise<void> {
    try {
      const data = await fs.readFile(this.memoryFile, 'utf-8')
      this.memory = JSON.parse(data)
    } catch (error) {
      // Memory file doesn't exist yet, start with empty memory
      this.memory = []
    }
  }

  async saveMemory(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.memoryFile), { recursive: true })
      await fs.writeFile(this.memoryFile, JSON.stringify(this.memory, null, 2))
    } catch (error) {
      console.error('Failed to save memory:', error)
    }
  }

  async addMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const memoryEntry: MemoryEntry = {
      ...entry,
      id,
      timestamp: Date.now()
    }

    this.memory.push(memoryEntry)

    // Trim memory if it gets too large
    if (this.memory.length > this.maxMemorySize) {
      this.memory = this.memory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxMemorySize)
    }

    await this.saveMemory()
    return id
  }

  async getRelevantContext(query: string, limit: number = 5): Promise<ContextEntry[]> {
    // Simple text-based relevance scoring
    // In a real implementation, you'd use embeddings and vector similarity
    const queryWords = query.toLowerCase().split(/\s+/)
    
    const scored = this.memory.map(entry => {
      const content = entry.content.toLowerCase()
      let score = 0
      
      // Count word matches
      queryWords.forEach(word => {
        const matches = (content.match(new RegExp(word, 'g')) || []).length
        score += matches
      })
      
      // Boost recent entries slightly
      const ageBonus = Math.max(0, 1 - (Date.now() - entry.timestamp) / (7 * 24 * 60 * 60 * 1000)) * 0.1
      score += ageBonus
      
      return {
        id: entry.id,
        content: entry.content,
        relevanceScore: score,
        timestamp: entry.timestamp
      }
    })

    return scored
      .filter(entry => entry.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  async getMemoryByType(type: MemoryEntry['type'], limit: number = 10): Promise<MemoryEntry[]> {
    return this.memory
      .filter(entry => entry.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  async getRecentMemory(limit: number = 10): Promise<MemoryEntry[]> {
    return this.memory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  async searchMemory(query: string, type?: MemoryEntry['type']): Promise<MemoryEntry[]> {
    const queryLower = query.toLowerCase()
    
    return this.memory
      .filter(entry => {
        const matchesType = !type || entry.type === type
        const matchesContent = entry.content.toLowerCase().includes(queryLower)
        return matchesType && matchesContent
      })
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  async deleteMemory(id: string): Promise<boolean> {
    const initialLength = this.memory.length
    this.memory = this.memory.filter(entry => entry.id !== id)
    
    if (this.memory.length < initialLength) {
      await this.saveMemory()
      return true
    }
    
    return false
  }

  async clearMemory(): Promise<void> {
    this.memory = []
    await this.saveMemory()
  }

  getMemoryStats(): {
    totalEntries: number
    byType: Record<string, number>
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const byType: Record<string, number> = {}
    let oldest = null
    let newest = null

    for (const entry of this.memory) {
      byType[entry.type] = (byType[entry.type] || 0) + 1
      
      if (!oldest || entry.timestamp < oldest) {
        oldest = entry.timestamp
      }
      
      if (!newest || entry.timestamp > newest) {
        newest = entry.timestamp
      }
    }

    return {
      totalEntries: this.memory.length,
      byType,
      oldestEntry: oldest,
      newestEntry: newest
    }
  }
}