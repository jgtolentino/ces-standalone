'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target,
  Database,
  Zap,
  Filter,
  Download,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Campaign {
  campaign_id: string;
  name: string;
  brand: string;
  industry: string;
  type: string;
  region: string;
  budget: number;
  status: string;
  analysis?: {
    businessEffectivenessScore: number;
    topBusinessOutcome: [string, number];
    actualPerformance: {
      roi: number;
      engagement: number;
      conversion: number;
    };
  };
  assets: number;
  performanceRecords: number;
}

interface DataSummary {
  totalCampaigns: number;
  totalCreativeAssets: number;
  totalPerformanceRecords: number;
  businessOutcomes: number;
  businessFeatures: number;
  industries: string[];
  regions: string[];
  brands: string[];
}

export default function RealCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load summary first
      const summaryResponse = await fetch('/api/campaign-analysis?type=summary');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
      
      // Load campaigns with analysis
      const campaignsResponse = await fetch('/api/campaign-analysis?limit=50');
      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData.campaigns);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaign-analysis?campaignId=${campaignId}`);
      const data = await response.json();
      setSelectedCampaign(data);
    } catch (err) {
      setError('Failed to analyze campaign');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 7) return 'bg-green-900/20 border-green-700';
    if (score >= 5) return 'bg-yellow-900/20 border-yellow-700';
    return 'bg-red-900/20 border-red-700';
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !filterIndustry || campaign.industry === filterIndustry;
    const matchesRegion = !filterRegion || campaign.region === filterRegion;
    
    return matchesSearch && matchesIndustry && matchesRegion;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-400">Loading real campaign data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Database className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Real Campaign Analysis</h1>
        </div>
        <p className="text-xl text-gray-400 max-w-4xl mx-auto">
          Business-outcome analysis of your real {summary?.totalCampaigns || 0} campaigns with {summary?.totalCreativeAssets || 0} creative assets
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Data Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{summary.totalCampaigns}</div>
            <div className="text-sm text-gray-400">Total Campaigns</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{summary.totalCreativeAssets}</div>
            <div className="text-sm text-gray-400">Creative Assets</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{summary.totalPerformanceRecords}</div>
            <div className="text-sm text-gray-400">Performance Records</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{summary.businessOutcomes}</div>
            <div className="text-sm text-gray-400">Business Outcomes</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns or brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {summary && (
          <>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Industries</option>
              {summary.industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              {summary.regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Campaign List */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Campaign Analysis ({filteredCampaigns.length})
          </h2>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh Analysis
          </button>
        </div>

        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.campaign_id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{campaign.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Brand:</span>
                          <span className="text-white ml-2">{campaign.brand}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Industry:</span>
                          <span className="text-white ml-2">{campaign.industry}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Region:</span>
                          <span className="text-white ml-2">{campaign.region}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Budget:</span>
                          <span className="text-white ml-2">${campaign.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400">{campaign.assets} assets</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400">{campaign.performanceRecords} records</span>
                        </div>
                      </div>
                    </div>
                    
                    {campaign.analysis && (
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(campaign.analysis.businessEffectivenessScore)}`}>
                          {campaign.analysis.businessEffectivenessScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400">Business Score</div>
                        
                        <div className="mt-3 space-y-1 text-sm">
                          <div>
                            <span className="text-gray-400">ROI:</span>
                            <span className="text-white ml-2">{campaign.analysis.actualPerformance.roi.toFixed(2)}x</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Engagement:</span>
                            <span className="text-white ml-2">{campaign.analysis.actualPerformance.engagement.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Conversion:</span>
                            <span className="text-white ml-2">{campaign.analysis.actualPerformance.conversion.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => analyzeCampaign(campaign.campaign_id)}
                  className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Deep Analysis</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Campaign Analysis Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{selectedCampaign.campaign.name}</h3>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Business Effectiveness Analysis</h4>
                  <div className={`border rounded-lg p-4 ${getScoreBackground(selectedCampaign.analysis.businessEffectivenessScore)}`}>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedCampaign.analysis.businessEffectivenessScore)}`}>
                        {selectedCampaign.analysis.businessEffectivenessScore.toFixed(1)}
                      </div>
                      <div className="text-gray-400">Business Effectiveness Score</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-semibold text-white mb-2">Business Recommendations</h5>
                    <div className="space-y-2">
                      {selectedCampaign.analysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="text-sm text-gray-300 bg-gray-800 rounded p-3">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Business Outcomes</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedCampaign.analysis.predictedOutcomes).map(([outcome, score]) => (
                      <div key={outcome} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">
                          {outcome.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (score as number / 100) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-white w-12">
                            {(score as number).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedCampaign.analysis.actualOutcomes && Object.keys(selectedCampaign.analysis.actualOutcomes).length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-semibold text-white mb-2">Actual Performance</h5>
                      <div className="space-y-2">
                        {Object.entries(selectedCampaign.analysis.actualOutcomes).map(([outcome, value]) => (
                          <div key={outcome} className="flex justify-between text-sm">
                            <span className="text-gray-300 capitalize">{outcome.replace(/_/g, ' ')}</span>
                            <span className="text-green-400">{(value as number).toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}