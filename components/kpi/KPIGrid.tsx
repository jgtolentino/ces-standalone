'use client';

import KpiCard from '../KpiCard';
import { useState, useEffect } from 'react';

interface KPIData {
  ltv: number;
  cac: number;
  marketShare: number;
  margin: number;
  stores: number;
}

export default function KPIGrid() {
  const [data, setData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        ltv: 1250.50,
        cac: 85.30,
        marketShare: 12.4,
        margin: 23.7,
        stores: 847
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col p-4 bg-white rounded shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        Error loading KPI data
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <KpiCard
        label="💰 Customer Lifetime Value"
        value={`$${data.ltv.toLocaleString()}`}
      />
      <KpiCard
        label="🎯 Customer Acquisition Cost"
        value={`$${data.cac.toFixed(2)}`}
      />
      <KpiCard
        label="📈 Market Share"
        value={`${data.marketShare.toFixed(1)}%`}
      />
      <KpiCard
        label="💹 Profit Margin"
        value={`${data.margin.toFixed(1)}%`}
      />
      <KpiCard
        label="🏪 Active Stores"
        value={data.stores.toLocaleString()}
      />
    </div>
  );
}