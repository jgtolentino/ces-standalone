// Caca QA Validation System for CES and Scout Analytics
// Simple snapshot testing and regression validation

import { LLMUtils } from '../utils/llm';
import { getCESContext, getScoutContext } from '../utils/context';

interface CacaTestCase {
  id: string;
  name: string;
  query: string;
  context?: any;
  expectedKeywords: string[];
  type: 'ces' | 'scout' | 'general';
}

interface CacaTestResult {
  testId: string;
  passed: boolean;
  response: string;
  matchedKeywords: string[];
  missedKeywords: string[];
  score: number;
  timestamp: string;
}

/**
 * CES-specific test cases
 */
const CES_TEST_CASES: CacaTestCase[] = [
  {
    id: 'ces_001',
    name: 'Alaska Brand Creative Analysis',
    query: 'What makes effective creative for Alaska brand?',
    context: { brand: 'Alaska', region: 'NCR' },
    expectedKeywords: ['memorability', 'brand connection', 'dairy', 'family', 'nutrition'],
    type: 'ces'
  },
  {
    id: 'ces_002', 
    name: 'CES Framework Application',
    query: 'How can I improve brand recall for this campaign?',
    context: { campaignId: 'test_campaign' },
    expectedKeywords: ['memorability', 'brand recall', 'creative', 'effectiveness'],
    type: 'ces'
  },
  {
    id: 'ces_003',
    name: 'Emotional Resonance Analysis',
    query: 'What emotional triggers work best for Oishi snacks?',
    context: { brand: 'Oishi' },
    expectedKeywords: ['emotional', 'fun', 'kids', 'snacks', 'engagement'],
    type: 'ces'
  }
];

/**
 * Scout Analytics test cases
 */
const SCOUT_TEST_CASES: CacaTestCase[] = [
  {
    id: 'scout_001',
    name: 'Regional Performance Analysis',
    query: 'How is Alaska performing in NCR vs Visayas?',
    context: { brand: 'Alaska' },
    expectedKeywords: ['regional', 'performance', 'NCR', 'market share', 'analysis'],
    type: 'scout'
  },
  {
    id: 'scout_002',
    name: 'Consumer Behavior Insights',
    query: 'What are the shopping patterns for dairy products?',
    context: { category: 'dairy' },
    expectedKeywords: ['consumer', 'behavior', 'patterns', 'dairy', 'shopping'],
    type: 'scout'
  }
];

/**
 * Run individual CES test case
 */
export async function pingCacaCES(testCase: CacaTestCase): Promise<CacaTestResult> {
  try {
    const context = testCase.context ? await getCESContext(testCase.context) : '';
    const response = await LLMUtils.queryCES(testCase.query, context);
    
    return validateResponse(testCase, response);
  } catch (error) {
    return {
      testId: testCase.id,
      passed: false,
      response: `Error: ${error instanceof Error ? error.message : String(error)}`,
      matchedKeywords: [],
      missedKeywords: testCase.expectedKeywords,
      score: 0,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run individual Scout test case
 */
export async function pingCacaScout(testCase: CacaTestCase): Promise<CacaTestResult> {
  try {
    const context = testCase.context ? await getScoutContext(testCase.context) : '';
    const response = await LLMUtils.queryScout(testCase.query, context);
    
    return validateResponse(testCase, response);
  } catch (error) {
    return {
      testId: testCase.id,
      passed: false,
      response: `Error: ${error instanceof Error ? error.message : String(error)}`,
      matchedKeywords: [],
      missedKeywords: testCase.expectedKeywords,
      score: 0,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run all CES test cases
 */
export async function runCESTests(): Promise<CacaTestResult[]> {
  const results: CacaTestResult[] = [];
  
  for (const testCase of CES_TEST_CASES) {
    const result = await pingCacaCES(testCase);
    results.push(result);
  }
  
  return results;
}

/**
 * Run all Scout test cases
 */
export async function runScoutTests(): Promise<CacaTestResult[]> {
  const results: CacaTestResult[] = [];
  
  for (const testCase of SCOUT_TEST_CASES) {
    const result = await pingCacaScout(testCase);
    results.push(result);
  }
  
  return results;
}

/**
 * Run all test cases
 */
export async function runAllTests(): Promise<{
  ces: CacaTestResult[];
  scout: CacaTestResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}> {
  const cesResults = await runCESTests();
  const scoutResults = await runScoutTests();
  
  const allResults = [...cesResults, ...scoutResults];
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.length - passed;
  
  return {
    ces: cesResults,
    scout: scoutResults,
    summary: {
      totalTests: allResults.length,
      passed,
      failed,
      passRate: Math.round((passed / allResults.length) * 100)
    }
  };
}

/**
 * Validate response against expected keywords
 */
function validateResponse(testCase: CacaTestCase, response: string): CacaTestResult {
  const lowerResponse = response.toLowerCase();
  const matchedKeywords: string[] = [];
  const missedKeywords: string[] = [];
  
  for (const keyword of testCase.expectedKeywords) {
    if (lowerResponse.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    } else {
      missedKeywords.push(keyword);
    }
  }
  
  const score = Math.round((matchedKeywords.length / testCase.expectedKeywords.length) * 100);
  const passed = score >= 60; // 60% keyword match threshold
  
  return {
    testId: testCase.id,
    passed,
    response,
    matchedKeywords,
    missedKeywords,
    score,
    timestamp: new Date().toISOString()
  };
}

/**
 * Custom test case runner
 */
export async function runCustomTest(
  query: string,
  expectedKeywords: string[],
  type: 'ces' | 'scout' = 'ces',
  context?: any
): Promise<CacaTestResult> {
  const testCase: CacaTestCase = {
    id: 'custom_' + Date.now(),
    name: 'Custom Test',
    query,
    context,
    expectedKeywords,
    type
  };
  
  if (type === 'ces') {
    return pingCacaCES(testCase);
  } else {
    return pingCacaScout(testCase);
  }
}

/**
 * Generate test report
 */
export function generateTestReport(results: CacaTestResult[]): string {
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  const passRate = Math.round((passed / results.length) * 100);
  
  let report = `# Caca QA Test Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Total Tests:** ${results.length}\n`;
  report += `**Passed:** ${passed}\n`;
  report += `**Failed:** ${failed}\n`;
  report += `**Pass Rate:** ${passRate}%\n\n`;
  
  if (passRate >= 80) {
    report += `✅ **Status: HEALTHY** - System is performing well\n\n`;
  } else if (passRate >= 60) {
    report += `⚠️ **Status: WARNING** - Some issues detected\n\n`;
  } else {
    report += `❌ **Status: CRITICAL** - Significant issues found\n\n`;
  }
  
  report += `## Test Results\n\n`;
  
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    report += `### ${status} ${result.testId} (Score: ${result.score}%)\n`;
    report += `**Matched Keywords:** ${result.matchedKeywords.join(', ') || 'None'}\n`;
    if (result.missedKeywords.length > 0) {
      report += `**Missed Keywords:** ${result.missedKeywords.join(', ')}\n`;
    }
    report += `\n`;
  }
  
  return report;
}

// Export test cases for external use
export { CES_TEST_CASES, SCOUT_TEST_CASES };