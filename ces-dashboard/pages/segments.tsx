import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { MapPin, Users, TrendingUp, TrendingDown, Target, Filter } from 'lucide-react'
import { RegionData, PersonaData } from '../types/ces'

export default function CESSegments() {
  const [selectedRegion, setSelectedRegion] = useState('ph')
  const [selectedMetric, setSelectedMetric] = useState('recall')
  const [drilldownLevel, setDrilldownLevel] = useState<'country' | 'region' | 'city'>('region')

  const regions: RegionData[] = [
    {
      id: 'ncr',
      name: 'National Capital Region',
      type: 'region',
      parent_id: 'ph',
      coordinates: [14.5995, 120.9842],
      metrics: { recall: 89, persuasion: 87, brand_lift: 82, engagement: 91 },
      campaign_count: 45
    },
    {
      id: 'calabarzon',
      name: 'CALABARZON',
      type: 'region',
      parent_id: 'ph',
      coordinates: [14.2181, 121.0168],
      metrics: { recall: 78, persuasion: 81, brand_lift: 75, engagement: 83 },
      campaign_count: 32
    },
    {
      id: 'central-luzon',
      name: 'Central Luzon',
      type: 'region',
      parent_id: 'ph',
      coordinates: [15.4817, 120.5979],
      metrics: { recall: 82, persuasion: 79, brand_lift: 78, engagement: 86 },
      campaign_count: 28
    },
    {
      id: 'western-visayas',
      name: 'Western Visayas',
      type: 'region',
      parent_id: 'ph',
      coordinates: [10.7202, 122.5621],
      metrics: { recall: 76, persuasion: 74, brand_lift: 71, engagement: 79 },
      campaign_count: 18
    },
    {
      id: 'central-visayas',
      name: 'Central Visayas',
      type: 'region',
      parent_id: 'ph',
      coordinates: [10.3157, 123.8854],
      metrics: { recall: 73, persuasion: 76, brand_lift: 69, engagement: 77 },
      campaign_count: 22
    },
    {
      id: 'davao-region',
      name: 'Davao Region',
      type: 'region',
      parent_id: 'ph',
      coordinates: [7.1907, 125.4553],
      metrics: { recall: 71, persuasion: 73, brand_lift: 68, engagement: 75 },
      campaign_count: 15
    }
  ]

  const personas: PersonaData[] = [
    {
      id: 'urban-millennials',
      name: 'Urban Millennials',
      demographics: {
        age_range: '25-40',
        gender: 'Mixed',
        income_bracket: 'Middle-Upper',
        device_preference: 'Mobile'
      },
      performance_metrics: {
        recall: 87,
        persuasion: 89,
        brand_lift: 85,
        engagement: 92
      },
      top_campaigns: ['campaign-1', 'campaign-3', 'campaign-7'],
      behavioral_insights: [
        'Responds well to authentic storytelling',
        'Prefers video content over static',
        'High engagement with social causes'
      ]
    },
    {
      id: 'gen-z-students',
      name: 'Gen Z Students',
      demographics: {
        age_range: '18-25',
        gender: 'Mixed',
        income_bracket: 'Lower-Middle',
        device_preference: 'Mobile'
      },
      performance_metrics: {
        recall: 82,
        persuasion: 78,
        brand_lift: 79,
        engagement: 95
      },
      top_campaigns: ['campaign-2', 'campaign-5', 'campaign-9'],
      behavioral_insights: [
        'Short attention spans - prefer 15s content',
        'Music and trends drive engagement',
        'Values sustainability and social impact'
      ]
    },
    {
      id: 'working-parents',
      name: 'Working Parents',
      demographics: {
        age_range: '30-45',
        gender: 'Mixed',
        income_bracket: 'Middle',
        device_preference: 'Mobile/Desktop'
      },
      performance_metrics: {
        recall: 79,
        persuasion: 85,
        brand_lift: 81,
        engagement: 73
      },
      top_campaigns: ['campaign-4', 'campaign-6', 'campaign-8'],
      behavioral_insights: [
        'Family-focused messaging resonates',
        'Practical benefits over emotional appeals',
        'Evening and weekend consumption peaks'
      ]
    },
    {
      id: 'senior-professionals',
      name: 'Senior Professionals',
      demographics: {
        age_range: '45-60',
        gender: 'Mixed',
        income_bracket: 'Upper',
        device_preference: 'Desktop/Mobile'
      },
      performance_metrics: {
        recall: 85,
        persuasion: 91,
        brand_lift: 88,
        engagement: 68
      },
      top_campaigns: ['campaign-1', 'campaign-10', 'campaign-11'],
      behavioral_insights: [
        'Trust and credibility are key',
        'Longer content consumption tolerance',
        'Brand heritage and quality focus'
      ]
    }
  ]

  const segmentMatrix = [
    { ageGroup: '18-25', male: 78, female: 82, overall: 80 },
    { ageGroup: '26-35', male: 85, female: 87, overall: 86 },
    { ageGroup: '36-45', male: 81, female: 83, overall: 82 },
    { ageGroup: '46-55', male: 88, female: 84, overall: 86 },
    { ageGroup: '55+', male: 79, female: 81, overall: 80 }
  ]

  const getMetricColor = (value: number) => {
    if (value >= 85) return 'text-green-600'
    if (value >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRegionColor = (value: number) => {
    if (value >= 85) return 'bg-green-500'
    if (value >= 75) return 'bg-yellow-500'
    if (value >= 65) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Target Segments</h1>
          <p className="text-gray-600 mt-1">Demographic and geographic performance breakdown</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recall">Brand Recall</SelectItem>
              <SelectItem value="persuasion">Persuasion</SelectItem>
              <SelectItem value="brand_lift">Brand Lift</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Regional Performance Map</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} scores by region
            </p>
          </CardHeader>
          <CardContent>
            {/* Simplified map representation */}
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">Philippines</h3>
                <p className="text-sm text-gray-600">Click regions to drill down</p>
              </div>
              
              <div className="space-y-2">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getRegionColor(region.metrics[selectedMetric as keyof typeof region.metrics])}`}
                      ></div>
                      <span className="text-sm font-medium">{region.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getMetricColor(region.metrics[selectedMetric as keyof typeof region.metrics])}`}>
                        {region.metrics[selectedMetric as keyof typeof region.metrics]}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {region.campaign_count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segment Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Demographic Performance Matrix</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Age x Gender effectiveness breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Age Group</th>
                    <th className="text-center py-2">Male</th>
                    <th className="text-center py-2">Female</th>
                    <th className="text-center py-2">Overall</th>
                    <th className="text-center py-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentMatrix.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{row.ageGroup}</td>
                      <td className="text-center py-2">
                        <span className={getMetricColor(row.male)}>{row.male}%</span>
                      </td>
                      <td className="text-center py-2">
                        <span className={getMetricColor(row.female)}>{row.female}%</span>
                      </td>
                      <td className="text-center py-2">
                        <span className={`font-medium ${getMetricColor(row.overall)}`}>
                          {row.overall}%
                        </span>
                      </td>
                      <td className="text-center py-2">
                        {row.male < row.female ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Persona Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Top Performing Personas</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Audience segments with highest campaign effectiveness</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map((persona) => (
              <div key={persona.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">{persona.name}</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Age: {persona.demographics.age_range}</div>
                    <div>Income: {persona.demographics.income_bracket}</div>
                    <div>Device: {persona.demographics.device_preference}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Recall:</span>
                    <span className={getMetricColor(persona.performance_metrics.recall)}>
                      {persona.performance_metrics.recall}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Persuasion:</span>
                    <span className={getMetricColor(persona.performance_metrics.persuasion)}>
                      {persona.performance_metrics.persuasion}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement:</span>
                    <span className={getMetricColor(persona.performance_metrics.engagement)}>
                      {persona.performance_metrics.engagement}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-700">Key Insights:</h5>
                  {persona.behavioral_insights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      {insight}
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Top campaigns:</span>
                    <Badge variant="outline">{persona.top_campaigns.length}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delta Chart - Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends by Segment</CardTitle>
          <p className="text-sm text-gray-600">Monthly performance changes across key demographics</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map((persona) => (
              <div key={persona.id} className="text-center">
                <h4 className="font-medium text-sm mb-2">{persona.name}</h4>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold text-green-600">+12.3%</span>
                </div>
                <div className="w-full h-16 bg-gray-100 rounded flex items-end space-x-1 p-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-green-300 rounded-sm"
                      style={{
                        height: `${30 + Math.random() * 50}%`
                      }}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">vs last quarter</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}