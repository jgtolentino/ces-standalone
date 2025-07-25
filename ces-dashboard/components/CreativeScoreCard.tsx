import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../lib/utils'

interface CreativeScoreCardProps {
  score: number
  metric: string
  trend?: number
  confidence: number
  className?: string
  onClick?: () => void
}

export function CreativeScoreCard({
  score,
  metric,
  trend,
  confidence,
  className,
  onClick
}: CreativeScoreCardProps) {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-4 h-4 text-gray-400" />
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    return <TrendingDown className="w-4 h-4 text-red-500" />
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500'
    return trend > 0 ? 'text-green-500' : 'text-red-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-800'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {metric}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={cn("text-2xl font-bold", getScoreColor(score))}>
              {score.toFixed(1)}
            </span>
            <span className="text-gray-400">/ 100</span>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            {trend && (
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span 
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              getConfidenceColor(confidence)
            )}
          >
            {confidence.toFixed(0)}% confidence
          </span>
          
          {/* Mini sparkline placeholder */}
          <div className="w-16 h-8 bg-gray-100 rounded flex items-end space-x-0.5 p-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm",
                  score >= 80 ? "bg-green-300" : score >= 60 ? "bg-yellow-300" : "bg-red-300"
                )}
                style={{
                  height: `${20 + Math.random() * 60}%`
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}