import { AdvisorManagementClient } from '@azure/arm-advisor';
import { DefaultAzureCredential } from '@azure/identity';
import { createClient } from '@ai/db';
import axios from 'axios';
import cron from 'node-cron';

export interface CloudRecommendation {
  id: string;
  cloud_provider: 'azure' | 'aws' | 'gcp';
  category: 'cost' | 'performance' | 'security' | 'reliability' | 'operational_excellence';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  potential_savings?: number;
  currency?: string;
  resource_type: string;
  resource_id: string;
  recommendation_type: string;
  status: 'active' | 'dismissed' | 'applied';
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CrossCloudMapping {
  azure_service: string;
  aws_equivalent: string;
  gcp_equivalent: string;
  optimization_strategy: string;
}

export class AzuranceProxy {
  private advisorClient: AdvisorManagementClient;
  private supabase: ReturnType<typeof createClient>;
  private tenantId: string;

  constructor(tenantId: string = 'org-wide') {
    this.tenantId = tenantId;
    this.supabase = createClient();
    
    // Initialize Azure Advisor client
    const credential = new DefaultAzureCredential();
    this.advisorClient = new AdvisorManagementClient(
      credential,
      process.env.AZURE_SUBSCRIPTION_ID!
    );
  }

  /**
   * Fetch recommendations from Azure Advisor
   */
  async fetchAzureRecommendations(): Promise<CloudRecommendation[]> {
    try {
      console.log('🔍 Fetching Azure Advisor recommendations...');
      
      const recommendations = [];
      
      // Get recommendations from Azure Advisor
      for await (const recommendation of this.advisorClient.recommendations.list()) {
        const mapped: CloudRecommendation = {
          id: recommendation.id || '',
          cloud_provider: 'azure',
          category: this.mapAzureCategory(recommendation.category),
          title: recommendation.shortDescription?.problem || 'Azure Recommendation',
          description: recommendation.shortDescription?.solution || '',
          impact: this.mapAzureImpact(recommendation.impact),
          potential_savings: recommendation.extendedProperties?.annualSavingsAmount 
            ? parseFloat(recommendation.extendedProperties.annualSavingsAmount)
            : undefined,
          currency: recommendation.extendedProperties?.currency || 'USD',
          resource_type: recommendation.impactedField || 'unknown',
          resource_id: recommendation.resourceMetadata?.resourceId || '',
          recommendation_type: recommendation.recommendationTypeId || '',
          status: 'active',
          tenant_id: this.tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        recommendations.push(mapped);
      }

      console.log(`📋 Found ${recommendations.length} Azure recommendations`);
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error fetching Azure recommendations:', error);
      throw error;
    }
  }

  /**
   * Map Azure categories to standardized categories
   */
  private mapAzureCategory(azureCategory?: string): CloudRecommendation['category'] {
    const mapping: Record<string, CloudRecommendation['category']> = {
      'Cost': 'cost',
      'Performance': 'performance', 
      'Security': 'security',
      'Reliability': 'reliability',
      'OperationalExcellence': 'operational_excellence'
    };
    
    return mapping[azureCategory || ''] || 'operational_excellence';
  }

  /**
   * Map Azure impact levels
   */
  private mapAzureImpact(azureImpact?: string): CloudRecommendation['impact'] {
    const mapping: Record<string, CloudRecommendation['impact']> = {
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low'
    };
    
    return mapping[azureImpact || ''] || 'medium';
  }

  /**
   * Get cross-cloud service mappings
   */
  async getCrossCloudMappings(): Promise<CrossCloudMapping[]> {
    // This could be stored in the database or a configuration file
    return [
      {
        azure_service: 'Azure Virtual Machines',
        aws_equivalent: 'Amazon EC2',
        gcp_equivalent: 'Google Compute Engine',
        optimization_strategy: 'Right-size instances based on CPU/memory utilization'
      },
      {
        azure_service: 'Azure SQL Database',
        aws_equivalent: 'Amazon RDS',
        gcp_equivalent: 'Cloud SQL',
        optimization_strategy: 'Optimize database tier and reserved capacity'
      },
      {
        azure_service: 'Azure Storage',
        aws_equivalent: 'Amazon S3',
        gcp_equivalent: 'Cloud Storage',
        optimization_strategy: 'Implement lifecycle policies and appropriate storage tiers'
      },
      {
        azure_service: 'Azure App Service',
        aws_equivalent: 'AWS Elastic Beanstalk',
        gcp_equivalent: 'Google App Engine',
        optimization_strategy: 'Auto-scaling configuration and resource optimization'
      }
    ];
  }

  /**
   * Translate Azure recommendations to other cloud providers
   */
  async translateRecommendations(
    azureRecommendations: CloudRecommendation[],
    targetProvider: 'aws' | 'gcp'
  ): Promise<CloudRecommendation[]> {
    const mappings = await this.getCrossCloudMappings();
    const translated: CloudRecommendation[] = [];

    for (const azureRec of azureRecommendations) {
      const mapping = mappings.find(m => 
        azureRec.resource_type.includes(m.azure_service.split(' ')[1]) ||
        azureRec.title.toLowerCase().includes(m.azure_service.toLowerCase())
      );

      if (mapping) {
        const targetService = targetProvider === 'aws' 
          ? mapping.aws_equivalent 
          : mapping.gcp_equivalent;

        const translatedRec: CloudRecommendation = {
          ...azureRec,
          id: `${azureRec.id}-${targetProvider}`,
          cloud_provider: targetProvider,
          title: azureRec.title.replace(/Azure/gi, targetProvider === 'aws' ? 'AWS' : 'GCP'),
          description: `${azureRec.description} (Equivalent ${targetService}: ${mapping.optimization_strategy})`,
          resource_type: targetService,
        };

        translated.push(translatedRec);
      }
    }

    console.log(`🔄 Translated ${translated.length} recommendations to ${targetProvider.toUpperCase()}`);
    return translated;
  }

  /**
   * Store recommendations in Supabase
   */
  async storeRecommendations(recommendations: CloudRecommendation[]): Promise<void> {
    if (recommendations.length === 0) return;

    const { error } = await this.supabase
      .from('cloud_recommendations')
      .upsert(recommendations, { 
        onConflict: 'id,cloud_provider',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Error storing recommendations:', error);
      throw error;
    }

    console.log(`✅ Stored ${recommendations.length} recommendations in database`);
  }

  /**
   * Generate cost optimization report
   */
  async generateCostOptimizationReport(): Promise<{
    total_potential_savings: number;
    recommendations_by_category: Record<string, number>;
    top_recommendations: CloudRecommendation[];
  }> {
    const { data: recommendations, error } = await this.supabase
      .from('cloud_recommendations')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('status', 'active')
      .not('potential_savings', 'is', null);

    if (error) {
      console.error('❌ Error fetching recommendations for report:', error);
      throw error;
    }

    const recs = recommendations || [];
    
    const totalSavings = recs.reduce((sum, rec) => 
      sum + (rec.potential_savings || 0), 0
    );

    const byCategory = recs.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRecs = recs
      .sort((a, b) => (b.potential_savings || 0) - (a.potential_savings || 0))
      .slice(0, 10);

    return {
      total_potential_savings: totalSavings,
      recommendations_by_category: byCategory,
      top_recommendations: topRecs
    };
  }

  /**
   * Run full audit cycle
   */
  async runAuditCycle(): Promise<void> {
    try {
      console.log(`🚀 Starting cloud audit cycle for tenant: ${this.tenantId}`);
      
      // Fetch Azure recommendations
      const azureRecs = await this.fetchAzureRecommendations();
      
      // Translate to other clouds
      const awsRecs = await this.translateRecommendations(azureRecs, 'aws');
      const gcpRecs = await this.translateRecommendations(azureRecs, 'gcp');
      
      // Store all recommendations
      const allRecs = [...azureRecs, ...awsRecs, ...gcpRecs];
      await this.storeRecommendations(allRecs);
      
      // Generate report
      const report = await this.generateCostOptimizationReport();
      console.log(`💰 Total potential savings: $${report.total_potential_savings.toFixed(2)}`);
      
      // Log audit action
      await this.logAuditAction('full_audit', {
        recommendations_count: allRecs.length,
        potential_savings: report.total_potential_savings,
        azure_count: azureRecs.length,
        aws_translated: awsRecs.length,
        gcp_translated: gcpRecs.length
      });
      
      console.log(`🎉 Audit cycle completed successfully`);
      
    } catch (error) {
      console.error('❌ Audit cycle failed:', error);
      await this.logAuditAction('audit_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Log audit actions for transparency
   */
  async logAuditAction(action: string, metadata: any = {}): Promise<void> {
    const { error } = await this.supabase
      .from('azurance_audit_log')
      .insert({
        tenant_id: this.tenantId,
        action,
        metadata,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error logging audit action:', error);
    }
  }

  /**
   * Start scheduled auditing
   */
  startScheduledAuditing(schedule: string = '0 6 * * *'): void {
    console.log(`⏰ Starting scheduled auditing (${schedule}) for tenant: ${this.tenantId}`);
    
    cron.schedule(schedule, async () => {
      try {
        await this.runAuditCycle();
      } catch (error) {
        console.error('❌ Scheduled audit failed:', error);
      }
    });
  }

  /**
   * Apply recommendation (mark as applied)
   */
  async applyRecommendation(recommendationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cloud_recommendations')
      .update({ 
        status: 'applied',
        applied_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error applying recommendation:', error);
      throw error;
    }

    await this.logAuditAction('recommendation_applied', { recommendation_id: recommendationId });
    console.log(`✅ Recommendation ${recommendationId} marked as applied`);
  }

  /**
   * Dismiss recommendation
   */
  async dismissRecommendation(recommendationId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('cloud_recommendations')
      .update({ 
        status: 'dismissed',
        dismissed_at: new Date().toISOString(),
        dismiss_reason: reason
      })
      .eq('id', recommendationId)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error dismissing recommendation:', error);
      throw error;
    }

    await this.logAuditAction('recommendation_dismissed', { 
      recommendation_id: recommendationId,
      reason 
    });
    console.log(`✅ Recommendation ${recommendationId} dismissed`);
  }
}

// Export factory function
export function createAzuranceProxy(tenantId: string = 'org-wide') {
  return new AzuranceProxy(tenantId);
}

// CLI interface
if (require.main === module) {
  const proxy = new AzuranceProxy();
  
  if (process.argv.includes('--schedule')) {
    proxy.startScheduledAuditing();
  } else if (process.argv.includes('--report')) {
    proxy.generateCostOptimizationReport().then(console.log).catch(console.error);
  } else {
    proxy.runAuditCycle().catch(console.error);
  }
}