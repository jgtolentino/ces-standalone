'use client';

import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface CreativeScore {
  [key: string]: number;
}

interface AnalysisResult {
  analysis: {
    campaignHealth: {
      overallCES: number;
      grade: string;
      strengthAreas: string[];
      improvementAreas: string[];
      balanceScore: number;
      executionReadiness: number;
    };
    cesScore: number;
    outcomeBreakdown: Record<string, number>;
    recommendations: string[];
  };
  insights: {
    features: any[];
    outcomes: any[];
    strategic: any[];
  };
  benchmarks: {
    businessEfficiencyAlignment: number;
    conversionAlignment: number;
    overallBusinessPotential: number;
    gapAnalysis: string[];
  };
}

const BUSINESS_DRIVEN_FEATURE_DEFINITIONS = {
  value_proposition_clarity: "Clear, specific benefit communication that drives action",
  urgency_scarcity_triggers: "Time-sensitive or limited availability messaging",
  social_proof_integration: "Customer testimonials, reviews, usage statistics",
  problem_solution_framing: "Clear pain point identification and solution presentation",
  visual_hierarchy_optimization: "Strategic visual flow that guides to conversion",
  color_psychology_application: "Strategic color use to drive specific behaviors",
  mobile_optimization: "Design optimized for mobile user behavior and conversion",
  benefit_focused_headlines: "Headlines that emphasize user benefits over features",
  action_oriented_language: "Verbs and phrases that drive immediate action",
  personalization_depth: "Customized messaging based on user data and behavior",
  behavioral_targeting_precision: "Targeting based on actual user behavior patterns",
  lookalike_audience_optimization: "Targeting users similar to high-value customers",
  platform_native_optimization: "Content optimized for specific platform behaviors",
  cross_channel_consistency: "Consistent messaging and experience across all touchpoints"
};

export default function CreativeAnalyzerPage() {
  const [creativeScores, setCreativeScores] = useState<CreativeScore>({});
  const [campaignType, setCampaignType] = useState<'conversion' | 'brand' | 'engagement' | 'efficiency'>('conversion');
  const [businessPriorities, setBusinessPriorities] = useState<Record<string, number>>({});
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreChange = (feature: string, value: number) => {
    setCreativeScores(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handlePriorityChange = (outcome: string, value: number) => {
    setBusinessPriorities(prev => ({
      ...prev,
      [outcome]: value
    }));
  };

  const analyzeCreative = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/creative-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativeScores,
          businessPriorities,
          campaignType,
          includeAwardBenchmark: true
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    return 'text-yellow-400';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Zap className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Business-Driven Creative Analyzer</h1>
        </div>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          AI-powered analysis focused on 9 core business outcomes - NO award pattern correlations
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Campaign Objective Selection */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Campaign Objective</h3>
            <div className="grid grid-cols-2 gap-3">
              {['conversion', 'brand', 'engagement', 'efficiency'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCampaignType(type as any)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    campaignType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Business-Driven Features Scoring */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
              Business-Driven Features (0-10 scale)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(BUSINESS_DRIVEN_FEATURE_DEFINITIONS).map(([feature, description]) => (
                <div key={feature} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-white">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </label>
                      <p className="text-xs text-gray-400 mt-1">{description}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={creativeScores[feature] || 5}
                        onChange={(e) => handleScoreChange(feature, parseFloat(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm font-medium text-white w-8">
                        {creativeScores[feature] || 5}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Priorities */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-400" />
              Business Outcome Priorities
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'engagement', 'brand_recall', 'conversion', 'roi_sales',
                'brand_sentiment', 'acquisition', 'media_efficiency', 'behavioral_response', 'brand_equity'
              ].map((outcome) => (
                <div key={outcome} className="space-y-1">
                  <label className="text-sm text-gray-300">
                    {outcome.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={businessPriorities[outcome] || 1}
                    onChange={(e) => handlePriorityChange(outcome, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400">
                    {businessPriorities[outcome]?.toFixed(1) || '1.0'}x priority
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeCreative}
            disabled={loading || Object.keys(creativeScores).length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Business Impact...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Analyze Business Effectiveness</span>
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {analysisResult && (
            <>
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-white">Business Effectiveness Score</h3>
                  <div className="text-6xl font-bold text-white">
                    {analysisResult.analysis.campaignHealth.overallCES.toFixed(1)}
                  </div>
                  <div className={`text-2xl font-bold ${getGradeColor(analysisResult.analysis.campaignHealth.grade)}`}>
                    Grade: {analysisResult.analysis.campaignHealth.grade}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {analysisResult.analysis.campaignHealth.balanceScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-400">Balance Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {analysisResult.analysis.campaignHealth.executionReadiness.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-400">Execution Ready</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Performance Benchmark */}
              {analysisResult.benchmarks && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Business Performance Potential
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">
                        {analysisResult.benchmarks.businessEfficiencyAlignment}
                      </div>
                      <div className="text-xs text-gray-400">Efficiency Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">
                        {analysisResult.benchmarks.conversionAlignment}
                      </div>
                      <div className="text-xs text-gray-400">Conversion Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-400">
                        {analysisResult.benchmarks.overallBusinessPotential}
                      </div>
                      <div className="text-xs text-gray-400">Overall Potential</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Outcomes */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Business Outcome Performance
                </h3>
                <div className="space-y-3">
                  {analysisResult.insights.outcomes.slice(0, 5).map((outcome) => (
                    <div key={outcome.outcome} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{outcome.outcome}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              outcome.performance === 'above_threshold' 
                                ? 'bg-green-500' 
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, (outcome.currentScore / outcome.targetScore) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-white w-12">
                          {outcome.currentScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-orange-400" />
                  Business-Focused Recommendations
                </h3>
                <div className="space-y-4">
                  {analysisResult.insights.strategic.slice(0, 3).map((rec, index) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{rec.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.priority === 'high' ? 'bg-red-900 text-red-300' :
                          rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
                      <div className="text-xs text-gray-500">
                        Impact: {rec.impact} • Timeline: {rec.timeline}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Contributions */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                  Top Business Impact Features
                </h3>
                <div className="space-y-2">
                  {analysisResult.insights.features.slice(0, 5).map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        {feature.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {feature.currentScore.toFixed(1)}/10
                        </span>
                        <span className="text-sm font-medium text-white">
                          ROI: {feature.contribution.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}