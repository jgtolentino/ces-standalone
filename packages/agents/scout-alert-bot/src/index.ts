import { createClient } from '@ai/db';
import axios from 'axios';
import cron from 'node-cron';

export interface KPIThreshold {
  metric: string;
  threshold_type: 'above' | 'below' | 'equals';
  threshold_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  tenant_id: string;
}

export interface KPIAlert {
  id?: string;
  tenant_id: string;
  metric: string;
  current_value: number;
  threshold_value: number;
  threshold_type: string;
  severity: string;
  message: string;
  triggered_at: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface SlackAlert {
  channel: string;
  text: string;
  blocks?: any[];
  username?: string;
  icon_emoji?: string;
}

export class ScoutAlertBot {
  private supabase: ReturnType<typeof createClient>;
  private tenantId: string;
  private slackWebhookUrl?: string;

  constructor(tenantId: string = 'scout') {
    this.tenantId = tenantId;
    this.supabase = createClient();
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  /**
   * Get KPI thresholds for the tenant
   */
  async getKPIThresholds(): Promise<KPIThreshold[]> {
    const { data, error } = await this.supabase
      .from('kpi_thresholds')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('enabled', true);

    if (error) {
      console.error('❌ Error fetching KPI thresholds:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get current KPI values from the database
   */
  async getCurrentKPIValues(): Promise<Record<string, number>> {
    const queries = {
      daily_revenue: `
        SELECT COALESCE(SUM(total_amount), 0) as value
        FROM transactions 
        WHERE tenant_id = $1 
        AND DATE(created_at) = CURRENT_DATE
      `,
      active_stores: `
        SELECT COUNT(DISTINCT store_id) as value
        FROM transactions 
        WHERE tenant_id = $1 
        AND created_at >= NOW() - INTERVAL '1 hour'
      `,
      avg_transaction_value: `
        SELECT COALESCE(AVG(total_amount), 0) as value
        FROM transactions 
        WHERE tenant_id = $1 
        AND DATE(created_at) = CURRENT_DATE
      `,
      transaction_count: `
        SELECT COUNT(*) as value
        FROM transactions 
        WHERE tenant_id = $1 
        AND created_at >= NOW() - INTERVAL '1 hour'
      `,
      top_brand_sales: `
        SELECT COALESCE(SUM(total_amount), 0) as value
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        WHERE t.tenant_id = $1 
        AND DATE(t.created_at) = CURRENT_DATE
        GROUP BY p.brand
        ORDER BY value DESC
        LIMIT 1
      `
    };

    const kpis: Record<string, number> = {};

    for (const [metric, query] of Object.entries(queries)) {
      try {
        const { data, error } = await this.supabase.rpc('exec_sql', {
          sql_query: query,
          params: [this.tenantId]
        });

        if (error) {
          console.error(`❌ Error fetching ${metric}:`, error);
          kpis[metric] = 0;
        } else {
          kpis[metric] = data?.[0]?.value || 0;
        }
      } catch (error) {
        console.error(`❌ Error executing query for ${metric}:`, error);
        kpis[metric] = 0;
      }
    }

    return kpis;
  }

  /**
   * Check if KPI value breaches threshold
   */
  private checkThresholdBreach(
    value: number, 
    threshold: KPIThreshold
  ): boolean {
    switch (threshold.threshold_type) {
      case 'above':
        return value > threshold.threshold_value;
      case 'below':
        return value < threshold.threshold_value;
      case 'equals':
        return Math.abs(value - threshold.threshold_value) < 0.01;
      default:
        return false;
    }
  }

  /**
   * Create alert record in database
   */
  async createAlert(alert: Omit<KPIAlert, 'id'>): Promise<KPIAlert> {
    const { data, error } = await this.supabase
      .from('kpi_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating alert:', error);
      throw error;
    }

    return data;
  }

  /**
   * Send Slack notification
   */
  async sendSlackAlert(alert: KPIAlert): Promise<void> {
    if (!this.slackWebhookUrl) {
      console.warn('⚠️ Slack webhook URL not configured');
      return;
    }

    const severityEmoji = {
      low: '🟡',
      medium: '🟠', 
      high: '🔴',
      critical: '🚨'
    };

    const emoji = severityEmoji[alert.severity as keyof typeof severityEmoji] || '⚠️';
    
    const slackMessage: SlackAlert = {
      channel: '#scout-alerts',
      username: 'Scout Alert Bot',
      icon_emoji: ':robot_face:',
      text: `${emoji} Scout KPI Alert - ${alert.severity.toUpperCase()}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Scout KPI Alert`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Metric:* ${alert.metric}`
            },
            {
              type: 'mrkdwn',
              text: `*Severity:* ${alert.severity.toUpperCase()}`
            },
            {
              type: 'mrkdwn',
              text: `*Current Value:* ${alert.current_value.toFixed(2)}`
            },
            {
              type: 'mrkdwn',
              text: `*Threshold:* ${alert.threshold_type} ${alert.threshold_value}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:* ${alert.message}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Tenant: ${alert.tenant_id} | Triggered: ${new Date(alert.triggered_at).toLocaleString()}`
            }
          ]
        }
      ]
    };

    try {
      await axios.post(this.slackWebhookUrl, slackMessage);
      console.log(`✅ Slack alert sent for ${alert.metric}`);
    } catch (error) {
      console.error('❌ Error sending Slack alert:', error);
    }
  }

  /**
   * Check all KPIs against thresholds
   */
  async checkKPIs(): Promise<KPIAlert[]> {
    console.log(`🔍 Checking KPIs for tenant: ${this.tenantId}`);

    const [thresholds, currentValues] = await Promise.all([
      this.getKPIThresholds(),
      this.getCurrentKPIValues()
    ]);

    const triggeredAlerts: KPIAlert[] = [];

    for (const threshold of thresholds) {
      const currentValue = currentValues[threshold.metric] || 0;
      
      if (this.checkThresholdBreach(currentValue, threshold)) {
        const alert: Omit<KPIAlert, 'id'> = {
          tenant_id: this.tenantId,
          metric: threshold.metric,
          current_value: currentValue,
          threshold_value: threshold.threshold_value,
          threshold_type: threshold.threshold_type,
          severity: threshold.severity,
          message: `${threshold.metric} is ${threshold.threshold_type} threshold (${currentValue} vs ${threshold.threshold_value})`,
          triggered_at: new Date().toISOString(),
          acknowledged: false,
          resolved: false
        };

        try {
          const createdAlert = await this.createAlert(alert);
          await this.sendSlackAlert(createdAlert);
          triggeredAlerts.push(createdAlert);
          
          console.log(`🚨 Alert triggered: ${threshold.metric} = ${currentValue}`);
        } catch (error) {
          console.error(`❌ Error handling alert for ${threshold.metric}:`, error);
        }
      }
    }

    if (triggeredAlerts.length === 0) {
      console.log('✅ All KPIs within thresholds');
    } else {
      console.log(`🚨 ${triggeredAlerts.length} alerts triggered`);
    }

    return triggeredAlerts;
  }

  /**
   * Start scheduled KPI monitoring
   */
  startScheduledMonitoring(schedule: string = '*/5 * * * *'): void {
    console.log(`⏰ Starting KPI monitoring (${schedule}) for tenant: ${this.tenantId}`);
    
    cron.schedule(schedule, async () => {
      try {
        await this.checkKPIs();
      } catch (error) {
        console.error('❌ Scheduled KPI check failed:', error);
      }
    });
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('kpi_alerts')
      .update({ 
        acknowledged: true, 
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId 
      })
      .eq('id', alertId)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error acknowledging alert:', error);
      throw error;
    }

    console.log(`✅ Alert ${alertId} acknowledged`);
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, userId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('kpi_alerts')
      .update({ 
        resolved: true, 
        resolved_at: new Date().toISOString(),
        resolved_by: userId 
      })
      .eq('id', alertId)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error resolving alert:', error);
      throw error;
    }

    console.log(`✅ Alert ${alertId} resolved`);
  }
}

// Export factory function
export function createScoutAlertBot(tenantId: string = 'scout') {
  return new ScoutAlertBot(tenantId);
}

// CLI interface
if (require.main === module) {
  const bot = new ScoutAlertBot();
  
  if (process.argv.includes('--monitor')) {
    bot.startScheduledMonitoring();
  } else if (process.argv.includes('--test')) {
    bot.checkKPIs().catch(console.error);
  }
}