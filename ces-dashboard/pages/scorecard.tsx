import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CreativeScoreCard } from '../components/CreativeScoreCard'
import { SHAPChart } from '../components/SHAPChart'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Play, Pause, SkipBack, SkipForward, Eye, Lightbulb, BarChart3 } from 'lucide-react'
import { SHAPValue } from '../types/ces'

export default function CESScorecard() {
  const [selectedAsset, setSelectedAsset] = useState('asset-1')
  const [viewMode, setViewMode] = useState<'shap' | 'insights' | 'timeline'>('shap')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const assets = [
    { id: 'asset-1', name: 'Hero Video - 30s', type: 'video', format: 'MP4' },
    { id: 'asset-2', name: 'Static Banner - Desktop', type: 'image', format: 'JPG' },
    { id: 'asset-3', name: 'Mobile Story - 15s', type: 'video', format: 'MP4' },
    { id: 'asset-4', name: 'Audio Spot - 30s', type: 'audio', format: 'MP3' }
  ]

  const currentAsset = assets.find(a => a.id === selectedAsset)

  const shapData: SHAPValue[] = [
    { feature: 'emotional_intensity', value: 0.145, impact: 'positive', importance: 0.23 },
    { feature: 'visual_distinctness', value: 0.132, impact: 'positive', importance: 0.21 },
    { feature: 'brand_integration', value: 0.089, impact: 'positive', importance: 0.18 },
    { feature: 'message_clarity', value: 0.076, impact: 'positive', importance: 0.15 },
    { feature: 'cultural_relevance', value: -0.045, impact: 'negative', importance: 0.12 },
    { feature: 'call_to_action_strength', value: 0.034, impact: 'positive', importance: 0.08 },
    { feature: 'platform_adaptation', value: -0.023, impact: 'negative', importance: 0.03 }
  ]

  const featureScores = {
    emotional_impact: { score: 87.3, trend: 12.1, confidence: 91 },
    visual_distinctness: { score: 82.7, trend: -3.2, confidence: 87 },
    message_clarity: { score: 79.4, trend: 8.7, confidence: 83 },
    cultural_relevance: { score: 71.2, trend: -7.3, confidence: 76 },
    brand_integration: { score: 85.9, trend: 15.2, confidence: 89 },
    cta_strength: { score: 68.5, trend: 4.1, confidence: 72 }
  }

  const insights = [
    {
      type: 'improvement',
      title: 'Enhance Cultural Relevance',
      description: 'SHAP analysis shows cultural relevance is negatively impacting performance (-0.045). Consider adding local references or cultural symbols.',
      priority: 'high',
      expectedLift: '+6.2%'
    },
    {
      type: 'optimization',
      title: 'Strengthen Call-to-Action',
      description: 'CTA strength is below optimal. Moving the call-to-action 3 seconds earlier could improve conversion by 12%.',
      priority: 'medium',
      expectedLift: '+3.8%'
    },
    {
      type: 'success',
      title: 'Excellent Emotional Impact',
      description: 'Emotional intensity is performing exceptionally well (+0.145 SHAP value). This creative resonates strongly with the target audience.',
      priority: 'maintain',
      expectedLift: 'baseline'
    }
  ]

  const timelineSegments = [
    { time: '0-3s', type: 'Brand Intro', score: 78, features: ['brand_logo', 'music_intro'] },
    { time: '3-8s', type: 'Problem Setup', score: 82, features: ['emotional_hook', 'problem_statement'] },
    { time: '8-15s', type: 'Product Demo', score: 89, features: ['product_demo', 'benefit_highlight'] },
    { time: '15-22s', type: 'Social Proof', score: 85, features: ['testimonial', 'trust_signals'] },
    { time: '22-30s', type: 'Call to Action', score: 72, features: ['cta_button', 'urgency_text'] }
  ]

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In real implementation, this would control video/audio playback
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case 'optimization': return <BarChart3 className="w-4 h-4 text-blue-500" />
      case 'success': return <Eye className="w-4 h-4 text-green-500" />
      default: return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'maintain': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creative Scorecard</h1>
          <p className="text-gray-600 mt-1">Deep dive analysis of creative feature effectiveness</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Asset Preview & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentAsset?.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{currentAsset?.type}</Badge>
              <Badge variant="outline">{currentAsset?.format}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {/* Asset Preview Placeholder */}
            <div className="w-64 h-36 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">{currentAsset?.name}</p>
              </div>
            </div>

            {/* Playback Controls */}
            {currentAsset?.type === 'video' && (
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-4">
                  <Button size="sm" variant="outline" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 0:30
                  </span>
                </div>
                
                {/* Timeline Scrubber */}
                <div className="w-full h-2 bg-gray-200 rounded-full relative">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${(currentTime / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <CreativeScoreCard
          score={featureScores.emotional_impact.score}
          metric="Emotional Impact"
          trend={featureScores.emotional_impact.trend}
          confidence={featureScores.emotional_impact.confidence}
        />
        <CreativeScoreCard
          score={featureScores.visual_distinctness.score}
          metric="Visual Distinctness"
          trend={featureScores.visual_distinctness.trend}
          confidence={featureScores.visual_distinctness.confidence}
        />
        <CreativeScoreCard
          score={featureScores.message_clarity.score}
          metric="Message Clarity"
          trend={featureScores.message_clarity.trend}
          confidence={featureScores.message_clarity.confidence}
        />
        <CreativeScoreCard
          score={featureScores.cultural_relevance.score}
          metric="Cultural Relevance"
          trend={featureScores.cultural_relevance.trend}
          confidence={featureScores.cultural_relevance.confidence}
        />
        <CreativeScoreCard
          score={featureScores.brand_integration.score}
          metric="Brand Integration"
          trend={featureScores.brand_integration.trend}
          confidence={featureScores.brand_integration.confidence}
        />
        <CreativeScoreCard
          score={featureScores.cta_strength.score}
          metric="CTA Strength"
          trend={featureScores.cta_strength.trend}
          confidence={featureScores.cta_strength.confidence}
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'shap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('shap')}
        >
          SHAP Analysis
        </Button>
        <Button
          variant={viewMode === 'insights' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('insights')}
        >
          AI Insights
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('timeline')}
        >
          Timeline View
        </Button>
      </div>

      {/* Dynamic Content Based on View Mode */}
      {viewMode === 'shap' && (
        <SHAPChart
          features={shapData}
          baseline={0.67}
        />
      )}

      {viewMode === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  {getInsightIcon(insight.type)}
                  <span className="font-medium text-sm">{insight.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                  <span className="text-sm font-medium text-green-600">
                    {insight.expectedLift}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'timeline' && currentAsset?.type === 'video' && (
        <Card>
          <CardHeader>
            <CardTitle>Frame-by-Frame Analysis</CardTitle>
            <p className="text-sm text-gray-600">Creative effectiveness across video timeline</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineSegments.map((segment, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="text-sm font-medium text-gray-900 w-16">
                    {segment.time}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{segment.type}</span>
                      <span className="text-sm text-gray-600">Score: {segment.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${segment.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {segment.features.map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {feature.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}