# Scout Analytics Power BI v3.3.0 - Final Package

## 📦 Package Contents

```
scout-cdb-platform/static_deploy/
├── generate_pbix_connected.sh              # ✅ Main deployment script
├── pbix_config_scout_advisor.json          # ✅ Scout Advisor UI theme
├── FetchFromDAL.m                          # ✅ Dynamic dataset function
├── DataSource.m                            # ✅ Static fallback connector
├── ScoutAnalytics_v3.2.0.pbix.placeholder  # 📍 Place your original .pbix here
└── README.md                               # 📖 This file
```

## 🚀 Quick Start

### 1. Prepare Your Original File
```bash
# Copy your existing Power BI file to this directory
cp /path/to/your/ScoutAnalytics_v3.2.0.pbix ./
```

### 2. Set Environment Variables
```bash
export DAL_ENDPOINT="https://your-domain.vercel.app/api/powerbi/dal"
export POWERBI_TOKEN="your_bearer_token_here"
export POWERBI_WORKSPACE="RetailOps"  # Optional
```

### 3. Generate Final Package
```bash
./generate_pbix_connected.sh
```

## 🎨 Scout Advisor Theme Features

The `pbix_config_scout_advisor.json` theme provides:

- **Navigation Bar Blue**: `#1D4ED8` (matches Scout Advisor UI)
- **KPI Highlight Cards**: Yellow/Green/Red semantic colors
- **Inter Font Family**: Applied across all visuals
- **Card Styling**: Rounded corners, proper spacing, subtle shadows
- **Grid Layout**: Matches dashboard screenshot layout

## 🔌 DAL Integration

### Available Datasets
| Dataset ID | Description | Source |
|------------|-------------|---------|
| `kpi_revenue_2024` | Revenue, Transactions, AOV, Margin | Supabase |
| `campaign_performance` | CTR, ROI, Impressions, CPC | Azure SQL |
| `audience_insights` | Age, Gender, Region, Income | Supabase |
| `channel_analytics` | Media channel metrics | Azure SQL |
| `qa_validation_logs` | UI audit trail | Audit DB |

### Dynamic Function Usage
```m
// Basic usage
FetchFromDAL("kpi_revenue_2024")

// With filters
FetchFromDAL("campaign_performance", [
  dateRange = [start = "2024-01-01", end = "2024-03-31"]
])

// Different query types
FetchFromDAL("audience_insights", [], "demographics")
```

## 📋 Deployment Process

The script will:

1. **Preserve Original**: Copy `v3.2.0.pbix` → `v3.3.0.pbix` (original unchanged)
2. **Validate Theme**: Check JSON syntax of Scout Advisor theme
3. **Configure DAL**: Inject endpoint and token into M functions
4. **Generate Instructions**: Create detailed setup guide
5. **Optional Upload**: Upload to Power BI Service (if configured)

## 🔐 Security

- **Bearer Token Auth**: All DAL calls require valid token
- **Environment Variables**: Sensitive data not hardcoded
- **File Preservation**: Original .pbix files remain unchanged

## 📊 Output Files

After running the script:

```
├── ScoutAnalytics_v3.2.0.pbix         # 🔒 Original (preserved)
├── ScoutAnalytics_v3.3.0.pbix         # ✅ New version with theme + DAL
├── DEPLOYMENT_INSTRUCTIONS.md         # 📖 Step-by-step setup guide
└── ScoutAnalytics_Template_v3.3.0.pbit.info  # 📝 Template creation guide
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual setup:

### 1. Import Theme
1. Open Power BI Desktop
2. **View** → **Themes** → **Browse for themes**
3. Select `pbix_config_scout_advisor.json`
4. Click **Apply**

### 2. Add DAL Function
1. **Home** → **Get Data** → **Blank Query**
2. **Advanced Editor** → Copy content from `FetchFromDAL.m`
3. Replace `{{DAL_ENDPOINT}}` and `{{POWERBI_TOKEN}}`
4. Rename query to "FetchFromDAL"

### 3. Create Dataset Selector
Create a table with dataset IDs for dropdown selection:
```
datasetId
kpi_revenue_2024
campaign_performance
audience_insights
channel_analytics
qa_validation_logs
```

## 🔄 Data Refresh

- **Automatic**: 5-minute refresh cycle (matches existing Scout Analytics)
- **Manual**: Right-click dataset → Refresh data
- **Scheduled**: Configure in Power BI Service after upload

## 🚨 Troubleshooting

### Common Issues

1. **Theme Not Applied**
   - Ensure JSON is valid: `jq empty pbix_config_scout_advisor.json`
   - Check file permissions
   - Try manual import via Power BI Desktop

2. **DAL Connection Failed**
   - Verify `DAL_ENDPOINT` is accessible
   - Check `POWERBI_TOKEN` is valid
   - Test endpoint: `curl -H "Authorization: Bearer $POWERBI_TOKEN" "$DAL_ENDPOINT"`

3. **Dataset Not Found**
   - Verify dataset ID exists in registry
   - Check spelling and case sensitivity
   - Review available datasets via GET request

### Debug Mode
```bash
# Enable verbose output
DAL_ENDPOINT="https://your-domain.com" POWERBI_TOKEN="your-token" ./generate_pbix_connected.sh
```

## 📞 Support

- **Technical Issues**: Contact Scout Analytics team
- **Theme Problems**: Check `pbix_config_scout_advisor.json` syntax
- **DAL Issues**: Verify endpoint and authentication
- **Power BI Help**: Follow `DEPLOYMENT_INSTRUCTIONS.md`

## 📄 Version History

- **v3.3.0**: Scout Advisor UI theme integration + DAL connectivity
- **v3.2.0**: Previous version (preserved as backup)

---

**Ready to deploy Scout Analytics Power BI with Scout Advisor UI theme and full DAL integration!**
