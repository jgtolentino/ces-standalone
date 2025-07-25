'use client';

import { useEffect, useState } from 'react';

interface RegionData {
  region: string;
  revenue: number;
  transactions: number;
  avgTransactionValue: number;
}

export default function RegionalMap() {
  const [data, setData] = useState<{ regions: RegionData[] } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scout/regional-performance')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load regional data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading regional data...</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...(data?.regions || []).map(r => r.revenue));

  return (
    <div className="relative h-64">
      {/* Simple regional representation */}
      <div className="grid grid-cols-3 gap-4 h-full">
        {data?.regions.map(region => {
          const intensity = region.revenue / maxRevenue;
          const bgColor = `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
          
          return (
            <div
              key={region.region}
              className="relative p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg"
              style={{ backgroundColor: bgColor }}
              onClick={() => setSelectedRegion(region.region)}
            >
              <div className="text-sm font-semibold text-gray-800">
                {region.region}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ₱{(region.revenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500">
                {region.transactions.toLocaleString()} orders
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected region details */}
      {selectedRegion && data && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{selectedRegion}</div>
              <div className="text-sm text-gray-600">
                Avg order: ₱{data.regions.find(r => r.region === selectedRegion)?.avgTransactionValue}
              </div>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}