"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StackedBarProps {
  labels: string[];
  series: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
  }>;
}

export default function StackedBar({ labels, series }: StackedBarProps) {
  return (
    <div className="stacked-bar-chart w-full h-96">
      <Bar
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { position: "bottom" },
            title: {
              display: true,
              text: 'Product Mix Revenue'
            }
          },
          scales: { 
            x: { stacked: true }, 
            y: { 
              stacked: true,
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₱' + Number(value).toLocaleString();
                }
              }
            }
          },
        }}
        data={{ 
          labels, 
          datasets: series.map((s, index) => ({
            ...s,
            backgroundColor: s.backgroundColor || `hsl(${index * 60}, 70%, 50%)`,
          }))
        }}
      />
    </div>
  );
}
