#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');

const CES_DEPLOYMENT_URL = process.env.CES_DEPLOYMENT_URL || 'https://ces-mvp.vercel.app';
const REQUIRED_PAGES = [
  '/ces/overview',
  '/ces/scorecard', 
  '/ces/prompts',
  '/ces/insights',
  '/ces/segments'
];

console.log('🔍 CES Dashboard v1.3.0 - Production Verification');
console.log('=' * 60);

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          content: data,
          headers: res.headers
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verifyDeployment() {
  const results = {
    pages: {},
    overall: true,
    errors: []
  };

  console.log(`\n📍 Testing deployment: ${CES_DEPLOYMENT_URL}`);

  // Check each required page
  for (const page of REQUIRED_PAGES) {
    const url = `${CES_DEPLOYMENT_URL}${page}`;
    console.log(`\n🔗 Checking: ${page}`);
    
    try {
      const response = await checkUrl(url);
      const isValid = response.status === 200 && 
                     response.content.length > 5000 &&
                     !response.content.includes('Error') &&
                     response.content.includes('CES');

      results.pages[page] = {
        status: response.status,
        size: response.content.length,
        valid: isValid,
        hasReact: response.content.includes('react'),
        hasComponents: response.content.includes('component') || response.content.includes('Component')
      };

      if (isValid) {
        console.log(`  ✅ Status: ${response.status} | Size: ${response.content.length}b | Valid: ✓`);
      } else {
        console.log(`  ❌ Status: ${response.status} | Size: ${response.content.length}b | Valid: ✗`);
        results.overall = false;
        results.errors.push(`Page ${page} failed validation`);
      }

    } catch (error) {
      console.log(`  ❌ Failed to load: ${error.message}`);
      results.pages[page] = { error: error.message, valid: false };
      results.overall = false;
      results.errors.push(`Page ${page} failed to load: ${error.message}`);
    }
  }

  // Check for console errors (if puppeteer available)
  try {
    console.log('\n🕵️ Checking for JavaScript errors...');
    const checkErrors = `
      const puppeteer = require('puppeteer');
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        await page.goto('${CES_DEPLOYMENT_URL}/ces/overview');
        await page.waitForTimeout(3000);
        await browser.close();
        if (errors.length > 0) {
          console.log('❌ Console errors found:', errors);
          process.exit(1);
        } else {
          console.log('✅ No console errors detected');
        }
      })();
    `;
    
    // Only run if puppeteer is available
    try {
      require.resolve('puppeteer');
      eval(checkErrors);
    } catch (e) {
      console.log('  ⚠️ Puppeteer not available, skipping console error check');
    }
  } catch (e) {
    console.log('  ⚠️ JavaScript error checking skipped');
  }

  // Final validation
  console.log('\n📊 DEPLOYMENT VERIFICATION SUMMARY:');
  console.log('=' * 50);
  
  const passedPages = Object.values(results.pages).filter(p => p.valid).length;
  const totalPages = REQUIRED_PAGES.length;
  
  console.log(`✅ Pages working: ${passedPages}/${totalPages}`);
  console.log(`🎯 Overall status: ${results.overall ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    results.errors.forEach(error => console.log(`  • ${error}`));
  }

  // CES-specific validations
  console.log('\n🧪 CES-SPECIFIC VALIDATIONS:');
  
  const cesValidations = [
    { name: 'YAML spec exists', check: () => require('fs').existsSync('./specs/ces.yaml') },
    { name: 'All 5 pages implemented', check: () => passedPages === 5 },
    { name: 'Zustand store configured', check: () => require('fs').existsSync('./lib/store.ts') },
    { name: 'Components mapped correctly', check: () => {
      const overview = require('fs').readFileSync('./pages/overview.tsx', 'utf8');
      return overview.includes('CreativeScoreCard') && overview.includes('RadarChart');
    }},
    { name: 'TypeScript configured', check: () => require('fs').existsSync('./tsconfig.json') }
  ];

  cesValidations.forEach(validation => {
    try {
      const passed = validation.check();
      console.log(`  ${passed ? '✅' : '❌'} ${validation.name}`);
      if (!passed) results.overall = false;
    } catch (e) {
      console.log(`  ❌ ${validation.name} (error: ${e.message})`);
      results.overall = false;
    }
  });

  console.log('\n' + '=' * 60);
  console.log(`🎯 FINAL RESULT: ${results.overall ? '🎉 PRODUCTION READY' : '💥 NEEDS FIXES'}`);
  
  if (results.overall) {
    console.log('✅ CES Dashboard v1.3.0 is ready for production lock!');
    return true;
  } else {
    console.log('❌ Issues found. Please fix before production deployment.');
    return false;
  }
}

// Run verification
if (require.main === module) {
  verifyDeployment()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyDeployment };