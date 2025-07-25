'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import MarketShareChart from './MarketShareChart';
import RegionalMap from './RegionalMap';

interface DashboardSection {
  id: string;
  name: string;
  icon: string;
  path: string;
}

const sections: DashboardSection[] = [
  { id: 'overview', name: 'Overview', icon: '📊', path: '/scout' },
  { id: 'trends', name: 'Trends', icon: '📈', path: '/scout/trends' },
  { id: 'product-mix', name: 'Product Mix', icon: '🛒', path: '/scout/products' },
  { id: 'consumers', name: 'Consumers', icon: '👥', path: '/scout/consumers' },
  { id: 'retailbot', name: 'RetailBot', icon: '🤖', path: '/scout/retailbot' }
];

interface FilterBarProps {
  currentSection: string;
}

function FilterBar({ currentSection }: FilterBarProps) {
  const [filters, setFilters] = useState({
    dateRange: '30d',
    region: 'all',
    brand: 'all',
    category: 'all'
  });

  const getAvailableFilters = () => {
    switch (currentSection) {
      case 'trends':
        return ['dateRange', 'region'];
      case 'product-mix':
        return ['dateRange', 'brand', 'category'];
      case 'consumers':
        return ['dateRange', 'region'];
      default:
        return ['dateRange'];
    }
  };

  const availableFilters = getAvailableFilters();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-4">
        {availableFilters.includes('dateRange') && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        )}

        {availableFilters.includes('region') && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Region:</label>
            <select 
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All Regions</option>
              <option value="ncr">NCR</option>
              <option value="region1">Region 1</option>
              <option value="region4a">Region 4A</option>
            </select>
          </div>
        )}

        {availableFilters.includes('brand') && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Brand:</label>
            <select 
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All Brands</option>
              <option value="nestle">Nestlé</option>
              <option value="unilever">Unilever</option>
              <option value="pg">P&G</option>
            </select>
          </div>
        )}

        {availableFilters.includes('category') && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All Categories</option>
              <option value="beverages">Beverages</option>
              <option value="snacks">Snacks</option>
              <option value="personal-care">Personal Care</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function Sidebar({ currentSection, onSectionChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold">Scout Analytics</h1>
                <p className="text-xs text-gray-400">v3.1.0</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 transform rotate-90" />
            )}
          </button>
        </div>
      </div>

      <nav className="mt-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
              currentSection === section.id ? 'bg-gray-800 border-r-2 border-blue-500' : ''
            }`}
            title={isCollapsed ? section.name : undefined}
          >
            <span className="text-lg mr-3">{section.icon}</span>
            {!isCollapsed && (
              <span className="text-sm font-medium">{section.name}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">₱3.84M</dd>
              </dl>
            </div>
            <div className="flex-shrink-0">
              <span className="text-green-600 text-sm font-medium">+8.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🛒</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Market Share</dt>
                <dd className="text-lg font-medium text-gray-900">23.4%</dd>
              </dl>
            </div>
            <div className="flex-shrink-0">
              <span className="text-green-600 text-sm font-medium">+1.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📈</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Stores</dt>
                <dd className="text-lg font-medium text-gray-900">1,247</dd>
              </dl>
            </div>
            <div className="flex-shrink-0">
              <span className="text-green-600 text-sm font-medium">+12</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">AI Confidence</dt>
                <dd className="text-lg font-medium text-gray-900">94%</dd>
              </dl>
            </div>
            <div className="flex-shrink-0">
              <span className="text-green-600 text-sm font-medium">High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share Distribution</h3>
            <MarketShareChart />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance Overview</h3>
            <RegionalMap />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Revenue Heatmap</h3>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">GeoHeatMap Component - Population-weighted revenue overlay</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Cities Performance</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Regional Bar Chart - Drill-down to barangay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductMixSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Share by Category</h3>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Treemap - Size: volume, Color: performance delta</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Categories</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Category Revenue Chart</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basket Size Distribution</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Histogram - Basket Size Distribution</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SKU Substitution Flow</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Sankey Diagram - Top 5 substitution patterns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsumersSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumer Demographics</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Demographics Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RetailBotSection() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage = { type: 'user' as const, content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // Simulate AI response
      setTimeout(() => {
        const botMessage = { 
          type: 'bot' as const, 
          content: `Based on your query "${userMessage.content}", I can see that regional performance shows NCR leading with ₱1.2M revenue, while Mindanao has the highest growth at +18%. This insight is derived from our streaming data with 85% confidence.`, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-gray-900">RetailBot</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
          </div>

          <div className="space-y-4 h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Ask RetailBot about your retail analytics data</p>
                <p className="text-sm">Try: "What are the top performing regions?" or "Show me category trends"</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-500">RetailBot is analyzing...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about retail analytics, trends, or performance..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">📚</span>
            <h3 className="text-lg font-semibold text-gray-900">LearnBot</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Tutorial Assistant</span>
          </div>
          <p className="text-gray-600 mb-4">Get contextual help and tutorials for each dashboard section.</p>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-sm">Overview Tutorial</div>
              <div className="text-xs text-gray-500">Learn about KPI cards</div>
            </button>
            <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-sm">Trends Guide</div>
              <div className="text-xs text-gray-500">Regional analysis tips</div>
            </button>
            <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-sm">Product Mix Help</div>
              <div className="text-xs text-gray-500">Treemap navigation</div>
            </button>
            <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-sm">Filter Usage</div>
              <div className="text-xs text-gray-500">Context-sensitive filters</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScoutDashboardV3() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return <OverviewSection />;
      case 'trends':
        return <TrendsSection />;
      case 'product-mix':
        return <ProductMixSection />;
      case 'consumers':
        return <ConsumersSection />;
      case 'retailbot':
        return <RetailBotSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <FilterBar currentSection={currentSection} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}