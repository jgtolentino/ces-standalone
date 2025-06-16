import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Brain, GitCompare, PieChart as PieChartIcon, TrendingUp, Info, AlertTriangle } from 'lucide-react'
import { ModelVersion } from '../types/ces'

export default function CESInsights() {
  const [selectedCampaignType, setSelectedCampaignType] = useState('all')
  const [selectedModelVersion, setSelectedModelVersion] = useState('v1.3.0')

  const globalShapData = [
    { feature: 'Emotional × Cultural', importance: 1.27, category: 'Interaction' },
    { feature: 'Sentiment Polarity', importance: 0.352, category: 'Automated' },
    { feature: 'Performance Score', importance: 0.352, category: 'Automated' },
    { feature: 'Emotional Intensity', importance: 0.352, category: 'Automated' },
    { feature: 'Visual Distinctness', importance: 0.287, category: 'Creative' },
    { feature: 'Message × CTA', importance: 0.247, category: 'Interaction' },
    { feature: 'Cultural Relevance', importance: 0.254, category: 'Creative' },
    { feature: 'Visual × Brand', importance: 0.225, category: 'Interaction' },
    { feature: 'Brand Integration', importance: 0.213, category: 'Creative' },
    { feature: 'Platform Adaptation', importance: 0.176, category: 'Automated' }
  ]

  const modelVersions: ModelVersion[] = [
    {
      version: 'v1.3.0',
      date: new Date('2024-01-15'),
      accuracy: 86.3,
      features_count: 23,
      changes: [
        { feature: 'emotional_x_cultural', change_type: 'added', impact: 0.127 },
        { feature: 'platform_adaptation', change_type: 'modified', impact: 0.032 },
        { feature: 'legacy_sentiment', change_type: 'removed', impact: -0.018 }
      ],
      performance_comparison: {
        previous_version: 'v1.2.0',
        accuracy_delta: 3.2,
        feature_importance_changes: [
          { feature: 'emotional_intensity', old_importance: 0.298, new_importance: 0.352 },
          { feature: 'cultural_relevance', old_importance: 0.189, new_importance: 0.254 }
        ]
      }
    },
    {
      version: 'v1.2.0',
      date: new Date('2024-01-01'),
      accuracy: 83.1,
      features_count: 21,
      changes: [],
      performance_comparison: {
        accuracy_delta: 0,
        feature_importance_changes: []
      }
    }
  ]

  const featureDistribution = [
    { feature: 'Emotional Elements', usage: 89, campaigns: 142 },
    { feature: 'Brand Logo/Assets', usage: 95, campaigns: 151 },
    { feature: 'Call to Action', usage: 78, campaigns: 123 },
    { feature: 'Cultural References', usage: 34, campaigns: 54 },
    { feature: 'Audio/Music', usage: 67, campaigns: 106 },
    { feature: 'Text Overlays', usage: 82, campaigns: 130 },
    { feature: 'Human Faces', usage: 71, campaigns: 112 },
    { feature: 'Product Demo', usage: 58, campaigns: 92 }
  ]

  const confidenceZones = [
    { zone: 'High Confidence', range: '85-100%', campaigns: 78, color: '#10B981' },
    { zone: 'Medium Confidence', range: '70-84%', campaigns: 64, color: '#F59E0B' },
    { zone: 'Low Confidence', range: '<70%', campaigns: 16, color: '#EF4444' }
  ]

  const campaignTypePerformance = [
    { type: 'Purpose-Driven', accuracy: 87.5, campaigns: 45, avg_confidence: 91 },
    { type: 'Brand Building', accuracy: 82.1, campaigns: 67, avg_confidence: 86 },
    { type: 'Promotional', accuracy: 79.3, campaigns: 46, avg_confidence: 78 }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Interaction': return '#8B5CF6'
      case 'Automated': return '#3B82F6'
      case 'Creative': return '#10B981'
      default: return '#6B7280'
    }
  }

  const currentVersion = modelVersions.find(v => v.version === selectedModelVersion)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Model Insights</h1>
          <p className="text-gray-600 mt-1">Model explainability, feature analysis, and system learning</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaign Types</SelectItem>
              <SelectItem value="purpose_driven">Purpose-Driven</SelectItem>
              <SelectItem value="brand_building">Brand Building</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedModelVersion} onValueChange={setSelectedModelVersion}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelVersions.map((version) => (
                <SelectItem key={version.version} value={version.version}>
                  {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Model Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <span>Model Status - {currentVersion?.version}</span>
            </CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Production Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentVersion?.accuracy}%</div>
              <div className="text-sm text-gray-600">Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentVersion?.features_count}</div>
              <div className="text-sm text-gray-600">Active Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">158</div>
              <div className="text-sm text-gray-600">Campaigns Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">94%</div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global SHAP Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Global Feature Importance</CardTitle>
            <p className="text-sm text-gray-600">What drives effectiveness across all campaigns</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={globalShapData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax']} />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  width={120}
                  fontSize={11}
                />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value.toFixed(3)}`, 
                    `Importance (${props.payload.category})`
                  ]}
                />
                <Bar dataKey="importance" radius={2}>
                  {globalShapData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCategoryColor(entry.category)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Interaction Effects</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Automated Features</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Creative Features</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5" />
              <span>Feature Usage Distribution</span>
            </CardTitle>
            <p className="text-sm text-gray-600">% of campaigns using each feature</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featureDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.feature}</span>
                      <span className="text-sm text-gray-600">{item.usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${item.usage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-xs text-gray-500">
                    {item.campaigns} campaigns
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Version Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5" />
            <span>Model Version History</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Track model improvements and feature changes</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Version Comparison</h4>
              <div className="space-y-3">
                {modelVersions.map((version, index) => (
                  <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{version.version}</div>
                      <div className="text-sm text-gray-600">
                        {version.date.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{version.accuracy}%</div>
                      {version.performance_comparison.accuracy_delta > 0 && (
                        <div className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{version.performance_comparison.accuracy_delta}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recent Changes (v1.3.0)</h4>
              <div className="space-y-2">
                {currentVersion?.changes.map((change, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      change.change_type === 'added' ? 'bg-green-500' :
                      change.change_type === 'modified' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm capitalize">{change.change_type}</span>
                    <span className="text-sm font-medium">{change.feature.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-gray-600">
                      Impact: {change.impact > 0 ? '+' : ''}{change.impact.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Zones */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Confidence Zones</CardTitle>
            <p className="text-sm text-gray-600">Reliability bands by prediction confidence</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={confidenceZones}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="campaigns"
                  label={({ zone, campaigns }) => `${zone}: ${campaigns}`}
                >
                  {confidenceZones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {confidenceZones.map((zone, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: zone.color }}
                    ></div>
                    <span>{zone.zone}</span>
                    <span className="text-gray-500">({zone.range})</span>
                  </div>
                  <span className="font-medium">{zone.campaigns} campaigns</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Campaign Type</CardTitle>
            <p className="text-sm text-gray-600">Model accuracy across different campaign categories</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignTypePerformance.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{type.type}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{type.campaigns} campaigns</Badge>
                      <span className="text-sm font-medium">{type.accuracy}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${type.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Avg Confidence: {type.avg_confidence}%
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Model Insights</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Purpose-driven campaigns show highest predictability (87.5%)</p>
                <p>• Interaction effects most important for brand building</p>
                <p>• Promotional campaigns benefit from enhanced CTA analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}