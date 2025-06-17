# Scout Analytics Power BI Integration

Complete Power BI integration for Scout Analytics platform with Data Abstraction Layer (DAL) connectivity, professional theming, and multi-dataset support.

## 🏗️ Architecture Overview

```mermaid
graph TD
    A[Power BI Desktop] --> B[DataSource.m / FetchFromDAL.m]
    B --> C[/api/powerbi/dal]
    C --> D[Dataset Registry]
    D --> E[lib/database.ts]
    E --> F[Azure PostgreSQL / Supabase]
    
    G[generate_pbix_connected.sh] --> H[Environment Injection]
    H --> B
    
    I[pbix_config.json] --> J[Professional Theme]
    J --> A
    
    K[Bearer Token Auth] --> C
```

## 📁 Directory Structure

```
scout-cdb-platform/
├── powerbi/
│   ├── DataSource.m           # Static dataset connector template
│   └── FetchFromDAL.m         # Dynamic multi-dataset function
├── themes/
│   └── pbix_config.json       # Professional blue theme (Tailwind-matched)
└── scripts/
    └── generate_pbix_connected.sh  # Deployment automation script
```

## 🚀 Quick Start

### 1. Environment Setup

Copy and configure environment variables:

```bash
cp .env.example .env.local
```

Required variables:
```bash
DAL_ENDPOINT=https://your-domain.vercel.app
POWERBI_TOKEN=your_powerbi_bearer_token_here
```

### 2. Generate Power BI Files

```bash
# Basic generation with default dataset
./scout-cdb-platform/scripts/generate_pbix_connected.sh

# Generate for specific dataset
./scout-cdb-platform/scripts/generate_pbix_connected.sh --dataset-id campaign_performance

# Generate with custom workspace and verbose output
./scout-cdb-platform/scripts/generate_pbix_connected.sh \
  --dataset-id audience_insights \
  --workspace "Marketing Analytics" \
  --verbose
```

### 3. Import into Power BI Desktop

1. **Import Data Source:**
   - Open Power BI Desktop
   - Go to **Home** → **Get Data** → **Blank Query**
   - Open **Advanced Editor**
   - Copy content from `output/datasources/DataSource_[dataset].m`
   - Click **Done** and **Close & Apply**

2. **Apply Theme:**
   - Go to **View** → **Themes** → **Browse for themes**
   - Select `output/themes/scout_analytics_theme.json`
   - Click **Apply**

3. **Import Dynamic Function (Optional):**
   - Create new **Blank Query**
   - Copy content from `output/functions/FetchFromDAL.m`
   - Rename query to "FetchFromDAL"

## 📊 Available Datasets

| Dataset ID | Description | Data Source | Query Types |
|------------|-------------|-------------|-------------|
| `kpi_revenue_2024` | Revenue, Transactions, AOV, Margin | Supabase | main, summary |
| `campaign_performance` | CTR, ROI, Impressions, CPC | Azure SQL | main, summary |
| `audience_insights` | Age, Gender, Region, Income | Supabase | main, demographics |
| `channel_analytics` | Media channel metrics (FB, IG, TV, In-store) | Azure SQL | main, summary |
| `qa_validation_logs` | UI audit trail from Caca + VibeTestBot | Audit DB | main, summary |

## 🎨 Theme Features

The professional theme includes:

- **Color Palette:** Indigo 900 primary, Sky 500 accent, semantic colors
- **Typography:** Inter font family with proper weights
- **Visual Styles:** Consistent styling across all Power BI visuals
- **Branding:** Matches Scout Analytics Tailwind design system

### Color Scheme
```json
{
  "primary": "#1E3A8A",     // Indigo 900
  "accent": "#0EA5E9",      // Sky 500
  "success": "#22C55E",     // Emerald 500
  "warning": "#F59E0B",     // Amber 500
  "error": "#EF4444",       // Red 500
  "info": "#8B5CF6"         // Violet 500
}
```

## 🔌 DAL API Reference

### Endpoint
```
POST /api/powerbi/dal
```

### Authentication
```bash
Authorization: Bearer YOUR_POWERBI_TOKEN
```

### Request Body
```json
{
  "datasetId": "kpi_revenue_2024",
  "filters": {
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "channel": "Facebook",
    "region": "US"
  },
  "queryType": "main"
}
```

### Response Format
```json
{
  "datasetId": "kpi_revenue_2024",
  "description": "Revenue, Transactions, AOV, Margin",
  "source": "supabase",
  "queryType": "main",
  "filters": {...},
  "data": [...],
  "metadata": {
    "recordCount": 1250,
    "executedAt": "2024-06-17T02:24:00Z",
    "queryExecutionTime": 145
  }
}
```

## 🔧 Dynamic Function Usage

Once the `FetchFromDAL` function is imported, use it in Power BI queries:

```m
// Basic usage - fetch revenue data
FetchFromDAL("kpi_revenue_2024")

// With date filters
FetchFromDAL("campaign_performance", [
  dateRange = [
    start = "2024-01-01", 
    end = "2024-03-31"
  ]
])

// With channel filter
FetchFromDAL("channel_analytics", [
  channel = "Facebook"
])

// Fetch demographics summary
FetchFromDAL("audience_insights", [], "demographics")

// Multiple filters
FetchFromDAL("campaign_performance", [
  dateRange = [start = "2024-01-01", end = "2024-03-31"],
  channel = "Instagram"
], "summary")
```

## 🛠️ Script Options

The deployment script supports various options:

```bash
./scout-cdb-platform/scripts/generate_pbix_connected.sh [OPTIONS]

OPTIONS:
  --dataset-id DATASET_ID     Dataset ID to use (default: kpi_revenue_2024)
  --workspace WORKSPACE       Power BI workspace name (default: RetailOps)
  --no-theme                  Skip theme application
  --upload                    Upload to Power BI Service (requires auth)
  --output-dir DIR            Output directory (default: ./output)
  --verbose                   Enable verbose output
  --help                      Show help message
```

### Examples

```bash
# Generate for campaign performance
./scout-cdb-platform/scripts/generate_pbix_connected.sh --dataset-id campaign_performance

# Generate without theme
./scout-cdb-platform/scripts/generate_pbix_connected.sh --no-theme

# Generate with custom output directory
./scout-cdb-platform/scripts/generate_pbix_connected.sh --output-dir /tmp/powerbi

# Verbose output for debugging
./scout-cdb-platform/scripts/generate_pbix_connected.sh --verbose
```

## 🔄 Data Refresh

### Automatic Refresh
- Data refreshes every 5 minutes automatically
- Leverages existing Scout Analytics refresh cycle
- Real-time data availability

### Manual Refresh
1. Right-click dataset in **Fields** pane
2. Select **Refresh data**
3. Or use **Home** → **Refresh**

## 🔐 Security & Authentication

### Bearer Token Authentication
- All API calls require valid bearer token
- Token configured via `POWERBI_TOKEN` environment variable
- Supports role-based access control

### Data Security
- Row-level security supported
- Data masking capabilities
- Audit logging enabled
- Session timeout: 1 hour

## 🚨 Troubleshooting

### Connection Issues
```bash
# Test DAL endpoint connectivity
curl -H "Authorization: Bearer $POWERBI_TOKEN" \
     "$DAL_ENDPOINT/api/powerbi/dal"
```

### Common Problems

1. **Authentication Errors**
   - Verify `POWERBI_TOKEN` is set correctly
   - Check token hasn't expired
   - Confirm token has appropriate permissions

2. **Data Issues**
   - Validate dataset ID exists in registry
   - Check filter format matches expected schema
   - Review Power BI Desktop query logs

3. **Theme Issues**
   - Ensure JSON is valid (use `jq` to validate)
   - Check file permissions
   - Verify theme file path

### Debug Mode
```bash
# Enable verbose logging
./scout-cdb-platform/scripts/generate_pbix_connected.sh --verbose

# Check generated files
ls -la output/
cat output/logs/deployment_*.log
```

## 📈 Performance Optimization

### Query Performance
- Indexed database queries
- Result caching enabled
- Compression for large datasets
- Lazy loading for complex visuals

### Thresholds
- Page load: < 2 seconds
- Query response: < 500ms
- Data refresh: < 30 seconds

## 🔮 Future Enhancements

- [ ] Power BI Service REST API integration
- [ ] Automated .pbix file generation
- [ ] Advanced filtering capabilities
- [ ] Real-time streaming datasets
- [ ] Custom connector development
- [ ] Multi-tenant workspace support

## 📞 Support

For technical support:
- Check deployment logs in `output/logs/`
- Review troubleshooting section above
- Contact Scout Analytics team
- Submit issues via project repository

## 📄 License

Part of Scout Analytics platform - internal use only.

---

**Version:** 1.0.0  
**Last Updated:** June 2024  
**Maintainer:** Scout Analytics Team
