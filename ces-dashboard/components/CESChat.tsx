import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bot, User, Copy, Download, Trash2 } from 'lucide-react'
import { useCESStore } from '../lib/store'
import { cn } from '../lib/utils'

interface CESChatProps {
  className?: string
  typing?: boolean
}

export function CESChat({ className, typing = false }: CESChatProps) {
  const { chatMessages, clearChat } = useCESStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, typing])

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const exportConversation = () => {
    const conversation = chatMessages
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')
    
    const blob = new Blob([conversation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ces-conversation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <span>CES Assistant</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportConversation}
              disabled={chatMessages.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={chatMessages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {chatMessages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Start a conversation with CES</p>
              <p className="text-xs mt-1">Ask about campaign performance, creative improvements, or insights</p>
            </div>
          )}

          {chatMessages.map((message: any) => (
            <div
              key={message.id}
              className={cn(
                'flex space-x-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'flex space-x-3 max-w-[80%]',
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={cn(
                    'rounded-lg px-4 py-2 relative group',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line: string, index: number) => (
                      <p key={index} className="mb-1 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyMessage(message.content)}
                    className={cn(
                      'absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0',
                      message.role === 'user' ? 'text-white hover:bg-blue-600' : 'text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>

                  <div
                    className={cn(
                      'text-xs mt-1 opacity-70',
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex space-x-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {chatMessages.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{chatMessages.length} messages</span>
              <Badge variant="secondary" className="text-xs">
                GPT-4 Powered
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}