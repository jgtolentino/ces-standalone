"use client";
import React from 'react';

interface HeatmapProps {
  matrix: Array<{
    dimension: string;
    segment: string;
    count: number;
    performance_score: number;
  }>;
}

export default function Heatmap({ matrix }: HeatmapProps) {
  // Group data by dimension for better visualization
  const groupedData = matrix.reduce((acc, item) => {
    if (!acc[item.dimension]) {
      acc[item.dimension] = [];
    }
    acc[item.dimension].push(item);
    return acc;
  }, {} as Record<string, typeof matrix>);

  const getIntensityColor = (score: number) => {
    const intensity = Math.min(score / 100, 1); // Normalize to 0-1
    return `rgba(59, 130, 246, ${intensity})`;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Consumer Demographics Heatmap</h3>
      <div className="space-y-6">
        {Object.entries(groupedData).map(([dimension, items]) => (
          <div key={dimension} className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3 capitalize">{dimension}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded text-center text-sm"
                  style={{
                    backgroundColor: getIntensityColor(item.performance_score),
                    color: item.performance_score > 50 ? 'white' : 'black'
                  }}
                >
                  <div className="font-medium">{item.segment}</div>
                  <div className="text-xs mt-1">
                    {item.count.toLocaleString()} users
                  </div>
                  <div className="text-xs">
                    Score: {item.performance_score.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
