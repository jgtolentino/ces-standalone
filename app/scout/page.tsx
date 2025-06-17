/**
 * Scout Dashboard Page
 * Enhanced Scout features with multi-agent integration
 * Follows Visual Artist Excellence Standard
 */

import { Metadata } from 'next';
import Overview from '@/components/Overview';
import KpiCard from '@/components/KpiCard';

export const metadata: Metadata = {
  title: 'Scout Dashboard - Scout Analytics',
  description: 'Enhanced Scout Analytics dashboard with AI-powered multi-agent insights',
};

export default function ScoutDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scout Dashboard
        </h1>
        <p className="text-gray-600">
          Enhanced Scout Analytics with multi-agent AI integration and real-time insights
        </p>
      </div>
      
      {/* Enhanced KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KpiCard
          label="Total Revenue"
          value="$2.4M"
        />
        <KpiCard
          label="Campaign ROI"
          value="340%"
        />
        <KpiCard
          label="Market Share"
          value="23.8%"
        />
        <KpiCard
          label="AI Confidence"
          value="94%"
        />
        <KpiCard
          label="Active Stores"
          value="1,247"
        />
        <KpiCard
          label="Performance Score"
          value="8.7/10"
        />
      </div>

      {/* Multi-Agent Integration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ScoutBot Integration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">ScoutBot Assistant</h2>
              <p className="text-sm text-gray-600">Executive AI insights and analysis</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                "Revenue trends show strong Q4 performance with 12.5% growth driven by holiday campaigns."
              </p>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Ask ScoutBot
            </button>
          </div>
        </div>

        {/* Claudia Creative Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">🎨</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Claudia Creative</h2>
              <p className="text-sm text-gray-600">Brand compliance and visual scoring</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                "Latest campaign achieves 95% brand compliance with strong visual impact scores."
              </p>
            </div>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Analyze Creative
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Enhanced Analytics Overview</h2>
        <Overview />
      </div>

      {/* Agent Status Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">AI Agent Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ScoutBot Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">ScoutBot</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-600">Executive insights and reporting</p>
            <div className="mt-2 text-xs text-gray-500">Last update: 2 min ago</div>
          </div>

          {/* CESAI Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">CESAI</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-600">Consumer insights analysis</p>
            <div className="mt-2 text-xs text-gray-500">Last update: 5 min ago</div>
          </div>

          {/* Claudia Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Claudia</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-600">Creative orchestration</p>
            <div className="mt-2 text-xs text-gray-500">Last update: 1 min ago</div>
          </div>

          {/* ForecastBot Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">ForecastBot</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-600">Predictive analytics</p>
            <div className="mt-2 text-xs text-gray-500">Last update: 3 min ago</div>
          </div>

          {/* Caca Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Caca</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-600">Quality assurance</p>
            <div className="mt-2 text-xs text-gray-500">Last update: 4 min ago</div>
          </div>

          {/* Kalaw Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Kalaw</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-600">Content validation</p>
            <div className="mt-2 text-xs text-gray-500">Last update: 6 min ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
