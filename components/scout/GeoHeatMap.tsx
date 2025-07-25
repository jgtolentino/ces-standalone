'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend);

interface RegionData {
  region_name: string;
  total_amount: number;
  population_density?: number;
  store_count?: number;
  transaction_count?: number;
}

interface GeoHeatMapProps {
  data?: RegionData[];
  height?: number;
}

export default function GeoHeatMap({ data, height = 400 }: GeoHeatMapProps) {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setRegionData(data);
      setLoading(false);
    } else {
      fetchRegionData();
    }
  }, [data]);

  const fetchRegionData = async () => {
    try {
      const response = await fetch('/api/scout/regional-performance');
      const result = await response.json();
      setRegionData(result.regions || []);
    } catch (error) {
      console.error('Failed to fetch region data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-gray-500">Loading regional data...</div>
      </div>
    );
  }

  // Philippine regions map layout (simplified)
  const regionLayout = {
    'NCR': { x: 50, y: 45, color: '#ef4444' },
    'Region I': { x: 45, y: 30, color: '#f97316' },
    'Region II': { x: 55, y: 25, color: '#f59e0b' },
    'Region III': { x: 48, y: 40, color: '#eab308' },
    'Region IV-A': { x: 52, y: 50, color: '#84cc16' },
    'Region IV-B': { x: 45, y: 55, color: '#22c55e' },
    'Region V': { x: 58, y: 55, color: '#10b981' },
    'CAR': { x: 50, y: 35, color: '#14b8a6' },
    'Region VI': { x: 40, y: 60, color: '#06b6d4' },
    'Region VII': { x: 45, y: 65, color: '#0ea5e9' },
    'Region VIII': { x: 52, y: 62, color: '#3b82f6' },
    'Region IX': { x: 35, y: 70, color: '#6366f1' },
    'Region X': { x: 40, y: 72, color: '#8b5cf6' },
    'Region XI': { x: 45, y: 75, color: '#a855f7' },
    'Region XII': { x: 38, y: 74, color: '#c084fc' },
    'Region XIII': { x: 50, y: 68, color: '#d946ef' },
    'BARMM': { x: 35, y: 76, color: '#ec4899' }
  };

  const maxRevenue = Math.max(...regionData.map(r => r.total_amount || 0));

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Philippine map outline (simplified) */}
        <path
          d="M 45,20 L 55,20 L 60,30 L 58,45 L 55,60 L 52,75 L 45,80 L 35,75 L 32,60 L 35,45 L 38,30 Z"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        
        {/* Region circles */}
        {Object.entries(regionLayout).map(([regionName, position]) => {
          const regionInfo = regionData.find(r => r.region_name === regionName);
          const revenue = regionInfo?.total_amount || 0;
          const intensity = revenue / maxRevenue;
          const radius = 3 + (intensity * 5);
          
          return (
            <g key={regionName}>
              <circle
                cx={position.x}
                cy={position.y}
                r={radius}
                fill={position.color}
                fillOpacity={0.3 + (intensity * 0.7)}
                stroke={position.color}
                strokeWidth="1"
                className="cursor-pointer hover:stroke-2 transition-all"
              >
                <title>
                  {regionName}: ₱{revenue.toLocaleString()}
                  {regionInfo?.population_density && 
                    `\nDensity: ${regionInfo.population_density.toFixed(2)} per km²`}
                </title>
              </circle>
              <text
                x={position.x}
                y={position.y + radius + 3}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                fontSize="2"
              >
                {regionName.replace('Region ', 'R')}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 flex justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-30 mr-1"></div>
          <span>Low Revenue</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-60 mr-1"></div>
          <span>Medium Revenue</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-90 mr-1"></div>
          <span>High Revenue</span>
        </div>
      </div>
    </div>
  );
}