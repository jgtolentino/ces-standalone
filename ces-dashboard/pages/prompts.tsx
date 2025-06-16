import React, { useState, useEffect } from 'react'
import { PromptPanel } from '../components/PromptPanel'
import { CESChat } from '../components/CESChat'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Clock, Bookmark, Share, Download } from 'lucide-react'
import { useCESStore } from '../lib/store'

export default function CESPrompts() {
  const { addChatMessage, addPromptHistory, chatMessages } = useCESStore()
  const [isTyping, setIsTyping] = useState(false)
  const [savedPrompts] = useState([
    {
      id: '1',
      name: 'Weekly Performance Review',
      prompt: 'Analyze campaign performance from the last week and highlight top 3 insights with actionable recommendations',
      category: 'analysis',
      lastUsed: new Date('2024-01-15'),
      useCount: 12
    },
    {
      id: '2',
      name: 'A/B Test Insights',
      prompt: 'Compare the two creative variants and explain which elements drive the performance difference',
      category: 'comparison',
      lastUsed: new Date('2024-01-14'),
      useCount: 8
    },
    {
      id: '3',
      name: 'Regional Optimization',
      prompt: 'Identify regional performance patterns and suggest locale-specific creative adaptations',
      category: 'optimization',
      lastUsed: new Date('2024-01-12'),
      useCount: 15
    }
  ])

  const handlePromptSubmit = async (prompt: string) => {
    // Add user message
    addChatMessage({ role: 'user', content: prompt })
    
    // Simulate AI typing
    setIsTyping(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate simulated response based on prompt
    const response = generateCESResponse(prompt)
    
    setIsTyping(false)
    addChatMessage({ role: 'assistant', content: response })
    addPromptHistory(prompt, response)
  }

  const generateCESResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('gen z') || lowerPrompt.includes('young')) {
      return `Based on CES analysis of Gen Z campaigns:

🎯 **Key Findings:**
- Short-form video content (15-30s) performs 34% better than longer formats
- Authentic, user-generated style creative shows 28% higher engagement
- Music-driven content increases brand recall by 42%

🔧 **Optimization Recommendations:**
1. **Visual Style**: Use vertical format (9:16) with dynamic transitions
2. **Messaging**: Lead with benefits, not features - Gen Z responds to value props
3. **Audio**: Trending sounds increase shareability by 23%
4. **CTA Placement**: Position call-to-action in first 5 seconds

📊 **Performance Prediction**: Implementing these changes could improve your CES score from 72.1 to 84.3 (+17% lift)`
    }
    
    if (lowerPrompt.includes('emotional') || lowerPrompt.includes('emotion')) {
      return `Emotional Impact Analysis Complete:

💡 **Current Emotional Profile:**
- Emotional Intensity Score: 78.5/100
- Primary Emotion: Joy (42%), Trust (31%), Anticipation (19%)
- Emotional Arc: Strong opening, weak middle, strong close

🧠 **SHAP Feature Analysis:**
- **Emotional × Cultural Interaction**: +1.27 (highest predictor)
- **Visual Emotional Cues**: +0.34 impact on recall
- **Audio Emotional Elements**: +0.28 impact on persuasion

✨ **Enhancement Strategies:**
1. **Strengthen Middle Section**: Add emotional peak at 60% mark
2. **Cultural Relevance**: Integrate local emotional triggers (+23% lift potential)
3. **Color Psychology**: Warm tones increase emotional connection by 15%

🎭 **Recommended Emotional Journey**: Hope → Excitement → Trust → Action`
    }
    
    if (lowerPrompt.includes('compare') || lowerPrompt.includes('performance')) {
      return `Cross-Campaign Performance Analysis:

📈 **Top Performer Benchmarks:**
- Average CES Score: 87.3 (vs your 74.2)
- Brand Recall: 89% (vs your 76%)
- Persuasion Index: 82% (vs your 71%)

🔍 **Key Differences Identified:**
1. **Message Clarity**: Top performers use 23% fewer words
2. **Visual Hierarchy**: 67% more contrast in key elements  
3. **Brand Integration**: Subtle but consistent throughout (not just end-frame)
4. **Call-to-Action**: Action-oriented verbs increase conversion by 31%

⚡ **Quick Wins for Your Campaign:**
- Simplify main message (current: 47 words → target: 32 words)
- Increase logo prominence by 15% without overwhelming
- Replace "Learn More" with "Get Started" (+12% CTR boost)

🎯 **Predicted Impact**: These changes could move you from 74.2 to 83.1 CES score`
    }
    
    if (lowerPrompt.includes('predict')) {
      return `Performance Prediction Analysis:

🔮 **CES Model Forecast:**
- **Predicted Score**: 79.4 (±3.2 confidence interval)
- **Success Probability**: 78% (above industry benchmark)
- **Risk Factors**: 2 identified, 1 critical

📊 **Feature Impact Breakdown:**
- Sentiment Polarity: +0.35 (strong positive messaging)
- Visual Distinctness: +0.28 (good brand differentiation)  
- Platform Adaptation: +0.18 (optimized for mobile)
- Cultural Relevance: -0.12 (needs localization)

⚠️ **Critical Risk**: Cultural relevance score suggests potential underperformance in regional markets

🚀 **Optimization Opportunity**: 
Adding local cultural elements could boost predicted score to 85.7 (+7.9% improvement)

🎯 **Launch Recommendation**: Proceed with minor cultural adaptations for key markets`
    }
    
    // Default response
    return `Thank you for your question about "${prompt}".

Based on current CES analysis:

📊 **Current State:**
- Overall Campaign Health: 76.8/100
- Model Confidence: 84%
- Active Campaigns: 158

🔍 **Analysis Available:**
- Feature importance rankings
- Performance benchmarking  
- Optimization recommendations
- Regional insights

💡 **Next Steps:**
Would you like me to dive deeper into any specific aspect? I can provide:
- Detailed SHAP analysis
- Campaign comparisons
- Demographic breakdowns
- Creative optimization suggestions

Feel free to ask more specific questions about your campaigns!`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ask CES</h1>
          <p className="text-gray-600 mt-1">Natural language interface for campaign insights and optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Chat
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt Input */}
        <div className="lg:col-span-1">
          <PromptPanel
            onSubmit={handlePromptSubmit}
            placeholder="Ask about campaign performance, creative improvements, or insights..."
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <CESChat typing={isTyping} />
        </div>
      </div>

      {/* Saved Prompts & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Prompt Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5" />
              <span>Saved Prompts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedPrompts.map((prompt) => (
                <div key={prompt.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{prompt.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {prompt.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {prompt.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Used {prompt.useCount} times</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePromptSubmit(prompt.prompt)}
                      className="text-xs"
                    >
                      Use Prompt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messages today</span>
                <span className="font-medium">{chatMessages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Insights generated</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recommendations implemented</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average response time</span>
                <span className="font-medium">2.3s</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">AI Model Status</span>
              </div>
              <div className="text-xs text-blue-700">
                CES v1.3.0 • GPT-4 Enhanced • 94% Confidence
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}