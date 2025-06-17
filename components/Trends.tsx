"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetchDAL } from "../lib/dal";
import LineChart from "./charts/LineChart";
import ForecastPanel from "./ForecastPanel";

export default function Trends() {
  const [filters, setFilters] = useState({
    timeframe: '30d',
    region: 'all',
    metric: 'revenue'
  })

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
            <option value="365d">Last year</option>
          </select>
          
          <select
            value={filters.region}
            onChange={(e) => setFilters({...filters, region: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Regions</option>
            <option value="metro_manila">Metro Manila</option>
            <option value="cebu">Cebu</option>
            <option value="davao">Davao</option>
            <option value="other">Other Regions</option>
          </select>
          
          <select
            value={filters.metric}
            onChange={(e) => setFilters({...filters, metric: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="aov">Average Order Value</option>
            <option value="conversion">Conversion Rate</option>
          </select>
          
          <button
            onClick={() => setFilters({timeframe: '30d', region: 'all', metric: 'revenue'})}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset filters
          </button>
        </div>
      </div>
      
      {/* Regional Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Map */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Regional Performance Map</h2>
          <div className="h-64 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="font-medium">Philippines Heat Map</div>
              <div className="text-sm">Click regions to drill down</div>
              <div className="text-xs mt-2">Metro Manila: ₱15.8M | Cebu: ₱8.2M | Davao: ₱6.1M</div>
            </div>
          </div>
        </div>

        {/* Top Cities Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Performing Cities</h2>
          <div className="space-y-3">
            {[
              {city: 'Manila', revenue: 15800000, growth: 12.3},
              {city: 'Quezon City', revenue: 12400000, growth: 8.7},
              {city: 'Cebu City', revenue: 8200000, growth: 15.2},
              {city: 'Davao City', revenue: 6100000, growth: 6.8},
              {city: 'Makati', revenue: 5900000, growth: 11.4}
            ].map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{city.city}</div>
                  <div className="text-sm text-gray-600">₱{(city.revenue / 1000000).toFixed(1)}M</div>
                </div>
                <div className={`text-sm font-medium ${city.growth > 10 ? 'text-green-600' : city.growth > 5 ? 'text-blue-600' : 'text-gray-600'}`}>
                  +{city.growth}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
