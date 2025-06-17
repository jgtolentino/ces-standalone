#!/bin/bash

# Scout Analytics Power BI Template (.pbit) Export Script
# Version: 3.3.0

set -euo pipefail

TEMPLATE_NAME="ScoutAnalytics_Template_v3.3.0.pbit"
SPEC_FILE="ScoutAnalytics_Template_v3.3.0.pbit.spec"
THEME_FILE="pbix_config_scout_advisor.json"
FUNCTION_FILE="FetchFromDAL.m"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "📦 Scout Analytics Power BI Template (.pbit) Export"
echo "=================================================="
echo ""

# Validate required files
print_status "Validating required files..."

REQUIRED_FILES=("$SPEC_FILE" "$THEME_FILE" "$FUNCTION_FILE")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done

print_success "All required files present"

# Check for Power BI Desktop or pbi-tools
print_status "Checking for Power BI tools..."

PBI_TOOLS_AVAILABLE=false
POWER_BI_DESKTOP_AVAILABLE=false

if command -v pbi-tools >/dev/null 2>&1; then
    PBI_TOOLS_AVAILABLE=true
    print_success "pbi-tools found - automated .pbit generation available"
elif [[ -d "/Applications/Microsoft Power BI Desktop.app" ]] || command -v PBIDesktop.exe >/dev/null 2>&1; then
    POWER_BI_DESKTOP_AVAILABLE=true
    print_success "Power BI Desktop found - manual .pbit generation available"
else
    print_warning "Neither pbi-tools nor Power BI Desktop found"
fi

# Create .pbit template instructions
print_status "Creating .pbit template instructions..."

cat > "${TEMPLATE_NAME}.instructions" << EOF
# Scout Analytics Power BI Template (.pbit) Creation Instructions

## Template Specification
- **Name**: $TEMPLATE_NAME
- **Version**: 3.3.0
- **Theme**: Scout Advisor UI ($THEME_FILE)
- **Function**: Dynamic DAL connector ($FUNCTION_FILE)
- **Pages**: 6 (Executive, Product, Customer, Trends, AI, Platform)

## Method 1: Using Power BI Desktop (Manual)

### Step 1: Create New Power BI File
1. Open Power BI Desktop
2. Create a new blank report

### Step 2: Import Theme
1. Go to **View** → **Themes** → **Browse for themes**
2. Select \`$THEME_FILE\`
3. Click **Apply**

### Step 3: Add DAL Function
1. Go to **Home** → **Get Data** → **Blank Query**
2. Open **Advanced Editor**
3. Copy content from \`$FUNCTION_FILE\`
4. Replace parameter references:
   - \`{{DAL_ENDPOINT}}\` → \`#"DAL_ENDPOINT"\`
   - \`{{POWERBI_TOKEN}}\` → \`#"POWERBI_TOKEN"\`
5. Rename query to "FetchFromDAL"

### Step 4: Create Dataset Selector Table
1. **Home** → **Enter Data**
2. Create table with columns: datasetId, description, source, category
3. Add rows:
   - kpi_revenue_2024 | Revenue, Transactions, AOV, Margin | Supabase | Financial
   - campaign_performance | CTR, ROI, Impressions, CPC | Azure SQL | Marketing
   - audience_insights | Age, Gender, Region, Income | Supabase | Demographics
   - channel_analytics | Media channel metrics | Azure SQL | Channels
   - qa_validation_logs | UI audit trail | Audit DB | Quality
4. Name table "DatasetSelector"

### Step 5: Create Pages and Visuals
Based on specification in \`$SPEC_FILE\`:

#### Page 1: Executive Overview
- 3 KPI cards (Revenue, AOV, Transactions)
- Revenue trend line chart
- Regional performance map

#### Page 2: Product Performance  
- Revenue by category column chart
- Margin vs volume scatter chart

#### Page 3: Customer Analytics
- Age distribution pie chart
- Gender performance bar chart

#### Page 4: Trends & Forecasting
- 6-month revenue forecast line chart

#### Page 5: AI Insights
- AI-generated insights text box

#### Page 6: Platform Notes
- QA validation logs table

### Step 6: Add Slicers
1. Dataset selector dropdown (from DatasetSelector table)
2. Date range slicer

### Step 7: Configure Parameters
1. **Home** → **Transform Data** → **Manage Parameters**
2. Add parameters:
   - **DAL_ENDPOINT**: Text, required
   - **POWERBI_TOKEN**: Text, required, sensitive

### Step 8: Export as Template
1. **File** → **Export** → **Power BI template (.pbit)**
2. Save as \`$TEMPLATE_NAME\`
3. Enter parameter descriptions when prompted

## Method 2: Using pbi-tools (Automated)

### Prerequisites
\`\`\`bash
npm install -g pbi-tools
\`\`\`

### Build Command
\`\`\`bash
# Extract existing .pbix (if available)
pbi-tools extract ScoutAnalytics_v3.2.0.pbix

# Apply theme and modifications
cp $THEME_FILE ./ScoutAnalytics_v3.2.0/Report/theme.json

# Inject DAL function
cp $FUNCTION_FILE ./ScoutAnalytics_v3.2.0/Model/queries/FetchFromDAL.m

# Build .pbit template
pbi-tools compile ./ScoutAnalytics_v3.2.0 -format PBIT -out $TEMPLATE_NAME
\`\`\`

## Template Usage

### For End Users
1. Open Power BI Desktop
2. **File** → **Import** → **Power BI template (.pbit)**
3. Select \`$TEMPLATE_NAME\`
4. Enter parameters:
   - **DAL_ENDPOINT**: https://your-domain.vercel.app/api/powerbi/dal
   - **POWERBI_TOKEN**: your-bearer-token
5. Click **Load**

### Parameters Required
- **DAL_ENDPOINT**: Scout Analytics DAL API endpoint
- **POWERBI_TOKEN**: Bearer token for authentication

### Security Features
- No embedded credentials
- Environment-variable driven
- Safe for multi-tenant sharing
- HTTPS-only communication

## Validation Checklist

- [ ] Theme applied correctly (Scout Advisor blue #1D4ED8)
- [ ] FetchFromDAL function working
- [ ] Dataset selector dropdown functional
- [ ] All 6 pages created with appropriate visuals
- [ ] Parameters configured and working
- [ ] No embedded data or credentials
- [ ] Template exports successfully as .pbit

## Support

For issues with template creation:
1. Check Power BI Desktop version (>=2.0 required)
2. Validate theme JSON syntax
3. Verify DAL function M syntax
4. Test parameter functionality
5. Contact Scout Analytics team for assistance

EOF

print_success "Template instructions created: ${TEMPLATE_NAME}.instructions"

# Attempt automated generation if pbi-tools available
if [[ "$PBI_TOOLS_AVAILABLE" == true ]]; then
    print_status "Attempting automated .pbit generation with pbi-tools..."
    
    if [[ -f "ScoutAnalytics_v3.2.0.pbix" ]]; then
        print_status "Extracting base .pbix file..."
        pbi-tools extract ScoutAnalytics_v3.2.0.pbix
        
        print_status "Applying theme and DAL function..."
        mkdir -p ./ScoutAnalytics_v3.2.0/Report
        mkdir -p ./ScoutAnalytics_v3.2.0/Model/queries
        
        cp "$THEME_FILE" ./ScoutAnalytics_v3.2.0/Report/theme.json
        cp "$FUNCTION_FILE" ./ScoutAnalytics_v3.2.0/Model/queries/FetchFromDAL.m
        
        print_status "Compiling .pbit template..."
        pbi-tools compile ./ScoutAnalytics_v3.2.0 -format PBIT -out "$TEMPLATE_NAME"
        
        if [[ -f "$TEMPLATE_NAME" ]]; then
            print_success "✅ $TEMPLATE_NAME generated successfully!"
        else
            print_error "Failed to generate .pbit template"
        fi
    else
        print_warning "Base .pbix file not found - manual creation required"
    fi
else
    print_warning "Automated generation not available - follow manual instructions"
fi

# Create deployment package
print_status "Creating deployment package..."

PACKAGE_DIR="ScoutAnalytics_Template_v3.3.0_Package"
mkdir -p "$PACKAGE_DIR"

# Copy files to package
cp "$SPEC_FILE" "$PACKAGE_DIR/"
cp "$THEME_FILE" "$PACKAGE_DIR/"
cp "$FUNCTION_FILE" "$PACKAGE_DIR/"
cp "${TEMPLATE_NAME}.instructions" "$PACKAGE_DIR/"

if [[ -f "$TEMPLATE_NAME" ]]; then
    cp "$TEMPLATE_NAME" "$PACKAGE_DIR/"
fi

# Create package README
cat > "$PACKAGE_DIR/README.md" << EOF
# Scout Analytics Power BI Template v3.3.0

## Package Contents
- \`$TEMPLATE_NAME\` - Power BI template file (if generated)
- \`$SPEC_FILE\` - Template specification
- \`$THEME_FILE\` - Scout Advisor UI theme
- \`$FUNCTION_FILE\` - Dynamic DAL function
- \`${TEMPLATE_NAME}.instructions\` - Creation instructions

## Quick Start
1. Open Power BI Desktop
2. Import \`$TEMPLATE_NAME\` (if available) or follow manual instructions
3. Enter DAL endpoint and token parameters
4. Start building dashboards with Scout Advisor theme

## Features
✅ Scout Advisor UI theme integration
✅ Dynamic DAL connectivity
✅ 5 dataset support
✅ Environment-driven parameters
✅ 6 pre-configured pages
✅ Enterprise security

For detailed setup instructions, see \`${TEMPLATE_NAME}.instructions\`
EOF

print_success "Deployment package created: $PACKAGE_DIR/"

# Final summary
echo ""
print_success "🎉 Scout Analytics Power BI Template Export Complete!"
echo ""
echo "📦 Package: $PACKAGE_DIR/"
echo "📄 Template: $TEMPLATE_NAME $([ -f "$TEMPLATE_NAME" ] && echo "(✅ generated)" || echo "(📝 manual creation required)")"
echo "🎨 Theme: $THEME_FILE"
echo "🔌 Function: $FUNCTION_FILE"
echo "📖 Instructions: ${TEMPLATE_NAME}.instructions"
echo ""
echo "🚀 Next Steps:"
if [[ -f "$TEMPLATE_NAME" ]]; then
    echo "  1. Test template in Power BI Desktop"
    echo "  2. Distribute $PACKAGE_DIR/ to users"
    echo "  3. Provide DAL endpoint and token"
else
    echo "  1. Follow manual creation instructions"
    echo "  2. Test template functionality"
    echo "  3. Export as .pbit when complete"
fi
echo ""
