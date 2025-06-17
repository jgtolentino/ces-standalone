"use client";
import useSWR from "swr";
import { fetchDAL } from "../lib/dal";
import Heatmap from "./charts/Heatmap";

export default function Consumers() {
  const { data, error, isLoading } = useSWR(
    "audience_insights",
    () => fetchDAL("audience_insights", { query_type: "demographics" }),
    { refreshInterval: 0 }
  );

  if (isLoading) return <div className="p-6"><p>Loading consumer insights...</p></div>;
  if (error) return <div className="p-6"><p>Error loading consumer data</p></div>;
  if (!data || data.length === 0) return <div className="p-6"><p>No consumer data available</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Consumer Insights</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <Heatmap matrix={data} />
      </div>
    </div>
  );
}
