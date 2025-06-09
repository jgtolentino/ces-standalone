#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mock cost collection for Vercel, Supabase, and other services
// In production, these would integrate with actual APIs

class CostCollector {
  constructor(options = {}) {
    this.period = options.period || '7d';
    this.format = options.format || 'json';
    this.outputFile = options.output || 'metrics.json';
  }

  async collectVercelCosts() {
    // Mock Vercel API integration
    // In production: use Vercel API to get actual billing data
    return {
      service: 'vercel',
      period: this.period,
      costs: {
        compute: { amount: 45.20, unit: 'USD', usage: '2.1M invocations' },
        bandwidth: { amount: 12.80, unit: 'USD', usage: '156 GB' },
        storage: { amount: 3.50, unit: 'USD', usage: '2.8 GB' },
        functions: { amount: 18.90, unit: 'USD', usage: '890 hours' }
      },
      total: 80.40,
      currency: 'USD',
      breakdown_by_tenant: {
        ces: 25.30,
        scout: 31.20,
        acme: 18.40,
        others: 5.50
      }
    };
  }

  async collectSupabaseCosts() {
    // Mock Supabase API integration
    return {
      service: 'supabase',
      period: this.period,
      costs: {
        database: { amount: 25.00, unit: 'USD', usage: 'Pro plan' },
        storage: { amount: 4.20, unit: 'USD', usage: '12 GB' },
        bandwidth: { amount: 2.80, unit: 'USD', usage: '45 GB' },
        auth: { amount: 0.00, unit: 'USD', usage: '2.1K MAU' }
      },
      total: 32.00,
      currency: 'USD',
      breakdown_by_tenant: {
        ces: 12.80,
        scout: 14.20,
        acme: 4.50,
        others: 0.50
      }
    };
  }

  async collectPulserCosts() {
    // Mock Pulser API integration
    return {
      service: 'pulser',
      period: this.period,
      costs: {
        pipeline_executions: { amount: 15.60, unit: 'USD', usage: '1.2K runs' },
        agent_compute: { amount: 22.40, unit: 'USD', usage: '45 hours' },
        storage: { amount: 1.20, unit: 'USD', usage: '890 MB' }
      },
      total: 39.20,
      currency: 'USD',
      breakdown_by_tenant: {
        ces: 18.90,
        scout: 12.30,
        acme: 6.80,
        others: 1.20
      }
    };
  }

  async collectDomainCosts() {
    // Mock domain and DNS costs
    return {
      service: 'domains_dns',
      period: this.period,
      costs: {
        domain_registration: { amount: 2.30, unit: 'USD', usage: '2 domains' },
        dns_queries: { amount: 0.80, unit: 'USD', usage: '125K queries' },
        ssl_certificates: { amount: 0.00, unit: 'USD', usage: 'Let\'s Encrypt' }
      },
      total: 3.10,
      currency: 'USD'
    };
  }

  calculateTotalCosts(costs) {
    const total = costs.reduce((sum, service) => sum + service.total, 0);
    
    // Aggregate tenant breakdown
    const tenantBreakdown = {};
    costs.forEach(service => {
      if (service.breakdown_by_tenant) {
        Object.entries(service.breakdown_by_tenant).forEach(([tenant, cost]) => {
          tenantBreakdown[tenant] = (tenantBreakdown[tenant] || 0) + cost;
        });
      }
    });

    return {
      total_cost: total,
      currency: 'USD',
      tenant_breakdown: tenantBreakdown,
      cost_per_tenant: {
        average: total / Object.keys(tenantBreakdown).length,
        highest: Math.max(...Object.values(tenantBreakdown)),
        lowest: Math.min(...Object.values(tenantBreakdown))
      }
    };
  }

  generateOptimizationSuggestions(costs, totals) {
    const suggestions = [];

    // Analyze Vercel costs
    const vercel = costs.find(c => c.service === 'vercel');
    if (vercel && vercel.costs.compute.amount > 40) {
      suggestions.push({
        category: 'compute',
        impact: 'high',
        suggestion: 'Consider optimizing function cold starts and reducing execution time',
        potential_savings: '$15-25/month'
      });
    }

    // Analyze Supabase costs
    const supabase = costs.find(c => c.service === 'supabase');
    if (supabase && supabase.costs.storage.amount > 3) {
      suggestions.push({
        category: 'storage',
        impact: 'medium',
        suggestion: 'Review and clean up unused storage objects and old backups',
        potential_savings: '$2-8/month'
      });
    }

    // Tenant distribution analysis
    if (totals.cost_per_tenant.highest > totals.cost_per_tenant.average * 1.5) {
      suggestions.push({
        category: 'tenant_optimization',
        impact: 'medium',
        suggestion: 'Review high-cost tenant usage patterns and optimize resource allocation',
        potential_savings: '$10-20/month'
      });
    }

    return suggestions;
  }

  async collectAllCosts() {
    console.log(`💰 Collecting costs for period: ${this.period}`);

    const costs = await Promise.all([
      this.collectVercelCosts(),
      this.collectSupabaseCosts(),
      this.collectPulserCosts(),
      this.collectDomainCosts()
    ]);

    const totals = this.calculateTotalCosts(costs);
    const suggestions = this.generateOptimizationSuggestions(costs, totals);

    const report = {
      timestamp: new Date().toISOString(),
      period: this.period,
      services: costs,
      totals: totals,
      optimization_suggestions: suggestions,
      trends: {
        vs_previous_period: {
          change_percent: -8.2,
          change_amount: -12.40,
          trend: 'decreasing'
        }
      }
    };

    return report;
  }

  saveReport(report) {
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (this.format === 'json') {
      fs.writeFileSync(this.outputFile, JSON.stringify(report, null, 2));
    } else if (this.format === 'csv') {
      // Convert to CSV format
      const csvData = this.convertToCSV(report);
      fs.writeFileSync(this.outputFile.replace('.json', '.csv'), csvData);
    }

    console.log(`📄 Cost report saved to: ${this.outputFile}`);
  }

  convertToCSV(report) {
    const rows = [];
    rows.push(['Service', 'Cost Type', 'Amount', 'Unit', 'Usage']);
    
    report.services.forEach(service => {
      Object.entries(service.costs).forEach(([type, data]) => {
        rows.push([service.service, type, data.amount, data.unit, data.usage]);
      });
    });

    return rows.map(row => row.join(',')).join('\n');
  }

  printSummary(report) {
    console.log('\n💰 COST ANALYSIS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📊 Period: ${report.period}`);
    console.log(`💵 Total Cost: $${report.totals.total_cost.toFixed(2)}`);
    console.log(`📈 Trend: ${report.trends.vs_previous_period.trend} (${report.trends.vs_previous_period.change_percent}%)`);

    console.log('\n🏢 COST BY SERVICE:');
    report.services.forEach(service => {
      console.log(`   ${service.service.toUpperCase()}: $${service.total.toFixed(2)}`);
    });

    console.log('\n👥 COST BY TENANT:');
    Object.entries(report.totals.tenant_breakdown).forEach(([tenant, cost]) => {
      console.log(`   ${tenant}: $${cost.toFixed(2)}`);
    });

    if (report.optimization_suggestions.length > 0) {
      console.log('\n🎯 OPTIMIZATION SUGGESTIONS:');
      report.optimization_suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.suggestion}`);
        console.log(`      💡 Potential savings: ${suggestion.potential_savings}`);
      });
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--period=')) {
      options.period = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  }

  try {
    const collector = new CostCollector(options);
    const report = await collector.collectAllCosts();
    collector.saveReport(report);
    collector.printSummary(report);
  } catch (error) {
    console.error(`❌ Error collecting costs: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}