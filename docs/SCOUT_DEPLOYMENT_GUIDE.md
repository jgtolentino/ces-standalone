# Scout Dashboard v3.1.0 - Market Share Analytics Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Generate Realistic Data
```bash
cd scripts
python3 scout_data_generator_updated.py --transactions 75000 --days 360 --format csv
```

This creates `scout_realistic_data.csv` with:
- 75,000 transactions over 360 days
- Realistic market shares: JTI 40%, TBWA 20%, Competitors 40%
- Authentic Philippine retail patterns

### Step 2: Deploy Database Schema

1. Open [Supabase SQL Editor](https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new)
2. Copy and paste the contents of `scripts/scout_market_share_schema.sql`
3. Click "Run" to execute

This creates:
- Market segment columns in `master_brands`
- Performance views for analytics
- KPI functions
- Optimized indexes

### Step 3: Load Data to Supabase

```bash
cd scripts
pip install supabase pandas python-dotenv
python3 load_scout_data.py
```

This will:
- Load 75,000 transactions
- Create customers and map them properly
- Maintain market share accuracy
- Verify the deployment

## 📊 Verify Deployment

### Check Market Shares
Run this query in [Supabase SQL Editor](https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new):

```sql
-- Market Share Summary
SELECT * FROM get_market_share_kpis();

-- Detailed Market Performance
SELECT 
    market_segment,
    transaction_count,
    transaction_share_pct,
    revenue_share_pct
FROM scout_market_share_performance 
WHERE month >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY transaction_count DESC;
```

### Expected Results
- JTI: ~40% market share
- TBWA (non-JTI): ~20% market share
- Competitors: ~40% market share

## 🎯 What's Deployed

### 1. Enhanced Schema
- `master_brands.market_segment`: Tracks JTI vs TBWA vs Competitors
- `master_brands.is_jti_brand`: Boolean flag for tobacco products

### 2. Analytics Views
- `scout_market_share_performance`: Real-time market share tracking
- `scout_jti_analysis`: JTI brand dominance metrics
- `scout_competitive_dashboard`: Head-to-head comparisons
- `scout_360_day_trends`: Long-term trend analysis

### 3. KPI Function
- `get_market_share_kpis()`: Returns current vs target market shares

### 4. Performance Indexes
- Optimized for 360-day queries
- Sub-second response times

## 🔧 Troubleshooting

### If schema deployment fails:
- Check you're connected to the correct project
- Ensure you have admin privileges
- Try running each section separately

### If data load fails:
- Verify `.env.local` has correct Supabase credentials
- Check the CSV file was generated successfully
- Try loading in smaller chunks

### If market shares are incorrect:
- Re-run the data generator with seed parameter for consistency
- Check the brand mappings in the database
- Verify the market_segment updates applied correctly

## 📈 Next Steps

1. **Update Frontend Components**
   - Add market segment filters
   - Create market share visualizations
   - Update KPI cards

2. **Configure Alerts**
   - Set up market share deviation alerts
   - Monitor competitive threats
   - Track JTI performance

3. **Enable Advanced Analytics**
   - Predictive market share models
   - Campaign attribution analysis
   - Regional performance tracking

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Market share KPIs show ~40/20/40 distribution
- ✅ 360-day trends view has data
- ✅ JTI analysis shows tobacco brands
- ✅ Competitive dashboard loads without errors

---

**Need Help?** Check the detailed logs in the deployment scripts or review the [Market Share Analytics Documentation](./SCOUT_MARKET_SHARE_ANALYTICS.md).