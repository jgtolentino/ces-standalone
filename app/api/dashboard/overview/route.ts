import { NextRequest, NextResponse } from 'next/server'

// Simulated data generator - in production this would connect to Supabase
function generateDashboardData(filters: Record<string, string>) {
  const { timeframe, region, role } = filters

  // Adjust data based on timeframe
  const timeMultiplier = timeframe === '7d' ? 0.25 : 
                        timeframe === '30d' ? 1 :
                        timeframe === '90d' ? 3 :
                        timeframe === '365d' ? 12 : 1

  // Adjust data based on region
  const regionMultiplier = region === 'metro_manila' ? 1.5 :
                          region === 'cebu' ? 0.8 :
                          region === 'davao' ? 0.6 :
                          region === 'other' ? 0.4 : 1

  const baseRevenue = 45200000 * timeMultiplier * regionMultiplier
  const baseOrders = 12450 * timeMultiplier * regionMultiplier
  const baseAOV = baseRevenue / baseOrders
  const baseConversion = 4.8

  // Generate timeline data
  const timelineLength = timeframe === '7d' ? 7 :
                        timeframe === '30d' ? 30 :
                        timeframe === '90d' ? 90 : 365

  const revenueTimeline = Array.from({ length: Math.min(timelineLength, 30) }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (timelineLength - i - 1))
    const variance = 0.8 + Math.random() * 0.4 // ±20% variance
    return {
      date: date.toISOString().split('T')[0],
      value: Math.round((baseRevenue / timelineLength) * variance)
    }
  })

  // Generate category data
  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 'Food & Beverage',
    'Sports & Recreation', 'Books & Media', 'Automotive', 'Toys & Games', 'Office Supplies'
  ]

  const topCategories = categories.slice(0, 8).map((name, i) => {
    const revenue = baseRevenue * (0.3 - i * 0.03) * (0.8 + Math.random() * 0.4)
    return {
      name,
      revenue: Math.round(revenue),
      change: Math.round((Math.random() - 0.5) * 40) // ±20% change
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // Generate channel performance
  const channels = ['Online Store', 'Mobile App', 'Physical Stores', 'Marketplace']
  const channelPerformance = channels.map((channel, i) => {
    const percentage = [45, 30, 15, 10][i] * (0.8 + Math.random() * 0.4)
    return {
      channel,
      revenue: Math.round(baseRevenue * (percentage / 100)),
      percentage
    }
  })

  return {
    kpis: {
      revenue: {
        value: Math.round(baseRevenue),
        change: Math.round((Math.random() - 0.3) * 30), // Slight positive bias
        trend: Math.random() > 0.3 ? 'up' : 'down' as const
      },
      orders: {
        value: Math.round(baseOrders),
        change: Math.round((Math.random() - 0.3) * 25),
        trend: Math.random() > 0.3 ? 'up' : 'down' as const
      },
      aov: {
        value: Math.round(baseAOV),
        change: Math.round((Math.random() - 0.5) * 20),
        trend: Math.random() > 0.5 ? 'up' : 'down' as const
      },
      conversion: {
        value: Math.round(baseConversion * 10) / 10,
        change: Math.round((Math.random() - 0.5) * 2 * 10) / 10,
        trend: Math.random() > 0.5 ? 'up' : 'down' as const
      }
    },
    revenueTimeline,
    topCategories,
    channelPerformance,
    metadata: {
      lastUpdated: new Date().toISOString(),
      dataSource: 'supabase_simulation',
      filters
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      timeframe: searchParams.get('timeframe') || '30d',
      region: searchParams.get('region') || 'all',
      role: searchParams.get('role') || 'executive'
    }

    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const data = generateDashboardData(filters)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300', // Cache for 5 minutes
      }
    })

  } catch (error) {
    console.error('Dashboard overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// Additional endpoints for real-time updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, filters } = body

    if (action === 'refresh') {
      const data = generateDashboardData(filters)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Dashboard refresh API error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh dashboard data' },
      { status: 500 }
    )
  }
}