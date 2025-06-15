'use client';

import { useState } from 'react';

const ScoutRetailDashboard = () => {
  const [isExpanded, setIsExpanded] = useState({
    executive: true,
    demographics: true,
    categories: true,
    regional: true,
    substitution: true,
    basket: true,
    ai: true
  });

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Scout Analytics</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Real-time Retail Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <form className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                    placeholder="Search products, brands, categories..." 
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Clear All
              </button>
              <div className="flex items-center">
                <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👤</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">Analytics Team</div>
                    <div className="text-xs text-gray-500">Admin</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <a className="flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 border-blue-500 text-blue-600" href="/">
              <span className="text-lg">📊</span>
              <div className="flex flex-col">
                <span className="font-semibold">Overview</span>
                <span className="text-xs text-gray-400">Executive Overview</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">4 Charts</span>
            </a>
            <a className="flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" href="/trends">
              <span className="text-lg">📈</span>
              <div className="flex flex-col">
                <span className="font-semibold">Trends</span>
                <span className="text-xs text-gray-400">Transaction Trends</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Time Series</span>
            </a>
            <a className="flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" href="/products">
              <span className="text-lg">📦</span>
              <div className="flex flex-col">
                <span className="font-semibold">Products</span>
                <span className="text-xs text-gray-400">Product Mix & SKU</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Analytics</span>
            </a>
            <a className="flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" href="/regional">
              <span className="text-lg">🗺️</span>
              <div className="flex flex-col">
                <span className="font-semibold">Regional</span>
                <span className="text-xs text-gray-400">Transaction Performance</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Interactive</span>
            </a>
            <a className="flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" href="/ai-assist">
              <span className="text-lg">🤖</span>
              <div className="flex flex-col">
                <span className="font-semibold">RetailBot</span>
                <span className="text-xs text-gray-400">AI Insights</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">AI Powered</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scout Analytics Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">AI-Powered Retail Intelligence Platform</p>
          </div>
          <div className="relative">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="hidden sm:inline">May 16, 2025 - Jun 15, 2025</span>
              <span className="sm:hidden">30 days</span>
              <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('executive')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">📊</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">KPI Cards</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Key performance indicators and business metrics</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.executive ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.executive && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
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
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🛒</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                            <dd className="text-lg font-medium text-gray-900">15,642</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-green-600 text-sm font-medium">+5.4%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">👥</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Active Customers</dt>
                            <dd className="text-lg font-medium text-gray-900">8,932</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-green-600 text-sm font-medium">+12.1%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📦</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Avg Basket</dt>
                            <dd className="text-lg font-medium text-gray-900">₱245</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-red-600 text-sm font-medium">-1.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Demographics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('demographics')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Demographics Overview</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Visual Summary</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">High-level customer distribution insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.demographics ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.demographics && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700">Total Customers</span>
                        <span className="font-semibold text-blue-900">29,060</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                        <span className="text-gray-700">Female Customers</span>
                        <span className="font-semibold text-pink-900">51.8% (15,060)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700">Male Customers</span>
                        <span className="font-semibold text-green-900">48.2% (14,000)</span>
                      </div>
                      <div className="mt-4 text-center">
                        <a href="/trends" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View detailed demographics & behavior analysis →</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('categories')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Categories</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Category Summary</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Revenue leaders and market share overview</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.categories ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.categories && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">Beverages</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">₱1.25M</div>
                          <div className="text-xs text-gray-500">32.4%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">Snacks</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">₱892K</div>
                          <div className="text-xs text-gray-500">23.2%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">Personal Care</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">₱756K</div>
                          <div className="text-xs text-gray-500">19.7%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">Household</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">₱567K</div>
                          <div className="text-xs text-gray-500">14.8%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regional Transaction Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('regional')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">🗺️</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Regional Transaction Performance</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Interactive Map</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Performance metrics by region with drill-down capabilities</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.regional ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.regional && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🗺️</div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">Philippines Regional Map</h4>
                          <p className="text-sm text-gray-500 mb-4">Click regions for detailed drill-down analysis</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600">
                              <div className="font-semibold">NCR</div>
                              <div>₱1.2M</div>
                            </div>
                            <div className="bg-green-500 text-white p-2 rounded cursor-pointer hover:bg-green-600">
                              <div className="font-semibold">Central Luzon</div>
                              <div>₱890K</div>
                            </div>
                            <div className="bg-purple-500 text-white p-2 rounded cursor-pointer hover:bg-purple-600">
                              <div className="font-semibold">Calabarzon</div>
                              <div>₱765K</div>
                            </div>
                            <div className="bg-orange-500 text-white p-2 rounded cursor-pointer hover:bg-orange-600">
                              <div className="font-semibold">Western Visayas</div>
                              <div>₱543K</div>
                            </div>
                            <div className="bg-red-500 text-white p-2 rounded cursor-pointer hover:bg-red-600">
                              <div className="font-semibold">Central Visayas</div>
                              <div>₱421K</div>
                            </div>
                            <div className="bg-indigo-500 text-white p-2 rounded cursor-pointer hover:bg-indigo-600">
                              <div className="font-semibold">Northern Mindanao</div>
                              <div>₱387K</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Top Performing Regions</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">1. NCR</span>
                            <span className="font-semibold text-green-600">₱1.2M</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">2. Central Luzon</span>
                            <span className="font-semibold text-green-600">₱890K</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">3. Calabarzon</span>
                            <span className="font-semibold text-green-600">₱765K</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Growth Trends</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Month over Month</span>
                            <span className="font-semibold text-green-600">+8.2%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Year over Year</span>
                            <span className="font-semibold text-green-600">+23.4%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SKU Substitution Network */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('substitution')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">🔄</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">SKU Substitution Network</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Network Analysis</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Product substitution patterns and recommendations</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.substitution ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.substitution && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Substitution Network</h4>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            Coca-Cola
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                            95%
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                            Pepsi
                          </div>
                          <div className="text-gray-400">↔</div>
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                            RC Cola
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Strong substitution pattern</p>
                          <p className="text-xs text-gray-500">67% cross-purchase rate</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Top Substitutions</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Coca-Cola → Pepsi</div>
                              <div className="text-xs text-gray-500">Rate: 67%</div>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">High</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Lay's → Piattos</div>
                              <div className="text-xs text-gray-500">Rate: 54%</div>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Medium</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Maggi → Lucky Me</div>
                              <div className="text-xs text-gray-500">Rate: 43%</div>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Medium</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basket Size Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('basket')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">🛒</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Basket Size Distribution</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Distribution Analysis</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Customer basket size patterns and trends</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.basket ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.basket && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Basket Size Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">1-2 items</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}}></div>
                            </div>
                            <span className="text-sm font-medium">35%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">3-5 items</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{width: '42%'}}></div>
                            </div>
                            <span className="text-sm font-medium">42%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">6-10 items</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{width: '18%'}}></div>
                            </div>
                            <span className="text-sm font-medium">18%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">11+ items</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{width: '5%'}}></div>
                            </div>
                            <span className="text-sm font-medium">5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>• Average basket size: <span className="font-semibold text-gray-900">4.2 items</span></div>
                          <div>• Most common: <span className="font-semibold text-gray-900">3-5 items (42%)</span></div>
                          <div>• Large baskets (11+): <span className="font-semibold text-gray-900">5% but ₱890 avg value</span></div>
                          <div>• Peak shopping time: <span className="font-semibold text-gray-900">Weekend evenings</span></div>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Revenue Impact</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Small baskets (1-2)</span>
                            <span className="font-semibold">₱124 avg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medium baskets (3-5)</span>
                            <span className="font-semibold">₱268 avg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Large baskets (6+)</span>
                            <span className="font-semibold">₱567 avg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced AI Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('ai')}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">🧠</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Advanced AI Analytics</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">AI Powered</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Machine learning insights and predictions</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.ai ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            {isExpanded.ai && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Demand Forecasting</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Next 7 days</span>
                          <span className="font-semibold text-green-600">↗ +12.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Next 30 days</span>
                          <span className="font-semibold text-blue-600">→ +4.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <span className="font-semibold text-purple-600">89.2%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Customer Segmentation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">High Value</span>
                          <span className="text-sm font-semibold">23.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Regular</span>
                          <span className="text-sm font-semibold">54.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Occasional</span>
                          <span className="text-sm font-semibold">22.4%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Churn Risk</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">High Risk</span>
                          <span className="font-semibold text-red-600">8.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Medium Risk</span>
                          <span className="font-semibold text-orange-600">15.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Low Risk</span>
                          <span className="font-semibold text-green-600">76.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Inventory Optimization</div>
                          <div className="text-xs text-gray-600">Increase Beverages stock by 15% for next week</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Cross-sell Opportunity</div>
                          <div className="text-xs text-gray-600">Bundle snacks with beverages for 23% uplift</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Customer Retention</div>
                          <div className="text-xs text-gray-600">Target high-risk customers with personalized offers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutRetailDashboard;