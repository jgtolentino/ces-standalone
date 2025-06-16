'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Copy, Check } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatSidebarProps {
  currentCode: string
  currentFile: string
  onCodeUpdate: (code: string) => void
}

export default function ChatSidebar({ currentCode, currentFile, onCodeUpdate }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            currentCode,
            currentFile
          }
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      const assistantId = Date.now().toString() + '-assistant'
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        assistantMessage += chunk

        setMessages(prev => prev.map(msg =>
          msg.id === assistantId ? { ...msg, content: assistantMessage } : msg
        ))
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```[\s\S]*?```/g
    const codeBlocks = content.match(codeBlockRegex) || []
    return codeBlocks.map(block => block.replace(/```\w*\n?/, '').replace(/```$/, ''))
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        <p className="text-sm text-gray-400 mt-1">Powered by Devstral (Local)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              {message.role === 'assistant' && extractCodeBlocks(message.content).length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <button
                    onClick={() => {
                      const codeBlocks = extractCodeBlocks(message.content)
                      if (codeBlocks.length > 0) {
                        onCodeUpdate(codeBlocks[0])
                        copyToClipboard(codeBlocks[0], message.id)
                      }
                    }}
                    className="flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                  >
                    {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                    Apply to Editor
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-pulse">●</div>
                <div className="animate-pulse animation-delay-200">●</div>
                <div className="animate-pulse animation-delay-400">●</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}