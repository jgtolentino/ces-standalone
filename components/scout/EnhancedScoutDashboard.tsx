'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Eye, 
  MessageSquare,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Target
} from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import StackedBar from '@/components/charts/StackedBar';
import Heatmap from '@/components/charts/Heatmap';
import KpiCard from '@/components/KpiCard';

interface DashboardData {
  overview: {
    totalTransactions: number;
    totalRevenue: number;
    activeUsers: number;
    conversionRate: number;
  };
  trends: {
    labels: string[];
    datasets: any[];
  };
  regions: {
    name: string;
    value: number;
    change: number;
  }[];
  brands: {
    name: string;
    marketShare: number;
    performance: number;
  }[];
}

interface EnhancedScoutDashboardProps {
  initialData?: DashboardData;
  refreshInterval?: number;
  enableRealTime?: boolean;
  userRole?: 'admin' | 'analyst' | 'viewer';
}

export default function EnhancedScoutDashboard({
  initialData,
  refreshInterval = 300000, // 5 minutes
  enableRealTime = true,
  userRole = 'viewer'
}: EnhancedScoutDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scout/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: selectedRegion,
          brand: selectedBrand,
          dateRange: dateRange
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data for development
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockData = (): DashboardData => ({
    overview: {
      totalTransactions: 15420,
      totalRevenue: 2840000,
      activeUsers: 8950,
      conversionRate: 3.2
    },
    trends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [450000, 520000, 480000, 610000, 580000, 650000],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }
      ]
    },
    regions: [
      { name: 'NCR', value: 45.2, change: 5.8 },
      { name: 'Region 3', value: 23.1, change: 2.3 },
      { name: 'Region 4A', value: 18.7, change: -1.2 },
      { name: 'Visayas', value: 8.9, change: 3.1 },
      { name: 'Mindanao', value: 4.1, change: 1.8 }
    ],
    brands: [
      { name: 'Alaska', marketShare: 28.5, performance: 92 },
      { name: 'Oishi', marketShare: 22.3, performance: 88 },
      { name: 'Del Monte', marketShare: 19.8, performance: 85 },
      { name: 'Peerless', marketShare: 15.2, performance: 78 },
      { name: 'JTI', marketShare: 14.2, performance: 82 }
    ]
  });

  // Initialize data on mount
  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [selectedRegion, selectedBrand, dateRange]);

  // Set up real-time updates
  useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [enableRealTime, refreshInterval, selectedRegion, selectedBrand, dateRange]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle export functionality
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const response = await fetch('/api/scout/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          data: data,
          filters: { region: selectedRegion, brand: selectedBrand, dateRange }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scout-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Scout Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scout Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time retail intelligence for Philippine market
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Updated {lastUpdated.toLocaleTimeString()}
          </Badge>
          
          {userRole === 'admin' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Regions</option>
                <option value="ncr">NCR</option>
                <option value="region3">Region 3</option>
                <option value="region4a">Region 4A</option>
                <option value="visayas">Visayas</option>
                <option value="mindanao">Mindanao</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Brands</option>
                <option value="alaska">Alaska</option>
                <option value="oishi">Oishi</option>
                <option value="delMonte">Del Monte</option>
                <option value="peerless">Peerless</option>
                <option value="jti">JTI</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Overview */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            label="Total Transactions"
            value={data.overview.totalTransactions.toLocaleString()}
          />
          <KpiCard
            label="Revenue"
            value={`₱${(data.overview.totalRevenue / 1000000).toFixed(1)}M`}
          />
          <KpiCard
            label="Active Users"
            value={data.overview.activeUsers.toLocaleString()}
          />
          <KpiCard
            label="Conversion Rate"
            value={`${data.overview.conversionRate}%`}
          />
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Regions
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Brands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                {data && (
                  <LineChart
                    labels={data.trends.labels}
                    values={data.trends.datasets[0]?.data || []}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Market share by region</CardDescription>
              </CardHeader>
              <CardContent>
                {data && (
                  <div className="space-y-4">
                    {data.regions.map((region) => (
                      <div key={region.name} className="flex items-center justify-between">
                        <span className="font-medium">{region.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {region.value}%
                          </span>
                          <Badge variant={region.change > 0 ? "default" : "destructive"}>
                            {region.change > 0 ? '+' : ''}{region.change}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Detailed trend analysis across metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {data && (
                <StackedBar
                  labels={data.trends.labels}
                  series={data.trends.datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: dataset.backgroundColor
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Heatmap</CardTitle>
              <CardDescription>Performance intensity by region</CardDescription>
            </CardHeader>
            <CardContent>
              {data && (
                <Heatmap
                  matrix={data.regions.map(region => ({
                    dimension: 'region',
                    segment: region.name,
                    count: Math.floor(region.value * 1000),
                    performance_score: region.value
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Performance</CardTitle>
              <CardDescription>Market share and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {data && (
                <div className="space-y-4">
                  {data.brands.map((brand) => (
                    <div key={brand.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{brand.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Market Share: {brand.marketShare}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{brand.performance}</div>
                        <div className="text-sm text-muted-foreground">Performance Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
