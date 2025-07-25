'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GenderData {
  male: number;
  female: number;
  other?: number;
}

interface GenderDonutProps {
  data?: GenderData;
  title?: string;
}

export default function GenderDonut({ data, title = "Gender Distribution" }: GenderDonutProps) {
  const [genderData, setGenderData] = useState<GenderData>({ male: 58, female: 42 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setGenderData(data);
      setLoading(false);
    } else {
      fetchGenderData();
    }
  }, [data]);

  const fetchGenderData = async () => {
    try {
      const response = await fetch('/api/scout/demographics?type=gender');
      const result = await response.json();
      if (result.gender) {
        setGenderData(result.gender);
      }
    } catch (error) {
      console.error('Failed to fetch gender data:', error);
      // Use default data
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Male', 'Female', ...(genderData.other ? ['Other'] : [])],
    datasets: [
      {
        data: [genderData.male, genderData.female, ...(genderData.other ? [genderData.other] : [])],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue for male
          'rgba(236, 72, 153, 0.8)', // Pink for female
          'rgba(107, 114, 128, 0.8)'  // Gray for other
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
    cutout: '60%',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading gender data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {genderData.male}%
            </div>
            <div className="text-sm text-gray-500">Male</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-700">Male: {genderData.male}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-pink-500 rounded mr-2"></div>
          <span className="text-gray-700">Female: {genderData.female}%</span>
        </div>
      </div>
    </div>
  );
}