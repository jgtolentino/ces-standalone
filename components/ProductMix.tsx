"use client";
import useSWR from "swr";
import { fetchDAL } from "../lib/dal";
import StackedBar from "./charts/StackedBar";

export default function ProductMix() {
  const { data, error, isLoading } = useSWR(
    "channel_analytics",
    () => fetchDAL("channel_analytics", { query_type: "summary" }),
    { refreshInterval: 0 }
  );

  if (isLoading) return <div className="p-6"><p>Loading product mix...</p></div>;
  if (error) return <div className="p-6"><p>Error loading product mix data</p></div>;
  if (!data || data.length === 0) return <div className="p-6"><p>No product mix data available</p></div>;

  const labels = data.map((d: any) => d.channel);
  const series = [
    {
      label: "Revenue",
      data: data.map((d: any) => d.total_revenue),
      backgroundColor: "rgba(59, 130, 246, 0.8)",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Channel Analytics</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <StackedBar labels={labels} series={series} />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((channel: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{channel.channel}</h3>
            <p className="text-gray-600">{channel.campaign_count} campaigns</p>
            <p className="text-2xl font-bold text-blue-600">
              ₱{channel.total_revenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              ROI: {channel.channel_roi?.toFixed(2)}x
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
