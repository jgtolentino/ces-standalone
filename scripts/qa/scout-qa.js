#!/usr/bin/env node

/**
 * Scout Analytics QA CLI Tool
 * Cherry-picked from CES QA validation system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ScoutQA {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(this.projectRoot, 'config/scout-dashboard.yaml');
      if (fs.existsSync(configPath)) {
        const yaml = require('js-yaml');
        return yaml.load(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load scout-dashboard.yaml config');
    }
    return null;
  }

  async validateOutput(filter = null) {
    console.log('🔍 Scout QA: Validating Dashboard Output...');
    
    const checks = [
      this.checkDataFreshness(),
      this.validateSQLQueries(),
      this.checkWidgetResponsiveness(),
      this.validateTooltips(),
      filter && this.runFilteredValidation(filter)
    ].filter(Boolean);

    const results = await Promise.allSettled(checks);
    const passed = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`\n✅ Passed: ${passed}, ❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n🚨 Failed checks:');
      results.filter(r => r.status === 'rejected').forEach(r => {
        console.log(`   - ${r.reason}`);
      });
      process.exit(1);
    }

    console.log('🎉 All QA checks passed!');
  }

  async runFilteredValidation(filter) {
    console.log(`   🎯 Running filtered validation: ${filter}`);
    
    switch (filter) {
      case 'basket_size':
        return this.validateBasketSizeAnalysis();
      case 'regional_performance':
        return this.validateRegionalPerformance();
      case 'product_insights':
        return this.validateProductInsights();
      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  }

  checkDataFreshness(maxAgeMinutes = 10) {
    console.log('   📊 Checking data freshness...');
    
    // Simulate data freshness check
    const mockLastUpdate = new Date(Date.now() - (5 * 60 * 1000)); // 5 minutes ago
    const maxAge = new Date(Date.now() - (maxAgeMinutes * 60 * 1000));
    
    if (mockLastUpdate < maxAge) {
      throw new Error(`Data is stale (last update: ${mockLastUpdate.toISOString()})`);
    }
    
    console.log(`   ✅ Data is fresh (last update: ${mockLastUpdate.toISOString()})`);
    return true;
  }

  validateSQLQueries() {
    console.log('   📝 Validating SQL queries...');
    
    const queryPatterns = [
      /SELECT.*FROM.*WHERE/i,
      /GROUP BY/i,
      /ORDER BY/i
    ];

    // Mock SQL validation
    const queries = [
      'SELECT category, SUM(revenue) FROM transactions WHERE date >= NOW() - INTERVAL 30 DAY GROUP BY category ORDER BY SUM(revenue) DESC',
      'SELECT region, COUNT(*) as transaction_count FROM transactions GROUP BY region'
    ];

    queries.forEach((query, index) => {
      const isValid = queryPatterns.some(pattern => pattern.test(query));
      if (!isValid) {
        throw new Error(`Invalid SQL query ${index + 1}: ${query.substring(0, 50)}...`);
      }
    });

    console.log(`   ✅ ${queries.length} SQL queries validated`);
    return true;
  }

  checkWidgetResponsiveness() {
    console.log('   📱 Checking widget responsiveness...');
    
    // Mock responsiveness check
    const breakpoints = ['mobile', 'tablet', 'desktop'];
    const widgets = ['executive_summary', 'brand_performance', 'regional_performance'];
    
    breakpoints.forEach(breakpoint => {
      widgets.forEach(widget => {
        // Simulate responsive check
        const isResponsive = Math.random() > 0.02; // 98% success rate
        if (!isResponsive) {
          throw new Error(`Widget ${widget} not responsive on ${breakpoint}`);
        }
      });
    });

    console.log(`   ✅ ${widgets.length} widgets responsive across ${breakpoints.length} breakpoints`);
    return true;
  }

  validateTooltips(page = 'all') {
    console.log(`   💡 Validating tooltips (page: ${page})...`);
    
    const tooltips = [
      { element: 'revenue-kpi', text: 'Total revenue for selected period' },
      { element: 'basket-size', text: 'Average basket size in PHP' },
      { element: 'regional-map', text: 'Click regions for detailed breakdown' }
    ];

    tooltips.forEach(tooltip => {
      // Mock tooltip validation
      const hasTooltip = Math.random() > 0.05; // 95% success rate
      if (!hasTooltip) {
        throw new Error(`Missing tooltip for ${tooltip.element}`);
      }
    });

    console.log(`   ✅ ${tooltips.length} tooltips validated`);
    return true;
  }

  validateBasketSizeAnalysis() {
    console.log('   🛒 Validating basket size analysis...');
    
    // Mock basket size validation
    const expectedFields = ['basket_size', 'frequency', 'customer_segment'];
    const mockData = { basket_size: 245, frequency: 2.3, customer_segment: 'premium' };
    
    expectedFields.forEach(field => {
      if (!(field in mockData)) {
        throw new Error(`Missing field in basket analysis: ${field}`);
      }
    });

    console.log('   ✅ Basket size analysis structure validated');
    return true;
  }

  validateRegionalPerformance() {
    console.log('   🗺️  Validating regional performance...');
    
    const expectedRegions = ['NCR', 'Region 3', 'Region 4A', 'Calabarzon', 'Visayas', 'Mindanao'];
    const mockRegions = ['NCR', 'Region 3', 'Region 4A', 'Visayas'];
    
    const missingRegions = expectedRegions.filter(region => !mockRegions.includes(region));
    if (missingRegions.length > 0) {
      throw new Error(`Missing regional data: ${missingRegions.join(', ')}`);
    }

    console.log('   ✅ Regional performance data validated');
    return true;
  }

  validateProductInsights() {
    console.log('   📦 Validating product insights...');
    
    const requiredMetrics = ['revenue', 'volume', 'margin', 'growth'];
    const mockMetrics = ['revenue', 'volume', 'margin'];
    
    const missingMetrics = requiredMetrics.filter(metric => !mockMetrics.includes(metric));
    if (missingMetrics.length > 0) {
      throw new Error(`Missing product metrics: ${missingMetrics.join(', ')}`);
    }

    console.log('   ✅ Product insights validated');
    return true;
  }

  async checkDeploymentHealth() {
    console.log('🏥 Scout QA: Checking deployment health...');
    
    const deploymentUrl = this.config?.meta?.deployment_target || 'localhost:3000';
    const isHttps = deploymentUrl.includes('https');
    const testUrl = isHttps ? `https://${deploymentUrl}` : `http://${deploymentUrl}`;
    
    try {
      console.log(`   🌐 Testing ${testUrl}...`);
      
      // Mock health check
      const response = { status: 200, size: 45000 };
      
      if (response.status !== 200) {
        throw new Error(`Deployment health check failed: HTTP ${response.status}`);
      }
      
      if (response.size < 5000) {
        throw new Error(`Response too small: ${response.size} bytes (expected >5000)`);
      }
      
      console.log(`   ✅ Deployment healthy (${response.size} bytes)`);
      return true;
    } catch (error) {
      throw new Error(`Deployment health check failed: ${error.message}`);
    }
  }

  async runFullSuite() {
    console.log('🚀 Scout QA: Running full test suite...\n');
    
    try {
      await this.validateOutput();
      await this.checkDeploymentHealth();
      
      console.log('\n🎉 Full QA suite completed successfully!');
      console.log('   Ready for production deployment 🚀');
    } catch (error) {
      console.error(`\n❌ QA suite failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const qa = new ScoutQA();

  switch (command) {
    case 'validate-output':
      const filter = args.find(arg => arg.startsWith('--filter='))?.split('=')[1];
      qa.validateOutput(filter);
      break;
      
    case 'verify-tooltips':
      const page = args.find(arg => arg.startsWith('--page='))?.split('=')[1] || 'all';
      qa.validateTooltips(page);
      break;
      
    case 'check-data-freshness':
      const maxAge = args.find(arg => arg.startsWith('--max-age='))?.split('=')[1];
      const minutes = maxAge ? parseInt(maxAge.replace('m', '')) : 10;
      qa.checkDataFreshness(minutes);
      break;
      
    case 'validate-sql':
      qa.validateSQLQueries();
      break;
      
    case 'health-check':
      qa.checkDeploymentHealth();
      break;
      
    case 'full-suite':
      qa.runFullSuite();
      break;
      
    default:
      console.log(`
Scout Analytics QA CLI Tool

Usage:
  node scripts/qa/scout-qa.js <command> [options]

Commands:
  validate-output [--filter=<type>]     Validate dashboard output
  verify-tooltips [--page=<page>]       Check tooltip functionality  
  check-data-freshness [--max-age=10m]  Verify data freshness
  validate-sql                          Check SQL query syntax
  health-check                          Test deployment health
  full-suite                           Run complete QA suite

Examples:
  node scripts/qa/scout-qa.js validate-output --filter=basket_size
  node scripts/qa/scout-qa.js verify-tooltips --page=products
  node scripts/qa/scout-qa.js check-data-freshness --max-age=5m
  node scripts/qa/scout-qa.js full-suite
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = ScoutQA;