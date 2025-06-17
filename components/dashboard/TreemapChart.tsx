'use client'

import { useEffect, useRef } from 'react'

interface CategoryData {
  category: string
  revenue: number
  volume: number
  performanceDelta: number
  share: number
  growth: number
}

interface TreemapChartProps {
  data: CategoryData[]
  onCategorySelect: (category: string) => void
  selectedCategory: string | null
  height: number
}

interface TreemapNode {
  category: string
  value: number
  performanceDelta: number
  x: number
  y: number
  width: number
  height: number
}

export default function TreemapChart({ 
  data, 
  onCategorySelect, 
  selectedCategory, 
  height 
}: TreemapChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Simple treemap algorithm - in production would use D3.js
  const calculateTreemap = (data: CategoryData[], width: number, height: number): TreemapNode[] => {
    const totalValue = data.reduce((sum, item) => sum + item.volume, 0)
    const nodes: TreemapNode[] = []
    
    let currentX = 0
    let currentY = 0
    let remainingWidth = width
    let remainingHeight = height
    
    data.forEach((item, index) => {
      const proportion = item.volume / totalValue
      const nodeWidth = Math.sqrt(proportion * width * height)
      const nodeHeight = (proportion * width * height) / nodeWidth
      
      // Adjust for remaining space
      const actualWidth = Math.min(nodeWidth, remainingWidth)
      const actualHeight = Math.min(nodeHeight, remainingHeight)
      
      nodes.push({
        category: item.category,
        value: item.volume,
        performanceDelta: item.performanceDelta,
        x: currentX,
        y: currentY,
        width: actualWidth,
        height: actualHeight
      })
      
      // Update position for next node
      if (currentX + actualWidth + 50 < width) {
        currentX += actualWidth + 2
        remainingWidth -= actualWidth + 2
      } else {
        currentX = 0
        currentY += actualHeight + 2
        remainingWidth = width
        remainingHeight -= actualHeight + 2
      }
    })
    
    return nodes
  }

  const getPerformanceColor = (delta: number): string => {
    if (delta >= 10) return 'bg-green-600'
    if (delta >= 5) return 'bg-green-400'
    if (delta >= 0) return 'bg-green-200'
    if (delta >= -5) return 'bg-yellow-300'
    if (delta >= -10) return 'bg-orange-400'
    return 'bg-red-400'
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `₱${(value / 1000).toFixed(1)}K`
    return `₱${value.toFixed(0)}`
  }

  const nodes = containerRef.current 
    ? calculateTreemap(data, containerRef.current.offsetWidth - 20, height - 20)
    : []

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <div className="relative w-full h-full p-2 bg-gray-50 rounded-lg overflow-hidden">
        {nodes.map((node) => {
          const isSelected = selectedCategory === node.category
          const colorClass = getPerformanceColor(node.performanceDelta)
          
          return (
            <div
              key={node.category}
              className={`absolute cursor-pointer transition-all duration-200 rounded border-2 ${colorClass} ${
                isSelected 
                  ? 'border-blue-600 border-4 shadow-lg' 
                  : 'border-white hover:border-gray-400 hover:shadow-md'
              }`}
              style={{
                left: node.x,
                top: node.y,
                width: Math.max(node.width, 60),
                height: Math.max(node.height, 40)
              }}
              onClick={() => onCategorySelect(node.category)}
              title={`${node.category}: ${formatCurrency(node.value)} (${node.performanceDelta > 0 ? '+' : ''}${node.performanceDelta.toFixed(1)}%)`}
            >
              <div className="p-2 h-full flex flex-col justify-center items-center text-center">
                <div className={`text-xs font-bold ${
                  Math.abs(node.performanceDelta) > 5 ? 'text-white' : 'text-gray-800'
                }`}>
                  {node.category}
                </div>
                {node.width > 80 && node.height > 50 && (
                  <>
                    <div className={`text-xs mt-1 ${
                      Math.abs(node.performanceDelta) > 5 ? 'text-white' : 'text-gray-600'
                    }`}>
                      {formatCurrency(node.value)}
                    </div>
                    <div className={`text-xs font-semibold ${
                      Math.abs(node.performanceDelta) > 5 ? 'text-white' : 'text-gray-800'
                    }`}>
                      {node.performanceDelta > 0 ? '+' : ''}{node.performanceDelta.toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-lg font-medium">Loading category data...</div>
              <div className="text-sm mt-2">Please wait while we process the treemap</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Click categories to drill down</span>
          <span>Size = Volume, Color = Performance vs Previous Period</span>
        </div>
      </div>
    </div>
  )
}