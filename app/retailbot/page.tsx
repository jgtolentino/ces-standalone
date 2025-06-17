'use client'

import { useState } from 'react'

export default function RetailBotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m RetailBot, your AI assistant for retail analytics. I can help you analyze metrics, validate data insights, and answer questions about your dashboard. What would you like to explore?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/retailbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          context: 'scout_analytics_v3.1.0'
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your request.'
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m currently unavailable. Please try again later.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: 'Validate Revenue Metrics', query: 'Validate our current revenue metrics and flag any anomalies' },
    { label: 'Regional Performance', query: 'What are the top performing regions this month?' },
    { label: 'Product Category Analysis', query: 'Which product categories are trending up or down?' },
    { label: 'Customer Insights', query: 'What insights can you derive from our customer behavior?' }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🤖</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RetailBot</h1>
            <p className="text-gray-600">AI-powered retail analytics assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-96">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Chat with RetailBot</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me about your retail analytics..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(action.query)
                    sendMessage()
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">RetailBot Capabilities</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Metric validation & anomaly detection</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Data insight explanation</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Performance trend analysis</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Regional & category comparisons</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Contextual recommendations</span>
              </div>
            </div>
          </div>

          {/* Learning Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">LearnBot Tutorials</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">📚</span>
                <span className="text-sm text-gray-700">Dashboard Navigation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">📊</span>
                <span className="text-sm text-gray-700">Reading Analytics Charts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">🔍</span>
                <span className="text-sm text-gray-700">Using Filters Effectively</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">🧭</span>
                <span className="text-sm text-gray-700">Why This AI is Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}