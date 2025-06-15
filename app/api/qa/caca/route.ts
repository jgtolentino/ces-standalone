import { NextRequest, NextResponse } from 'next/server';
import { 
  runAllTests, 
  runCESTests, 
  runScoutTests, 
  runCustomTest,
  generateTestReport 
} from '../../../../qa/ping_caca';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const format = searchParams.get('format') || 'json';

    let results;
    
    switch (type) {
      case 'ces':
        results = { ces: await runCESTests(), scout: [], summary: null };
        break;
      case 'scout':
        results = { ces: [], scout: await runScoutTests(), summary: null };
        break;
      case 'all':
      default:
        results = await runAllTests();
        break;
    }

    // Generate summary if not provided
    if (!results.summary) {
      const allResults = [...results.ces, ...results.scout];
      const passed = allResults.filter(r => r.passed).length;
      const failed = allResults.length - passed;
      
      results.summary = {
        totalTests: allResults.length,
        passed,
        failed,
        passRate: Math.round((passed / allResults.length) * 100)
      };
    }

    if (format === 'markdown') {
      const allResults = [...results.ces, ...results.scout];
      const report = generateTestReport(allResults);
      
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="caca-test-report.md"'
        }
      });
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      testType: type,
      results
    });

  } catch (error) {
    console.error('Caca QA API Error:', error);
    return NextResponse.json(
      { error: 'Failed to run QA tests', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, expectedKeywords, type = 'ces', context } = await request.json();

    if (!query || !expectedKeywords) {
      return NextResponse.json(
        { error: 'Query and expectedKeywords are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(expectedKeywords)) {
      return NextResponse.json(
        { error: 'expectedKeywords must be an array' },
        { status: 400 }
      );
    }

    const result = await runCustomTest(query, expectedKeywords, type, context);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      testType: 'custom',
      result
    });

  } catch (error) {
    console.error('Custom Caca Test Error:', error);
    return NextResponse.json(
      { error: 'Failed to run custom test', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}