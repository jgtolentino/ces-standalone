import { NextRequest, NextResponse } from 'next/server';
import { businessEngine, BUSINESS_DRIVEN_FEATURES, BUSINESS_OUTCOMES } from '../../../lib/business-outcome-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      creativeScores,
      businessPriorities = {},
      campaignType = 'conversion',
      includeAwardBenchmark = true
    } = body;

    // Validate input
    if (!creativeScores || typeof creativeScores !== 'object') {
      return NextResponse.json(
        { error: 'creativeScores object is required' },
        { status: 400 }
      );
    }

    // Calculate Business Effectiveness Score
    const cesResults = businessEngine.calculateBusinessEffectiveness(
      creativeScores,
      businessPriorities,
      campaignType as any
    );

    // Business impact analysis (no award benchmarking)
    let awardBenchmark = null;
    if (includeAwardBenchmark) {
      // Generate business-focused benchmark instead
      awardBenchmark = {
        businessEfficiencyAlignment: Math.round((cesResults.outcomeBreakdown.media_efficiency || 0) / 10),
        conversionAlignment: Math.round((cesResults.outcomeBreakdown.conversion || 0) / 10),
        overallBusinessPotential: Math.round(cesResults.totalScore),
        gapAnalysis: cesResults.businessRecommendations || []
      };
    }

    // Generate detailed feature analysis
    const featureAnalysis = BUSINESS_DRIVEN_FEATURES.map(feature => {
      const score = creativeScores[feature.id] || 0;
      const contribution = cesResults.featureROI[feature.id] || 0;
      
      // Calculate feature effectiveness per outcome
      const outcomeEffectiveness = Object.entries(BUSINESS_OUTCOMES).map(([outcomeKey, outcome]) => ({
        outcome: outcome.name,
        impact: feature.businessImpact[outcomeKey] || 0,
        score: score * (feature.businessImpact[outcomeKey] || 0)
      })).sort((a, b) => b.score - a.score);

      return {
        name: feature.id,
        description: feature.description,
        category: feature.category,
        currentScore: score,
        contribution: Math.round(contribution * 100) / 100,
        measurability: feature.measurability,
        topOutcomes: outcomeEffectiveness.slice(0, 3),
        implementation: feature.implementation,
        businessImpact: feature.businessImpact,
        gap: score < 7 ? 10 - score : 0
      };
    }).sort((a, b) => b.contribution - a.contribution);

    // Generate outcome-specific insights
    const outcomeInsights = Object.entries(BUSINESS_OUTCOMES).map(([key, outcome]) => {
      const score = cesResults.outcomeBreakdown[key] || 0;
      const threshold = outcome.threshold;
      const target = outcome.targetValue;
      
      // Find top contributing features for this outcome
      const topFeatures = BUSINESS_DRIVEN_FEATURES
        .map(feature => ({
          name: feature.id,
          impact: feature.businessImpact[key] || 0,
          currentContribution: (creativeScores[feature.id] || 0) * (feature.businessImpact[key] || 0)
        }))
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 3);

      return {
        outcome: outcome.name,
        metrics: outcome.metrics,
        currentScore: Math.round(score * 100) / 100,
        targetScore: target,
        threshold: threshold,
        weight: outcome.weight,
        performance: score >= threshold ? 'above_threshold' : 'below_threshold',
        gapToTarget: Math.max(0, target - score),
        topFeatures,
        priority: businessPriorities[key] || 1
      };
    }).sort((a, b) => b.currentScore - a.currentScore);

    // Generate strategic recommendations
    const strategicRecommendations = generateStrategicRecommendations(
      cesResults,
      featureAnalysis,
      outcomeInsights,
      campaignType as any
    );

    // Calculate overall campaign health
    const campaignHealth = {
      overallCES: cesResults.totalScore,
      grade: getCESGrade(cesResults.totalScore),
      strengthAreas: featureAnalysis.filter(f => f.currentScore >= 8).map(f => f.name),
      improvementAreas: featureAnalysis.filter(f => f.currentScore < 6).map(f => f.name),
      balanceScore: calculateBalanceScore(creativeScores),
      executionReadiness: calculateExecutionReadiness(featureAnalysis)
    };

    return NextResponse.json({
      analysis: {
        campaignHealth,
        cesScore: cesResults.totalScore,
        outcomeBreakdown: cesResults.outcomeBreakdown,
        featureContributions: cesResults.featureROI,
        recommendations: cesResults.businessRecommendations
      },
      insights: {
        features: featureAnalysis,
        outcomes: outcomeInsights,
        strategic: strategicRecommendations
      },
      benchmarks: awardBenchmark,
      metadata: {
        campaignType,
        analysisTimestamp: new Date().toISOString(),
        totalFeatures: BUSINESS_DRIVEN_FEATURES.length,
        businessOutcomes: Object.keys(BUSINESS_OUTCOMES).length
      }
    });

  } catch (error) {
    console.error('Creative analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze creative effectiveness' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'summary';

    if (format === 'features') {
      // Return detailed feature definitions
      return NextResponse.json({
        features: BUSINESS_DRIVEN_FEATURES.map(feature => ({
          id: feature.id,
          name: feature.name,
          description: feature.description,
          category: feature.category,
          measurability: feature.measurability,
          implementation: feature.implementation,
          businessImpact: feature.businessImpact,
          testability: feature.testability
        })),
        categories: {
          content: BUSINESS_DRIVEN_FEATURES.filter(f => f.category === 'content').length,
          design: BUSINESS_DRIVEN_FEATURES.filter(f => f.category === 'design').length,
          messaging: BUSINESS_DRIVEN_FEATURES.filter(f => f.category === 'messaging').length,
          targeting: BUSINESS_DRIVEN_FEATURES.filter(f => f.category === 'targeting').length,
          channel: BUSINESS_DRIVEN_FEATURES.filter(f => f.category === 'channel').length
        }
      });
    }

    if (format === 'outcomes') {
      // Return business outcomes framework
      return NextResponse.json({
        outcomes: Object.entries(BUSINESS_OUTCOMES).map(([key, outcome]) => ({
          id: key,
          name: outcome.name,
          description: outcome.description,
          metrics: outcome.metrics,
          weight: outcome.weight,
          targetValue: outcome.targetValue,
          threshold: outcome.threshold
        }))
      });
    }

    // Default summary format
    return NextResponse.json({
      summary: {
        totalFeatures: BUSINESS_DRIVEN_FEATURES.length,
        categories: ['content', 'design', 'messaging', 'targeting', 'channel'],
        businessOutcomes: Object.keys(BUSINESS_OUTCOMES).length,
        businessFocus: 'Pure business outcomes (no award correlations)'
      },
      usage: {
        endpoint: '/api/creative-analysis',
        method: 'POST',
        requiredFields: ['creativeScores'],
        optionalFields: ['businessPriorities', 'campaignType', 'includeAwardBenchmark']
      }
    });

  } catch (error) {
    console.error('Error fetching creative analysis info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creative analysis information' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateStrategicRecommendations(
  cesResults: any,
  featureAnalysis: any[],
  outcomeInsights: any[],
  campaignType: string
): any[] {
  const recommendations = [];
  
  // Low scoring features with high business impact
  const highImpactLowScore = featureAnalysis
    .filter(f => f.currentScore < 6 && f.contribution > 0.5)
    .slice(0, 2);
  
  for (const feature of highImpactLowScore) {
    recommendations.push({
      type: 'feature_improvement',
      priority: 'high',
      title: `Boost ${feature.name.replace(/_/g, ' ')}`,
      description: `Current score: ${feature.currentScore}/10. High business impact feature with significant improvement potential.`,
      impact: 'High business effectiveness improvement expected',
      actions: feature.implementation.slice(0, 2),
      timeline: '2-3 weeks'
    });
  }
  
  // Underperforming outcomes
  const underperformingOutcomes = outcomeInsights
    .filter(o => o.performance === 'below_threshold')
    .slice(0, 2);
    
  for (const outcome of underperformingOutcomes) {
    recommendations.push({
      type: 'outcome_optimization',
      priority: 'medium',
      title: `Improve ${outcome.outcome}`,
      description: `Currently ${Math.round(outcome.currentScore)} vs target ${outcome.targetScore}`,
      impact: `${outcome.gapToTarget} point improvement needed`,
      actions: outcome.topFeatures.map((f: any) => `Enhance ${f.name.replace(/_/g, ' ')}`),
      timeline: '3-4 weeks'
    });
  }
  
  // Campaign type specific recommendations
  if (campaignType === 'conversion') {
    const ctaFeature = featureAnalysis.find(f => f.name === 'action_oriented_language');
    if (ctaFeature && ctaFeature.currentScore < 8) {
      recommendations.push({
        type: 'campaign_type_optimization',
        priority: 'high',
        title: 'Strengthen Action-Oriented Language',
        description: 'Conversion campaigns require compelling action triggers',
        impact: 'Direct conversion rate improvement',
        actions: ['Command-form CTAs', 'Active voice usage', 'Specific action verbs'],
        timeline: '1-2 weeks'
      });
    }
  }
  
  return recommendations.slice(0, 5);
}

function getCESGrade(score: number): string {
  if (score >= 85) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 75) return 'A-';
  if (score >= 70) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 60) return 'B-';
  if (score >= 55) return 'C+';
  if (score >= 50) return 'C';
  return 'C-';
}

function calculateBalanceScore(creativeScores: Record<string, number>): number {
  const scores = Object.values(creativeScores);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = more balanced = higher score
  return Math.max(0, 10 - standardDeviation);
}

function calculateExecutionReadiness(featureAnalysis: any[]): number {
  const highMeasurability = featureAnalysis.filter(f => 
    f.measurability === 'high' && f.currentScore >= 7
  ).length;
  
  const totalHighMeasurability = featureAnalysis.filter(f => 
    f.measurability === 'high'
  ).length;
  
  return totalHighMeasurability > 0 ? (highMeasurability / totalHighMeasurability) * 10 : 0;
}