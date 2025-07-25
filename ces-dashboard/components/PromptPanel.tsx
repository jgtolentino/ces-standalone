import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Send, Mic, MicOff, Sparkles, History } from 'lucide-react'
import { useCESStore } from '../lib/store'

interface PromptPanelProps {
  onSubmit: (prompt: string) => Promise<void>
  placeholder?: string
  className?: string
}

const PROMPT_TEMPLATES = [
  {
    id: 'optimize-gen-z',
    name: 'Optimize for Gen Z',
    prompt: 'Analyze this campaign for Gen Z audience appeal and suggest improvements for higher engagement',
    category: 'optimization'
  },
  {
    id: 'emotional-impact',
    name: 'Emotional Impact',
    prompt: 'Evaluate the emotional impact of this creative and recommend enhancements',
    category: 'analysis'
  },
  {
    id: 'cross-campaign',
    name: 'Cross-Campaign Analysis',
    prompt: 'Compare this campaign against our top performers and identify key differences',
    category: 'comparison'
  },
  {
    id: 'predict-performance',
    name: 'Predict Performance',
    prompt: 'Based on creative features, predict the likely performance of this campaign',
    category: 'prediction'
  }
]

export function PromptPanel({ onSubmit, placeholder, className }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { promptHistory } = useCESStore()

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(prompt)
      setPrompt('')
    } catch (error) {
      console.error('Failed to submit prompt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const insertTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt)
    setShowTemplates(false)
    textareaRef.current?.focus()
  }

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in your browser')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setPrompt(prev => prev + (prev ? ' ' : '') + transcript)
    }

    recognition.start()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Ask CES</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceInput}
              disabled={isListening}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showTemplates && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Quick prompts:</p>
            <div className="grid grid-cols-2 gap-2">
              {PROMPT_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(template)}
                  className="justify-start text-left h-auto p-2"
                >
                  <div>
                    <div className="font-medium text-xs">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.prompt}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask CES about campaign effectiveness, creative improvements, or performance predictions..."}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isListening && (
                <Badge variant="secondary" className="animate-pulse">
                  <Mic className="w-3 h-3 mr-1" />
                  Listening...
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                Cmd/Ctrl + Enter to submit
              </span>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="ml-2">Send</span>
            </Button>
          </div>
        </div>

        {promptHistory.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Recent prompts</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {promptHistory.slice(0, 3).map((entry: any) => (
                <Button
                  key={entry.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrompt(entry.prompt)}
                  className="w-full justify-start text-left h-auto p-2"
                >
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {entry.prompt}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}