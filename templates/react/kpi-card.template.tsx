// AUTO-GENERATED KPI Card Template
// Generator: YAML-to-React Builder
// Agent: Dash (UI Generator)

import { useState, useEffect } from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  change: number;
  unit?: string;
  format?: 'currency' | 'percentage' | 'number';
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  chartData?: number[];
  target?: number;
}

export default function KPICard({
  title,
  value,
  change,
  unit = '',
  format = 'number',
  icon = '📊',
  trend = 'neutral',
  chartData,
  target
}: KPICardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        
        {target && (
          <div className="text-xs text-gray-500">
            Target: {formatValue(target)}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </span>
          {unit && (
            <span className="text-sm text-gray-500">{unit}</span>
          )}
        </div>

        <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
          <span>{getTrendIcon()}</span>
          <span>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      </div>

      {chartData && chartData.length > 0 && (
        <div className="mt-4 h-8 flex items-end space-x-1">
          {chartData.slice(-12).map((dataPoint, index) => {
            const height = Math.max(4, (dataPoint / Math.max(...chartData)) * 32);
            return (
              <div
                key={index}
                className="bg-blue-500 rounded-sm flex-1 opacity-70 hover:opacity-100 transition-opacity"
                style={{ height: `${height}px` }}
                title={`${formatValue(dataPoint)}`}
              />
            );
          })}
        </div>
      )}

      {target && typeof value === 'number' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress to Target</span>
            <span>{((value / target) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                value >= target ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (value / target) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}