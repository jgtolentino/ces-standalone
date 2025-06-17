'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface RegionData {
  name: string
  code: string
  revenue: number
  growth: number
  coordinates: [number, number]
}

interface PhilippinesMapProps {
  regions: RegionData[]
  selectedRegion?: string
  onRegionClick?: (regionCode: string) => void
}

export default function PhilippinesMap({ regions, selectedRegion, onRegionClick }: PhilippinesMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [12.8797, 121.7740], // Philippines center
      zoom: 6,
      scrollWheelZoom: false,
      zoomControl: true
    })

    mapRef.current = map

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 10
    }).addTo(map)

    // Add region markers
    regions.forEach((region) => {
      const revenue = region.revenue / 1000000 // Convert to millions
      const growth = region.growth

      // Size based on revenue (min 8, max 25)
      const size = Math.max(8, Math.min(25, revenue / 2))

      // Color based on growth
      const color = growth > 10 ? '#22C55E' :  // Green
                   growth > 5 ? '#3B82F6' :   // Blue  
                   growth > 0 ? '#F59E0B' :   // Yellow
                   '#EF4444'                  // Red

      // Create circle marker
      const marker = L.circleMarker(region.coordinates, {
        radius: size,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)

      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${region.name}</h3>
          <p class="text-sm">Revenue: ₱${revenue.toFixed(1)}M</p>
          <p class="text-sm">Growth: ${growth > 0 ? '+' : ''}${growth.toFixed(1)}%</p>
          <p class="text-xs text-gray-500">Click to filter dashboard</p>
        </div>
      `)

      // Add click handler
      marker.on('click', () => {
        if (onRegionClick) {
          onRegionClick(region.code)
        }
      })

      // Highlight if selected
      if (selectedRegion === region.code) {
        marker.setStyle({
          weight: 4,
          color: '#1D4ED8'
        })
      }
    })

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [regions, selectedRegion, onRegionClick])

  return (
    <div className="w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <span>Growth Rate:</span>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>&lt;0%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>0-5%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>5-10%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>&gt;10%</span>
          </div>
        </div>
        <span>Size = Revenue</span>
      </div>
    </div>
  )
}