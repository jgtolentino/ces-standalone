"use client";
import useSWR from "swr";
import { fetchDAL } from "../lib/dal";
import LineChart from "./charts/LineChart";
import ForecastPanel from "./ForecastPanel";

export default function Trends() {
  const { data, error, isLoading } = useSWR(
    "campaign_performance",
    () => fetchDAL("campaign_performance", { query_type: "main" }),
    { refreshInterval: 0 }
  );

  if (isLoading) return <div className="p-6"><p>Loading trends...</p></div>;
  if (error) return <div className="p-6"><p>Error loading trends data</p></div>;
  if (!data || data.length === 0) return <div className="p-6"><p>No trends data available</p></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Revenue Trends & Forecasting</h1>
      
      {/* Historical Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Historical Performance</h2>
        <LineChart
          labels={data.map((d: any) => new Date(d.date).toLocaleDateString())}
          values={data.map((d: any) => d.revenue)}
        />
      </div>

      {/* Predictive Forecasting */}
      <ForecastPanel />
    </div>
  );
}
