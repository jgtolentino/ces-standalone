'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

interface RadarChartProps {
  data: any;
  options?: any;
  className?: string;
}

export default function RadarChart({ data, options, className = '' }: RadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Multi-dimensional performance radar chart',
        },
        legend: {
          position: 'top' as const,
        },
      },
    };

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'radar', // Default type, can be customized
      data,
      options: { ...defaultOptions, ...options },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, options]);

  return (
    <div className={`chart-container ${className}`}>
      <canvas ref={chartRef} />
    </div>
  );
}