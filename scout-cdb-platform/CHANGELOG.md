# Changelog

All notable changes to Scout Analytics Power BI Integration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0] - 2025-06-17

### 🎨 Added - Scout Advisor UI Integration
- **Scout Advisor Theme**: Complete visual theme matching Scout Advisor UI
  - Navigation bar blue (#1D4ED8) exact color match
  - KPI highlight cards with yellow/green/red semantic colors
  - Inter font family applied across all Power BI visuals
  - Professional card styling with rounded corners and proper spacing
  - Grid layout matching dashboard screenshot layout

### 🔌 Added - DAL Connectivity
- **Complete DAL Integration**: Full Data Abstraction Layer connectivity
  - 5 dataset registry: revenue, campaigns, audience, channels, QA logs
  - Bearer token authentication for secure API access
  - Dynamic filtering support (date ranges, channels, regions)
  - Multi-query type support (main, summary, demographics)
  - Comprehensive error handling and validation

### 🛠️ Added - Power BI Functions
- **FetchFromDAL.m**: Dynamic multi-dataset function
  - Environment variable injection support
  - Comprehensive Power BI documentation
  - Error handling and validation
  - Multi-dataset support with dropdown selection
- **DataSource.m**: Static fallback connector for single datasets

### 🚀 Added - Deployment Automation
- **generate_pbix_connected.sh**: Complete deployment script
  - Automated file generation and validation
  - Environment variable injection
  - Theme application and validation
  - Deployment instruction generation
  - File preservation (original .pbix files unchanged)
  - Power BI Service upload support

### 📦 Added - Static Deploy Package
- **Complete Final Package**: Ready-to-use deployment package
  - All necessary files in single directory
  - Comprehensive setup documentation
  - Troubleshooting guides
  - Version control and rollback support

### 🔐 Added - Security Features
- Bearer token authentication for all DAL calls
- Environment variable protection (no hardcoded secrets)
- Input validation and sanitization
- Secure error handling without data exposure

### 📖 Added - Documentation
- Complete README with architecture diagrams
- Step-by-step deployment instructions
- API reference documentation
- Troubleshooting guide with common issues
- Usage examples and best practices

### 🧪 Added - Testing & Validation
- Theme JSON validation
- DAL endpoint connectivity testing
- Environment variable validation
- File integrity checks

## [3.2.0] - Previous Version
- Base Power BI implementation
- Initial dashboard layout
- Basic data connections

---

## Migration Guide: 3.2.0 → 3.3.0

### Prerequisites
- Power BI Desktop 2.0 or higher
- Access to Scout Analytics DAL endpoint
- Valid Power BI authentication token

### Migration Steps

1. **Backup Current Files**
   ```bash
   cp ScoutAnalytics_v3.2.0.pbix backup/
   ```

2. **Set Environment Variables**
   ```bash
   export DAL_ENDPOINT="https://your-domain.vercel.app/api/powerbi/dal"
   export POWERBI_TOKEN="your_bearer_token_here"
   ```

3. **Run Migration Script**
   ```bash
   cd scout-cdb-platform/static_deploy
   ./generate_pbix_connected.sh
   ```

4. **Apply Theme in Power BI Desktop**
   - Open generated ScoutAnalytics_v3.3.0.pbix
   - View → Themes → Browse for themes
   - Select pbix_config_scout_advisor.json
   - Click Apply

5. **Configure DAL Function**
   - Home → Get Data → Blank Query
   - Advanced Editor → Copy FetchFromDAL.m content
   - Replace placeholders with actual values
   - Rename query to "FetchFromDAL"

### Breaking Changes
- New theme file format (Scout Advisor specific)
- Updated DAL endpoint structure requires new environment variables
- Power BI function signatures changed for multi-dataset support

### Rollback Plan
If issues occur, restore original files:
```bash
cp backup/ScoutAnalytics_v3.2.0.pbix ./
# Revert environment variables
# Use previous theme file
```

---

## Support

### Documentation
- [Setup Guide](static_deploy/README.md)
- [Deployment Instructions](static_deploy/DEPLOYMENT_INSTRUCTIONS.md)
- [API Reference](README.md#dal-api-reference)

### Troubleshooting
- [Common Issues](static_deploy/README.md#troubleshooting)
- [Debug Mode](static_deploy/README.md#debug-mode)

### Contact
- Technical Issues: Scout Analytics Team
- Theme Problems: Check JSON syntax validation
- DAL Issues: Verify endpoint and authentication

---

## Release Notes

### v3.3.0 Highlights
✅ **Perfect Visual Match**: Scout Advisor UI theme integration  
✅ **Complete DAL Integration**: 5 datasets with dynamic filtering  
✅ **Enterprise Security**: Bearer token auth and environment protection  
✅ **Automated Deployment**: One-command setup and configuration  
✅ **File Safety**: Original .pbix files preserved during upgrade  
✅ **Professional Quality**: Enterprise-ready implementation  

### Performance Improvements
- Optimized DAL queries with caching support
- Reduced theme file size with efficient styling
- Faster deployment script execution
- Improved error handling and validation

### Developer Experience
- Comprehensive documentation and examples
- Clear migration path from v3.2.0
- Automated testing and validation
- Modular architecture for easy maintenance

---

**Ready for production deployment with Scout Advisor UI theme and full DAL connectivity!**
