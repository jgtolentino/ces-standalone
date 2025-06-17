"use client";
import useSWR from "swr";
import { fetchDAL } from "../lib/dal";
import StackedBar from "./charts/StackedBar";

export default function ProductMix() {
  const { data, error, isLoading } = useSWR(
    "product_mix",
    () => fetchDAL("product_mix", { query_type: "summary" }),
    { refreshInterval: 0 }
  );

  if (isLoading) return <div className="p-6"><p>Loading product mix...</p></div>;
  if (error) return <div className="p-6"><p>Error loading product mix data</p></div>;
  if (!data || data.length === 0) return <div className="p-6"><p>No product mix data available</p></div>;

  const labels = data.map((d: any) => d.brand);
  const series = [
    {
      label: "Revenue",
      data: data.map((d: any) => d.revenue),
      backgroundColor: "rgba(59, 130, 246, 0.8)",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Product Mix</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <StackedBar labels={labels} series={series} />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((product: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{product.brand}</h3>
            <p className="text-gray-600">{product.category}</p>
            <p className="text-2xl font-bold text-blue-600">
              ₱{product.revenue.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
