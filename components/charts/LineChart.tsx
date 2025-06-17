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

interface LineChartProps {
  labels: string[];
  values: number[];
}

export default function LineChart({ labels, values }: LineChartProps) {
  return (
    <div className="line-chart-container w-full h-96">
      <Line
        options={{ 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            title: {
              display: true,
              text: 'Revenue Trends Over Time'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₱' + Number(value).toLocaleString();
                }
              }
            }
          }
        }}
        data={{
          labels,
          datasets: [{
            data: values,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
          }],
        }}
      />
    </div>
  );
}
