"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  confidence_lower: number;
  confidence_upper: number;
  is_forecast: boolean;
}

interface ForecastLineChartProps {
  data: ForecastData[];
  metric: string;
  period: '30' | '60' | '90';
}

export default function ForecastLineChart({ data, metric, period }: ForecastLineChartProps) {
  const labels = data.map(d => d.date);
  
  // Split historical vs forecast data
  const historicalData = data.filter(d => !d.is_forecast);
  const forecastData = data.filter(d => d.is_forecast);
  
  // Create chart datasets
  const datasets = [
    // Historical actual data
    {
      label: `Actual ${metric}`,
      data: data.map(d => d.is_forecast ? null : d.actual || d.predicted),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 3,
    },
    // Forecast predictions
    {
      label: `Predicted ${metric}`,
      data: data.map(d => d.is_forecast ? d.predicted : null),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointStyle: 'triangle',
    },
    // Confidence interval upper bound
    {
      label: 'Confidence Upper',
      data: data.map(d => d.is_forecast ? d.confidence_upper : null),
      borderColor: 'rgba(239, 68, 68, 0.3)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      fill: '+1',
      tension: 0.4,
      pointRadius: 0,
    },
    // Confidence interval lower bound
    {
      label: 'Confidence Lower',
      data: data.map(d => d.is_forecast ? d.confidence_lower : null),
      borderColor: 'rgba(239, 68, 68, 0.3)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      fill: false,
      tension: 0.4,
      pointRadius: 0,
    },
  ];

  const formatValue = (value: any) => {
    if (metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('aov')) {
      return '₱' + Number(value).toLocaleString();
    }
    if (metric.toLowerCase().includes('roi')) {
      return Number(value).toFixed(1) + '%';
    }
    return Number(value).toLocaleString();
  };

  return (
    <div className="forecast-chart-container w-full h-96">
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
          plugins: {
            title: {
              display: true,
              text: `${metric} Forecast (${period} days)`,
              font: {
                size: 16,
                weight: 'bold',
              },
            },
            legend: {
              position: 'bottom' as const,
              labels: {
                filter: (legendItem) => {
                  // Hide confidence bound labels from legend
                  return !legendItem.text?.includes('Confidence');
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (value !== null) {
                    return `${label}: ${formatValue(value)}`;
                  }
                  return '';
                },
                afterBody: function(tooltipItems) {
                  const dataPoint = data[tooltipItems[0].dataIndex];
                  if (dataPoint && dataPoint.is_forecast) {
                    return [
                      '',
                      `Confidence Range:`,
                      `${formatValue(dataPoint.confidence_lower)} - ${formatValue(dataPoint.confidence_upper)}`,
                    ];
                  }
                  return [];
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: metric,
              },
              ticks: {
                callback: function(value) {
                  return formatValue(value);
                },
              },
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          elements: {
            point: {
              hoverRadius: 6,
            },
          },
        }}
        data={{
          labels,
          datasets,
        }}
      />
    </div>
  );
}