import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CreativeScoreCard } from '../components/CreativeScoreCard'
import { RadarChart } from '../components/RadarChart'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { CalendarDays, Filter, TrendingUp, Users, Zap, Target } from 'lucide-react'
import { useCESStore } from '../lib/store'

export default function CESOverview() {
  const { campaigns, isLoading, setLoading } = useCESStore()
  const [kpiData, setKpiData] = useState({
    recall: { score: 78.5, trend: 12.3, confidence: 87 },
    persuasion: { score: 82.1, trend: -2.1, confidence: 91 },
    fluency: { score: 85.7, trend: 8.7, confidence: 84 },
    brandLift: { score: 73.2, trend: 15.4, confidence: 79 },
    modelConfidence: { score: 86.3, trend: 3.2, confidence: 94 }
  })

  const [radarData] = useState([
    { dimension: 'Emotional Impact', current: 85, benchmark: 72 },
    { dimension: 'Visual Appeal', current: 78, benchmark: 80 },
    { dimension: 'Message Clarity', current: 92, benchmark: 75 },
    { dimension: 'Cultural Relevance', current: 76, benchmark: 68 },
    { dimension: 'Brand Integration', current: 88, benchmark: 82 },
    { dimension: 'Call to Action', current: 74, benchmark: 70 }
  ])

  const [campaignPhases] = useState([
    { phase: 'Briefing', count: 23, color: 'bg-blue-100 text-blue-800' },
    { phase: 'Development', count: 45, color: 'bg-yellow-100 text-yellow-800' },
    { phase: 'Activation', count: 78, color: 'bg-green-100 text-green-800' },
    { phase: 'Analysis', count: 12, color: 'bg-purple-100 text-purple-800' }
  ])

  const [insights] = useState([
    {
      id: '1',
      type: 'success',
      title: 'Audio-driven ads outperform visual-only',
      description: 'Campaigns with voice narration show 23% higher brand recall than visual-only creative',
      impact: 23,
      confidence: 89
    },
    {
      id: '2', 
      type: 'warning',
      title: 'CTA timing needs optimization',
      description: 'Call-to-action appears too early in 67% of underperforming video campaigns',
      impact: -15,
      confidence: 76
    },
    {
      id: '3',
      type: 'info',
      title: 'Regional performance variance detected',
      description: 'Manila campaigns show 18% higher engagement than Cebu, suggesting cultural adaptation opportunities',
      impact: 18,
      confidence: 82
    }
  ])

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'warning': return <Target className="w-5 h-5 text-yellow-500" />
      case 'info': return <Zap className="w-5 h-5 text-blue-500" />
      default: return <Zap className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CES Overview</h1>
          <p className="text-gray-600 mt-1">Creative effectiveness insights across all campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <CreativeScoreCard
          score={kpiData.recall.score}
          metric="Brand Recall"
          trend={kpiData.recall.trend}
          confidence={kpiData.recall.confidence}
        />
        <CreativeScoreCard
          score={kpiData.persuasion.score}
          metric="Persuasion"
          trend={kpiData.persuasion.trend}
          confidence={kpiData.persuasion.confidence}
        />
        <CreativeScoreCard
          score={kpiData.fluency.score}
          metric="Fluency"
          trend={kpiData.fluency.trend}
          confidence={kpiData.fluency.confidence}
        />
        <CreativeScoreCard
          score={kpiData.brandLift.score}
          metric="Brand Lift"
          trend={kpiData.brandLift.trend}
          confidence={kpiData.brandLift.confidence}
        />
        <CreativeScoreCard
          score={kpiData.modelConfidence.score}
          metric="Model Confidence"
          trend={kpiData.modelConfidence.trend}
          confidence={kpiData.modelConfidence.confidence}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <p className="text-sm text-gray-600">SHAP-weighted performance across creative features</p>
          </CardHeader>
          <CardContent>
            <RadarChart data={radarData} />
          </CardContent>
        </Card>

        {/* Campaign Lifecycle Status */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Lifecycle Status</CardTitle>
            <p className="text-sm text-gray-600">Current distribution across development phases</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignPhases.map((phase) => (
                <div key={phase.phase} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={phase.color}>
                      {phase.phase}
                    </Badge>
                    <span className="text-sm text-gray-600">{phase.count} campaigns</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(phase.count / 158) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {((phase.count / 158) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Total Active Campaigns</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">158</div>
              <div className="text-xs text-gray-500 mt-1">
                +12 this week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
          <p className="text-sm text-gray-600">Automated findings and recommendations</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 mb-3">
                  {getInsightIcon(insight.type)}
                  <span className="font-medium text-sm">{insight.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={insight.impact > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {insight.impact > 0 ? '+' : ''}{insight.impact}% impact
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {insight.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}