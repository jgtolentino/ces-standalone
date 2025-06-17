'use client'

import { useEffect, useRef } from 'react'

interface SubstitutionFlow {
  source: string
  target: string
  frequency: number
  value: number
}

interface SankeyDiagramProps {
  data: SubstitutionFlow[]
  height: number
}

interface SankeyNode {
  id: string
  name: string
  x: number
  y: number
  height: number
  value: number
}

interface SankeyLink {
  source: string
  target: string
  value: number
  sourceY: number
  targetY: number
  color: string
}

export default function SankeyDiagram({ data, height }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Process data for Sankey visualization
  const processData = () => {
    if (!data || data.length === 0) return { nodes: [], links: [] }

    // Get unique nodes
    const nodeSet = new Set<string>()
    data.forEach(flow => {
      nodeSet.add(flow.source)
      nodeSet.add(flow.target)
    })

    const nodes: SankeyNode[] = Array.from(nodeSet).map((name, index) => {
      const totalValue = data
        .filter(d => d.source === name || d.target === name)
        .reduce((sum, d) => sum + d.frequency, 0)

      return {
        id: name,
        name,
        x: data.some(d => d.source === name) ? 50 : 350, // Left side for sources, right for targets
        y: index * 60 + 20,
        height: Math.max(totalValue / 100, 20),
        value: totalValue
      }
    })

    // Adjust node positions to avoid overlap
    const leftNodes = nodes.filter(n => n.x === 50).sort((a, b) => b.value - a.value)
    const rightNodes = nodes.filter(n => n.x === 350).sort((a, b) => b.value - a.value)

    leftNodes.forEach((node, index) => {
      node.y = index * 50 + 20
    })

    rightNodes.forEach((node, index) => {
      node.y = index * 50 + 20
    })

    // Create links
    const links: SankeyLink[] = data.map((flow, index) => {
      const sourceNode = nodes.find(n => n.id === flow.source)
      const targetNode = nodes.find(n => n.id === flow.target)
      
      const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ]

      return {
        source: flow.source,
        target: flow.target,
        value: flow.frequency,
        sourceY: sourceNode?.y || 0,
        targetY: targetNode?.y || 0,
        color: colors[index % colors.length]
      }
    })

    return { nodes, links }
  }

  const { nodes, links } = processData()

  // Generate SVG path for curved links
  const generatePath = (link: SankeyLink) => {
    const sourceNode = nodes.find(n => n.id === link.source)
    const targetNode = nodes.find(n => n.id === link.target)
    
    if (!sourceNode || !targetNode) return ''

    const x1 = sourceNode.x + 120 // End of source node
    const y1 = sourceNode.y + sourceNode.height / 2
    const x2 = targetNode.x - 20 // Start of target node
    const y2 = targetNode.y + targetNode.height / 2

    const cx1 = x1 + (x2 - x1) * 0.5
    const cx2 = x1 + (x2 - x1) * 0.5

    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
  }

  const formatValue = (value: number): string => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium">No Substitution Data</div>
          <div className="text-sm mt-2">No significant product substitution patterns found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 500 300">
        {/* Define gradients for links */}
        <defs>
          {links.map((link, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={link.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={link.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
        </defs>

        {/* Draw links */}
        {links.map((link, index) => (
          <g key={index}>
            <path
              d={generatePath(link)}
              stroke={`url(#gradient-${index})`}
              strokeWidth={Math.max(link.value / 20, 3)}
              fill="none"
              opacity="0.7"
              className="hover:opacity-100 transition-opacity duration-200"
            />
            
            {/* Link label */}
            <text
              x={250}
              y={Math.min(link.sourceY, link.targetY) + Math.abs(link.targetY - link.sourceY) / 2}
              textAnchor="middle"
              className="text-xs fill-gray-600 font-medium"
              dy="0.35em"
            >
              {formatValue(link.value)}
            </text>
          </g>
        ))}

        {/* Draw nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Node rectangle */}
            <rect
              x={node.x}
              y={node.y}
              width={120}
              height={Math.max(node.height, 30)}
              rx="4"
              fill={node.x === 50 ? '#3B82F6' : '#10B981'}
              opacity="0.8"
              className="hover:opacity-100 transition-opacity duration-200"
            />
            
            {/* Node label */}
            <text
              x={node.x + 60}
              y={node.y + Math.max(node.height, 30) / 2}
              textAnchor="middle"
              className="text-sm fill-white font-medium"
              dy="0.35em"
            >
              {node.name.length > 15 ? `${node.name.substring(0, 12)}...` : node.name}
            </text>
            
            {/* Value label */}
            <text
              x={node.x + 60}
              y={node.y + Math.max(node.height, 30) / 2 + 15}
              textAnchor="middle"
              className="text-xs fill-white opacity-90"
              dy="0.35em"
            >
              {formatValue(node.value)}
            </text>
          </g>
        ))}

        {/* Labels */}
        <text x="110" y="15" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
          Original Products
        </text>
        <text x="410" y="15" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
          Substitute Products
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Flow thickness = Substitution frequency</span>
          <span>Numbers show substitution count</span>
        </div>
      </div>
    </div>
  )
}