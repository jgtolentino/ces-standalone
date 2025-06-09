import React from 'react';
import { CampaignMetrics } from '../types';

interface MetricsChartProps {
  metrics: CampaignMetrics;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Campaign Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Conversions</p>
          <p className="text-xl font-bold">{metrics.conversions}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">ROI</p>
          <p className="text-xl font-bold">
            {((metrics.revenue - metrics.spend) / metrics.spend * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}; 