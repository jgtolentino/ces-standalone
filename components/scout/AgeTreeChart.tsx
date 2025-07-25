'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AgeGroupData {
  ageGroup: string;
  male: number;
  female: number;
  totalSpend: number;
  avgSpend: number;
}

interface AgeTreeChartProps {
  data?: AgeGroupData[];
  title?: string;
}

export default function AgeTreeChart({ data, title = "Age Distribution Analysis" }: AgeTreeChartProps) {
  const [ageData, setAgeData] = useState<AgeGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setAgeData(data);
      setLoading(false);
    } else {
      fetchAgeData();
    }
  }, [data]);

  const fetchAgeData = async () => {
    try {
      const response = await fetch('/api/scout/demographics?type=age');
      const result = await response.json();
      if (result.ageGroups) {
        setAgeData(result.ageGroups);
      } else {
        // Use default data
        setAgeData([
          { ageGroup: '18-24', male: 15, female: 12, totalSpend: 450000, avgSpend: 245 },
          { ageGroup: '25-34', male: 22, female: 18, totalSpend: 980000, avgSpend: 310 },
          { ageGroup: '35-44', male: 18, female: 15, totalSpend: 820000, avgSpend: 385 },
          { ageGroup: '45-54', male: 12, female: 10, totalSpend: 560000, avgSpend: 420 },
          { ageGroup: '55+', male: 8, female: 6, totalSpend: 340000, avgSpend: 380 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch age data:', error);
      // Use default data
      setAgeData([
        { ageGroup: '18-24', male: 15, female: 12, totalSpend: 450000, avgSpend: 245 },
        { ageGroup: '25-34', male: 22, female: 18, totalSpend: 980000, avgSpend: 310 },
        { ageGroup: '35-44', male: 18, female: 15, totalSpend: 820000, avgSpend: 385 },
        { ageGroup: '45-54', male: 12, female: 10, totalSpend: 560000, avgSpend: 420 },
        { ageGroup: '55+', male: 8, female: 6, totalSpend: 340000, avgSpend: 380 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ageData.map(d => d.ageGroup),
    datasets: [
      {
        label: 'Male',
        data: ageData.map(d => d.male),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Female',
        data: ageData.map(d => d.female),
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const ageGroup = ageData[index];
            return [
              `Total Spend: ₱${ageGroup.totalSpend.toLocaleString()}`,
              `Avg Spend: ₱${ageGroup.avgSpend}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: false,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading age distribution data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-5 gap-2 text-xs">
        {ageData.map((age) => (
          <div key={age.ageGroup} className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold">{age.ageGroup}</div>
            <div className="text-gray-600">₱{(age.totalSpend / 1000).toFixed(0)}K</div>
            <div className="text-gray-500">Avg: ₱{age.avgSpend}</div>
          </div>
        ))}
      </div>
    </div>
  );
}