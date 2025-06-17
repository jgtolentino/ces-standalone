'use client'

import { useEffect, useRef } from 'react'

interface RegionalData {
  region: string
  code: string
  revenue: number
  population: number
  stores: number
  growth: number
  coordinates: [number, number]
}

interface GeoHeatMapProps {
  data: RegionalData[]
  selectedRegion: string | null
  onRegionClick: (regionCode: string) => void
  metric: string
  height: number
}

export default function GeoHeatMap({ 
  data, 
  selectedRegion, 
  onRegionClick, 
  metric, 
  height 
}: GeoHeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // For now, we'll create a simplified SVG-based Philippines map
  // In production, this would use Leaflet or similar mapping library
  const philippinesRegions = [
    { name: 'Metro Manila', code: 'NCR', x: 300, y: 280, size: 'large' },
    { name: 'Cebu', code: 'VII', x: 350, y: 350, size: 'medium' },
    { name: 'Davao', code: 'XI', x: 400, y: 420, size: 'medium' },
    { name: 'Ilocos', code: 'I', x: 280, y: 180, size: 'small' },
    { name: 'Cagayan Valley', code: 'II', x: 320, y: 160, size: 'small' },
    { name: 'Central Luzon', code: 'III', x: 290, y: 240, size: 'medium' },
    { name: 'Calabarzon', code: 'IVA', x: 310, y: 300, size: 'medium' },
    { name: 'Mimaropa', code: 'IVB', x: 280, y: 320, size: 'small' },
    { name: 'Bicol', code: 'V', x: 330, y: 340, size: 'small' },
    { name: 'Western Visayas', code: 'VI', x: 320, y: 370, size: 'medium' },
    { name: 'Eastern Visayas', code: 'VIII', x: 380, y: 360, size: 'small' },
    { name: 'Zamboanga Peninsula', code: 'IX', x: 340, y: 420, size: 'small' },
    { name: 'Northern Mindanao', code: 'X', x: 380, y: 400, size: 'small' },
    { name: 'Soccsksargen', code: 'XII', x: 360, y: 440, size: 'small' },
    { name: 'Caraga', code: 'XIII', x: 420, y: 380, size: 'small' },
    { name: 'BARMM', code: 'BARMM', x: 320, y: 460, size: 'small' },
    { name: 'CAR', code: 'CAR', x: 300, y: 200, size: 'small' }
  ]

  const getMetricValue = (regionData: RegionalData) => {
    switch (metric) {
      case 'revenue': return regionData.revenue
      case 'growth': return regionData.growth
      case 'stores': return regionData.stores
      case 'population': return regionData.population
      default: return regionData.revenue
    }
  }

  const getColorIntensity = (value: number, maxValue: number) => {
    const intensity = Math.min(value / maxValue, 1)
    if (intensity < 0.25) return 'fill-red-200'
    if (intensity < 0.5) return 'fill-yellow-200'
    if (intensity < 0.75) return 'fill-green-200'
    return 'fill-green-500'
  }

  const maxValue = Math.max(...data.map(d => getMetricValue(d)))

  const formatValue = (value: number) => {
    if (metric === 'revenue') return `₱${(value / 1000000).toFixed(1)}M`
    if (metric === 'growth') return `${value.toFixed(1)}%`
    return value.toLocaleString()
  }

  return (
    <div ref={mapRef} className="relative w-full" style={{ height }}>
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full border border-gray-200 rounded-lg bg-blue-50"
      >
        {/* Philippine Islands Outline */}
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>

        {/* Luzon */}
        <path
          d="M280,150 Q320,160 340,200 L350,250 Q360,280 340,320 L320,340 Q300,350 280,340 L260,320 Q250,280 260,240 L270,200 Q280,160 280,150"
          className="fill-gray-100 stroke-gray-300"
          strokeWidth="2"
        />

        {/* Visayas */}
        <ellipse cx="350" cy="370" rx="40" ry="20" className="fill-gray-100 stroke-gray-300" strokeWidth="2" />
        <ellipse cx="320" cy="380" rx="25" ry="15" className="fill-gray-100 stroke-gray-300" strokeWidth="2" />
        <ellipse cx="380" cy="365" rx="30" ry="18" className="fill-gray-100 stroke-gray-300" strokeWidth="2" />

        {/* Mindanao */}
        <path
          d="M320,400 Q380,390 420,420 Q440,450 420,480 Q380,500 340,490 Q320,470 320,440 Q315,420 320,400"
          className="fill-gray-100 stroke-gray-300"
          strokeWidth="2"
        />

        {/* Regional Data Points */}
        {philippinesRegions.map((region) => {
          const regionData = data.find(d => d.code === region.code)
          if (!regionData) return null

          const value = getMetricValue(regionData)
          const colorClass = getColorIntensity(value, maxValue)
          const isSelected = selectedRegion === region.code
          const radius = region.size === 'large' ? 20 : region.size === 'medium' ? 15 : 10

          return (
            <g key={region.code}>
              <circle
                cx={region.x}
                cy={region.y}
                r={radius}
                className={`${colorClass} stroke-gray-600 cursor-pointer transition-all duration-200 hover:stroke-gray-800 hover:stroke-2 ${
                  isSelected ? 'stroke-blue-600 stroke-3' : 'stroke-1'
                }`}
                filter="url(#shadow)"
                onClick={() => onRegionClick(region.code)}
              />
              
              {/* Region Label */}
              <text
                x={region.x}
                y={region.y - radius - 5}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700 pointer-events-none"
              >
                {region.name}
              </text>
              
              {/* Value Label */}
              <text
                x={region.x}
                y={region.y + 4}
                textAnchor="middle"
                className="text-xs font-bold fill-gray-900 pointer-events-none"
              >
                {formatValue(value)}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="120" height="80" className="fill-white stroke-gray-300" strokeWidth="1" rx="4" />
          <text x="10" y="15" className="text-xs font-medium fill-gray-700">
            {metric === 'revenue' ? 'Revenue' : 
             metric === 'growth' ? 'Growth Rate' :
             metric === 'stores' ? 'Store Count' : 'Population'}
          </text>
          <text x="10" y="30" className="text-xs fill-gray-500">
            Max: {formatValue(maxValue)}
          </text>
          <text x="10" y="45" className="text-xs fill-gray-500">
            Click to drill down
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm">
        <div className="font-medium text-gray-900">Interactive Map</div>
        <div className="text-gray-500 text-xs mt-1">
          Click regions to filter data
        </div>
        {selectedRegion && (
          <div className="text-blue-600 text-xs mt-1">
            Filtered: {selectedRegion}
          </div>
        )}
      </div>
    </div>
  )
}