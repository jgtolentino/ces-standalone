"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetchDAL } from "../lib/dal";
import StackedBar from "./charts/StackedBar";

export default function ProductMix() {
  const [filters, setFilters] = useState({
    timeframe: '30d',
    category: 'all',
    brand: 'all'
  })

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Product Mix & Basket Analysis</h1>
      
      {/* Horizontal Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-sm font-medium text-gray-700">Filters:</div>
          
          <select
            value={filters.timeframe}
            onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
            <option value="health">Health & Beauty</option>
          </select>
          
          <select
            value={filters.brand}
            onChange={(e) => setFilters({...filters, brand: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Brands</option>
            <option value="brand_a">Brand A</option>
            <option value="brand_b">Brand B</option>
            <option value="private_label">Private Label</option>
          </select>
          
          <button
            onClick={() => setFilters({timeframe: '30d', category: 'all', brand: 'all'})}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset filters
          </button>
        </div>
      </div>
      
      {/* Category Performance Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Category Performance Treemap</h2>
          <div className="h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">📊</div>
              <div className="font-medium">Interactive Treemap</div>
              <div className="text-sm">Size = Volume, Color = Performance</div>
              <div className="text-xs mt-2">Electronics (28%) | Fashion (22%) | Food (18%)</div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Categories</h2>
          <div className="space-y-3">
            {[
              {name: 'Electronics', revenue: 12500000, share: 28, growth: 18},
              {name: 'Fashion', revenue: 9800000, share: 22, growth: -5},
              {name: 'Food & Beverage', revenue: 8100000, share: 18, growth: 9},
              {name: 'Health & Beauty', revenue: 6200000, share: 14, growth: 14},
              {name: 'Home & Garden', revenue: 4900000, share: 11, growth: 6}
            ].map((category, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-600">₱{(category.revenue / 1000000).toFixed(1)}M ({category.share}%)</div>
                  </div>
                  <div className={`text-sm font-medium ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.growth > 0 ? '+' : ''}{category.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Substitution & Basket Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Substitution Flow */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Product Substitution Flow</h2>
          <div className="h-64 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">🔄</div>
              <div className="font-medium">Sankey Diagram</div>
              <div className="text-sm">Top 5 substitution patterns</div>
              <div className="text-xs mt-2">iPhone → Samsung (245) | Coke → Pepsi (189)</div>
            </div>
          </div>
        </div>

        {/* Basket Size Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basket Size Distribution</h2>
          <div className="space-y-2">
            {[
              {size: '1 item', percentage: 28, count: 8400},
              {size: '2-3 items', percentage: 35, count: 10500},
              {size: '4-5 items', percentage: 22, count: 6600},
              {size: '6+ items', percentage: 15, count: 4500}
            ].map((basket, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="text-sm font-medium">{basket.size}</div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${basket.percentage}%`}}></div>
                  </div>
                  <div className="text-sm text-gray-600 w-16">{basket.percentage}%</div>
                  <div className="text-xs text-gray-500 w-20">{basket.count.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
