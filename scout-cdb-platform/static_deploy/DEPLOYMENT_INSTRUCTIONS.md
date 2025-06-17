# Scout Analytics v3.3.0 Power BI Deployment

## Files in this package:
- `ScoutAnalytics_v3.3.0.pbix` - Main Power BI file with Scout Advisor theme
- `./pbix_config_scout_advisor.json` - Scout Advisor UI theme (navigation bar blue #1D4ED8)
- `FetchFromDAL.m` - Dynamic dataset function
- `DataSource.m` - Static fallback connector

## Setup Instructions:

### 1. Import Theme
1. Open Power BI Desktop
2. Go to **View** → **Themes** → **Browse for themes**
3. Select `./pbix_config_scout_advisor.json`
4. Click **Apply**

### 2. Connect to DAL
1. Go to **Home** → **Get Data** → **Blank Query**
2. Open **Advanced Editor**
3. Copy content from `FetchFromDAL.m`
4. Replace `{{DAL_ENDPOINT}}` with: `http://localhost:3000`
5. Replace `{{POWERBI_TOKEN}}` with your token
6. Click **Done**

### 3. Dataset Selection
Create a table with these datasets:
- kpi_revenue_2024 (Revenue, Transactions, AOV, Margin)
- campaign_performance (CTR, ROI, Impressions, CPC)
- audience_insights (Age, Gender, Region, Income)
- channel_analytics (Media channel metrics)
- qa_validation_logs (UI audit trail)

### 4. Usage
```m
// Fetch revenue data
FetchFromDAL("kpi_revenue_2024")

// Fetch with filters
FetchFromDAL("campaign_performance", [dateRange = [start = "2024-01-01", end = "2024-03-31"]])
```

## Theme Features:
✅ Navigation bar blue (#1D4ED8) matching Scout Advisor UI
✅ KPI highlight cards (yellow/green/red)
✅ Inter font family applied
✅ Card backgrounds and grid spacing match dashboard

## Support:
Contact Scout Analytics team for technical support.
