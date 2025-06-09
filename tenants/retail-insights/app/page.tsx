'use client';

import React from 'react';

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Philippines Retail Insights Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive retail analytics and IoT device management platform for the Philippines market. 
              Monitor trends, analyze consumer behavior, and optimize your retail strategy.
            </p>
          </div>

          {/* Migration Status */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Migration Status</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Next.js App Structure ✓</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Tailwind Configuration ✓</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Package Structure ✓</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Component Migration (In Progress)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>API Migration (Pending)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Database Migration (Pending)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Brands Analysis', href: '/(dashboard)/brands', status: 'pending' },
              { title: 'Market Trends', href: '/(dashboard)/trends', status: 'pending' },
              { title: 'Consumer Insights', href: '/(dashboard)/consumer-insights', status: 'pending' },
              { title: 'Product Mix', href: '/(dashboard)/product-mix', status: 'pending' },
            ].map((item, index) => (
              <div key={index} className="bg-card border rounded-lg p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.status === 'pending' ? 'Migration in progress...' : 'Ready for use'}
                </p>
                <div className={`text-xs px-2 py-1 rounded ${
                  item.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.status === 'pending' ? 'Pending' : 'Ready'}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Details */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Technical Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Framework Stack</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Next.js 14.2.15 (App Router)</li>
                  <li>• React 18.3.1</li>
                  <li>• TypeScript 5.6.3</li>
                  <li>• Tailwind CSS 3.4.14</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Key Dependencies</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Supabase (Database)</li>
                  <li>• Radix UI (Components)</li>
                  <li>• Recharts (Visualization)</li>
                  <li>• Zustand (State Management)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}