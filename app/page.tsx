'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Users, DollarSign, Eye, Clock, Zap } from 'lucide-react';

interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  averageROI: number;
  conversionRate: number;
  totalSpend: number;
  impressions: number;
  clicks: number;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  channel: string;
  budget: number;
  spent: number;
  roi: number;
  reach: number;
  conversions: number;
  startDate: string;
  endDate: string;
}

export default function CESHomePage() {
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReach: 0,
    averageROI: 0,
    conversionRate: 0,
    totalSpend: 0,
    impressions: 0,
    clicks: 0
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real campaign data from API
    const loadCampaignData = async () => {
      try {
        const response = await fetch('/api/campaigns?limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        
        const data = await response.json();
        
        // Set metrics from API aggregates
        setMetrics({
          totalCampaigns: data.aggregates.totalCampaigns,
          activeCampaigns: data.aggregates.activeCampaigns,
          totalReach: data.aggregates.totalReach,
          averageROI: data.aggregates.averageROI,
          conversionRate: data.aggregates.overallConversionRate,
          totalSpend: data.aggregates.totalSpend,
          impressions: data.aggregates.totalImpressions,
          clicks: data.aggregates.totalClicks
        });
        
        // Map campaign data to expected format
        const mappedCampaigns = data.campaigns.map((campaign: any) => ({
          id: campaign.campaign_id,
          name: campaign.campaign_name,
          status: campaign.status,
          channel: campaign.channel,
          budget: campaign.budget,
          spent: campaign.spent,
          roi: campaign.roi,
          reach: campaign.reach,
          conversions: campaign.conversions,
          startDate: campaign.start_date,
          endDate: campaign.end_date
        }));
        
        setCampaigns(mappedCampaigns);
      } catch (error) {
        console.error('Error loading campaign data:', error);
        // Set empty data on error
        setMetrics({
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalReach: 0,
          averageROI: 0,
          conversionRate: 0,
          totalSpend: 0,
          impressions: 0,
          clicks: 0
        });
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-400">Loading campaign data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Campaign Effectiveness Dashboard</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          AI-powered insights and analytics to optimize your marketing campaigns across all channels
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="metric-label">Total Campaigns</div>
          <div className="metric-value">{metrics.totalCampaigns}</div>
          <div className="metric-change positive">↑ {metrics.activeCampaigns} active</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Total Reach</div>
          <div className="metric-value">{formatNumber(metrics.totalReach)}</div>
          <div className="metric-change positive">↑ 12.5% vs last month</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Average ROI</div>
          <div className="metric-value">{metrics.averageROI}x</div>
          <div className="metric-change positive">↑ 0.3x improvement</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Conversion Rate</div>
          <div className="metric-value">{metrics.conversionRate}%</div>
          <div className="metric-change positive">↑ 0.8% vs last month</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <div className="metric-label">Total Spend</div>
          </div>
          <div className="metric-value">{formatCurrency(metrics.totalSpend)}</div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <div className="metric-label">Impressions</div>
          </div>
          <div className="metric-value">{formatNumber(metrics.impressions)}</div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <div className="metric-label">Clicks</div>
          </div>
          <div className="metric-value">{formatNumber(metrics.clicks)}</div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <div className="metric-label">CTR</div>
          </div>
          <div className="metric-value">{((metrics.clicks / metrics.impressions) * 100).toFixed(2)}%</div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Active Campaigns</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Create Campaign
          </button>
        </div>

        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{campaign.name}</h3>
                  <p className="text-sm text-gray-400">{campaign.channel}</p>
                </div>
                <div className={`status-badge status-${campaign.status}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Budget</div>
                  <div className="font-medium text-white">{formatCurrency(campaign.budget)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Spent</div>
                  <div className="font-medium text-white">{formatCurrency(campaign.spent)}</div>
                </div>
                <div>
                  <div className="text-gray-400">ROI</div>
                  <div className="font-medium text-white">{campaign.roi}x</div>
                </div>
                <div>
                  <div className="text-gray-400">Reach</div>
                  <div className="font-medium text-white">{formatNumber(campaign.reach)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Conversions</div>
                  <div className="font-medium text-white">{formatNumber(campaign.conversions)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Period</div>
                  <div className="font-medium text-white text-xs">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {campaign.status === 'active' && (
                <div className="mt-3 bg-gray-700/30 rounded-lg p-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Budget Progress</span>
                    <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="chart-container space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">AI-Powered Insights</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Performance Recommendations</h3>
            <div className="space-y-2">
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-300">Budget Optimization</div>
                <div className="text-xs text-gray-300 mt-1">
                  Increase Q1 Brand Awareness budget by 15% - predicted 0.4x ROI improvement
                </div>
              </div>
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                <div className="text-sm font-medium text-green-300">Audience Targeting</div>
                <div className="text-xs text-gray-300 mt-1">
                  Expand targeting to include 25-34 age group - showing 23% higher engagement
                </div>
              </div>
              <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3">
                <div className="text-sm font-medium text-orange-300">Creative Performance</div>
                <div className="text-xs text-gray-300 mt-1">
                  Video creatives outperforming static by 1.8x - consider increasing video allocation
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Trend Analysis</h3>
            <div className="space-y-2">
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-300">Seasonal Trends</div>
                <div className="text-xs text-gray-300 mt-1">
                  Campaign performance 12% higher on weekends vs weekdays
                </div>
              </div>
              <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-3">
                <div className="text-sm font-medium text-cyan-300">Channel Performance</div>
                <div className="text-xs text-gray-300 mt-1">
                  Social Media campaigns showing 15% lower CPM this month
                </div>
              </div>
              <div className="bg-pink-900/30 border border-pink-700 rounded-lg p-3">
                <div className="text-sm font-medium text-pink-300">Competitive Intelligence</div>
                <div className="text-xs text-gray-300 mt-1">
                  Competitors increasing spend by 22% - opportunity to capture market share
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Analytics Deep Dive</div>
          <div className="text-sm opacity-90 mt-1">Detailed performance analysis</div>
        </button>
        
        <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Campaign Optimizer</div>
          <div className="text-sm opacity-90 mt-1">AI-powered optimization</div>
        </button>
        
        <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Audience Insights</div>
          <div className="text-sm opacity-90 mt-1">Advanced segmentation</div>
        </button>
      </div>
    </div>
  );
}