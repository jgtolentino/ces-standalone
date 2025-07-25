import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface FilterState {
  campaign: string[]
  format: string[]
  creative_phase: string[]
  region: string[]
  segment: string[]
  date_range: {
    start: Date | null
    end: Date | null
  }
}

export interface CESStore extends FilterState {
  // Filter actions
  setCampaign: (campaigns: string[]) => void
  setFormat: (formats: string[]) => void
  setCreativePhase: (phases: string[]) => void
  setRegion: (regions: string[]) => void
  setSegment: (segments: string[]) => void
  setDateRange: (range: { start: Date | null; end: Date | null }) => void
  clearFilters: () => void
  
  // CES data
  currentScore: number | null
  isLoading: boolean
  campaigns: any[]
  insights: any[]
  
  // CES actions
  setCurrentScore: (score: number) => void
  setLoading: (loading: boolean) => void
  setCampaigns: (campaigns: any[]) => void
  setInsights: (insights: any[]) => void
  
  // Prompt/Chat state
  chatMessages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  promptHistory: Array<{
    id: string
    prompt: string
    response: string
    timestamp: Date
  }>
  
  // Chat actions
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void
  addPromptHistory: (prompt: string, response: string) => void
  clearChat: () => void
}

const initialFilters: FilterState = {
  campaign: [],
  format: [],
  creative_phase: [],
  region: [],
  segment: [],
  date_range: {
    start: null,
    end: null
  }
}

export const useCESStore = create<CESStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialFilters,
      currentScore: null,
      isLoading: false,
      campaigns: [],
      insights: [],
      chatMessages: [],
      promptHistory: [],
      
      // Filter actions
      setCampaign: (campaigns) => set({ campaign: campaigns }),
      setFormat: (formats) => set({ format: formats }),
      setCreativePhase: (phases) => set({ creative_phase: phases }),
      setRegion: (regions) => set({ region: regions }),
      setSegment: (segments) => set({ segment: segments }),
      setDateRange: (range) => set({ date_range: range }),
      clearFilters: () => set(initialFilters),
      
      // CES actions
      setCurrentScore: (score) => set({ currentScore: score }),
      setLoading: (loading) => set({ isLoading: loading }),
      setCampaigns: (campaigns) => set({ campaigns }),
      setInsights: (insights) => set({ insights }),
      
      // Chat actions
      addChatMessage: (message) => {
        const newMessage = {
          id: crypto.randomUUID(),
          ...message,
          timestamp: new Date()
        }
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage]
        }))
      },
      
      addPromptHistory: (prompt, response) => {
        const newEntry = {
          id: crypto.randomUUID(),
          prompt,
          response,
          timestamp: new Date()
        }
        set(state => ({
          promptHistory: [newEntry, ...state.promptHistory]
        }))
      },
      
      clearChat: () => set({ chatMessages: [] })
    }),
    {
      name: 'ces-store'
    }
  )
)