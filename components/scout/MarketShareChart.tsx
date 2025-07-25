'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MarketShareData {
  jti: number;
  tbwa: number;
  competitors: number;
}

export default function MarketShareChart() {
  const [data, setData] = useState<MarketShareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scout/market-share')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load market share data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading market share data...</div>
      </div>
    );
  }

  const chartData = data ? [
    { name: 'JTI', value: data.jti, color: '#ef4444' },
    { name: 'TBWA (non-JTI)', value: data.tbwa, color: '#3b82f6' },
    { name: 'Competitors', value: data.competitors, color: '#6b7280' }
  ] : [];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}