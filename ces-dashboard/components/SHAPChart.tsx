import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ArrowUp, ArrowDown, Info } from 'lucide-react'
import { SHAPValue } from '../types/ces'

interface SHAPChartProps {
  features: SHAPValue[]
  baseline: number
  className?: string
}

export function SHAPChart({ features, baseline, className }: SHAPChartProps) {
  const [showPositive, setShowPositive] = useState(true)
  const [showNegative, setShowNegative] = useState(true)
  const [sortBy, setSortBy] = useState<'importance' | 'value'>('importance')

  const filteredFeatures = features
    .filter(f => {
      if (!showPositive && f.impact === 'positive') return false
      if (!showNegative && f.impact === 'negative') return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'importance') {
        return b.importance - a.importance
      }
      return Math.abs(b.value) - Math.abs(a.value)
    })

  const chartData = filteredFeatures.map(feature => ({
    name: feature.feature.replace(/_/g, ' ').toUpperCase(),
    value: feature.value,
    impact: feature.impact,
    importance: feature.importance,
    fullName: feature.feature
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className={`text-sm ${data.impact === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            Impact: {data.value > 0 ? '+' : ''}{data.value.toFixed(3)}
          </p>
          <p className="text-sm text-gray-600">
            Importance: {(data.importance * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">SHAP Feature Importance</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={showPositive ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPositive(!showPositive)}
              className="text-xs"
            >
              <ArrowUp className="w-3 h-3 mr-1" />
              Positive
            </Button>
            <Button
              variant={showNegative ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNegative(!showNegative)}
              className="text-xs"
            >
              <ArrowDown className="w-3 h-3 mr-1" />
              Negative
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Info className="w-4 h-4" />
            <span>Baseline: {baseline.toFixed(2)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === 'importance' ? 'value' : 'importance')}
            className="text-xs"
          >
            Sort by {sortBy === 'importance' ? 'Value' : 'Importance'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={['dataMin', 'dataMax']} />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              fontSize={11}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={2}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.impact === 'positive' ? '#10B981' : '#EF4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>
            SHAP values explain how each feature contributes to the model's prediction relative to the baseline.
            Positive values increase the score, negative values decrease it.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}