import React from 'react'
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

interface RadarChartProps {
  data: Array<{
    dimension: string
    current: number
    benchmark: number
    [key: string]: any
  }>
  colors?: string[]
  className?: string
}

export function RadarChart({ data, colors = ['#3B82F6', '#EF4444'], className }: RadarChartProps) {
  const chartData = data.map(item => ({
    dimension: item.dimension,
    Current: item.current,
    Benchmark: item.benchmark
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" className="text-xs" />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            className="text-xs"
            tick={false}
          />
          <Radar
            name="Current Performance"
            dataKey="Current"
            stroke={colors[0]}
            fill={colors[0]}
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Radar
            name="Industry Benchmark"
            dataKey="Benchmark"
            stroke={colors[1]}
            fill={colors[1]}
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}