#!/bin/bash

# Scout Analytics Power BI Deployment Script
# Generates connected PBIX files with DAL endpoint injection and theme application
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DATASET_ID="kpi_revenue_2024"
WORKSPACE="RetailOps"
THEME_APPLY=true
UPLOAD_TO_SERVICE=false
OUTPUT_DIR="./output"
VERBOSE=false

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
POWERBI_DIR="$SCRIPT_DIR/../powerbi"
THEMES_DIR="$SCRIPT_DIR/../themes"

# Function to print colored output
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

# Function to show usage
show_usage() {
    cat << EOF
Scout Analytics Power BI Deployment Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --dataset-id DATASET_ID     Dataset ID to use (default: kpi_revenue_2024)
    --workspace WORKSPACE       Power BI workspace name (default: RetailOps)
    --no-theme                  Skip theme application
    --upload                    Upload to Power BI Service (requires authentication)
    --output-dir DIR            Output directory for generated files (default: ./output)
    --verbose                   Enable verbose output
    --help                      Show this help message

AVAILABLE DATASETS:
    - kpi_revenue_2024          Revenue, Transactions, AOV, Margin
    - campaign_performance      CTR, ROI, Impressions, CPC
    - audience_insights         Age, Gender, Region, Income
    - channel_analytics         Media channel metrics (FB, IG, TV, In-store)
    - qa_validation_logs        UI audit trail from Caca + VibeTestBot

EXAMPLES:
    # Generate basic PBIX with default dataset
    $0

    # Generate PBIX for campaign performance data
    $0 --dataset-id campaign_performance

    # Generate and upload to Power BI Service
    $0 --dataset-id audience_insights --upload --workspace "Marketing Analytics"

    # Generate without theme, custom output directory
    $0 --no-theme --output-dir /tmp/powerbi-output

ENVIRONMENT VARIABLES:
    DAL_ENDPOINT               Base URL for DAL API (required)
    POWERBI_TOKEN             Bearer token for Power BI authentication (required)
    POWERBI_SERVICE_URL       Power BI Service URL (optional, for upload)
    POWERBI_CLIENT_ID         Azure AD Client ID (optional, for upload)
    POWERBI_CLIENT_SECRET     Azure AD Client Secret (optional, for upload)

EOF
}

# Function to validate environment
validate_environment() {
    print_status "Validating environment..."
    
    local missing_vars=()
    
    if [[ -z "$DAL_ENDPOINT" ]]; then
        missing_vars+=("DAL_ENDPOINT")
    fi
    
    if [[ -z "$POWERBI_TOKEN" ]]; then
        missing_vars+=("POWERBI_TOKEN")
    fi
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please set these variables in your .env file or export them:"
        echo "  export DAL_ENDPOINT='https://your-domain.com'"
        echo "  export POWERBI_TOKEN='your-bearer-token'"
        exit 1
    fi
    
    # Validate DAL endpoint accessibility
    if command -v curl >/dev/null 2>&1; then
        print_status "Testing DAL endpoint connectivity..."
        if curl -s -f -H "Authorization: Bearer $POWERBI_TOKEN" "$DAL_ENDPOINT/api/powerbi/dal" >/dev/null; then
            print_success "DAL endpoint is accessible"
        else
            print_warning "DAL endpoint test failed - continuing anyway"
        fi
    fi
}

# Function to create output directory
setup_output_directory() {
    print_status "Setting up output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    
    # Create subdirectories
    mkdir -p "$OUTPUT_DIR/datasources"
    mkdir -p "$OUTPUT_DIR/functions"
    mkdir -p "$OUTPUT_DIR/themes"
    mkdir -p "$OUTPUT_DIR/logs"
}

# Function to inject environment variables into M files
inject_environment_variables() {
    local input_file="$1"
    local output_file="$2"
    
    print_status "Injecting environment variables into $(basename "$input_file")"
    
    # Read the template file and replace placeholders
    sed -e "s|{{DAL_ENDPOINT}}|$DAL_ENDPOINT|g" \
        -e "s|{{POWERBI_TOKEN}}|$POWERBI_TOKEN|g" \
        -e "s|{{DATASET_ID}}|$DATASET_ID|g" \
        "$input_file" > "$output_file"
    
    if [[ $VERBOSE == true ]]; then
        print_status "Generated file: $output_file"
        echo "  DAL_ENDPOINT: $DAL_ENDPOINT"
        echo "  DATASET_ID: $DATASET_ID"
        echo "  Token: ${POWERBI_TOKEN:0:10}..."
    fi
}

# Function to generate DataSource.m with specific dataset
generate_datasource() {
    print_status "Generating DataSource.m for dataset: $DATASET_ID"
    
    local template_file="$POWERBI_DIR/DataSource.m"
    local output_file="$OUTPUT_DIR/datasources/DataSource_${DATASET_ID}.m"
    
    if [[ ! -f "$template_file" ]]; then
        print_error "Template file not found: $template_file"
        exit 1
    fi
    
    # Create dataset-specific version
    sed -e "s|{{DAL_ENDPOINT}}|$DAL_ENDPOINT|g" \
        -e "s|{{POWERBI_TOKEN}}|$POWERBI_TOKEN|g" \
        -e "s|\"datasetId\":\"kpi_revenue_2024\"|\"datasetId\":\"$DATASET_ID\"|g" \
        "$template_file" > "$output_file"
    
    print_success "Generated: $output_file"
}

# Function to generate FetchFromDAL function
generate_function() {
    print_status "Generating FetchFromDAL.m function"
    
    local template_file="$POWERBI_DIR/FetchFromDAL.m"
    local output_file="$OUTPUT_DIR/functions/FetchFromDAL.m"
    
    if [[ ! -f "$template_file" ]]; then
        print_error "Template file not found: $template_file"
        exit 1
    fi
    
    inject_environment_variables "$template_file" "$output_file"
    print_success "Generated: $output_file"
}

# Function to copy and validate theme
setup_theme() {
    if [[ $THEME_APPLY == false ]]; then
        print_status "Skipping theme application (--no-theme specified)"
        return
    fi
    
    print_status "Setting up Power BI theme"
    
    local theme_file="$THEMES_DIR/pbix_config.json"
    local output_theme="$OUTPUT_DIR/themes/scout_analytics_theme.json"
    
    if [[ ! -f "$theme_file" ]]; then
        print_error "Theme file not found: $theme_file"
        exit 1
    fi
    
    # Validate JSON syntax
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$theme_file" 2>/dev/null; then
            print_success "Theme JSON is valid"
        else
            print_error "Theme JSON is invalid"
            exit 1
        fi
    fi
    
    cp "$theme_file" "$output_theme"
    print_success "Theme copied to: $output_theme"
}

# Function to generate deployment instructions
generate_instructions() {
    local instructions_file="$OUTPUT_DIR/DEPLOYMENT_INSTRUCTIONS.md"
    
    print_status "Generating deployment instructions"
    
    cat > "$instructions_file" << EOF
# Scout Analytics Power BI Deployment Instructions

Generated on: $(date)
Dataset ID: $DATASET_ID
Workspace: $WORKSPACE

## Files Generated

### Data Sources
- \`datasources/DataSource_${DATASET_ID}.m\` - Direct dataset connection
- \`functions/FetchFromDAL.m\` - Dynamic function for multiple datasets

### Theme
- \`themes/scout_analytics_theme.json\` - Professional blue theme matching Tailwind design

## Power BI Desktop Setup

### 1. Import Data Source
1. Open Power BI Desktop
2. Go to **Home** → **Get Data** → **Blank Query**
3. Open **Advanced Editor**
4. Copy and paste the content from \`datasources/DataSource_${DATASET_ID}.m\`
5. Click **Done** and **Close & Apply**

### 2. Import Dynamic Function (Optional)
1. Go to **Home** → **Get Data** → **Blank Query**
2. Open **Advanced Editor**
3. Copy and paste the content from \`functions/FetchFromDAL.m\`
4. Rename the query to "FetchFromDAL"
5. Click **Done**

### 3. Apply Theme
1. Go to **View** → **Themes** → **Browse for themes**
2. Select \`themes/scout_analytics_theme.json\`
3. Click **Apply**

## Using the Dynamic Function

Once imported, you can use the FetchFromDAL function in new queries:

\`\`\`m
// Fetch revenue data
FetchFromDAL("kpi_revenue_2024")

// Fetch campaign performance with filters
FetchFromDAL("campaign_performance", [dateRange = [start = "2024-01-01", end = "2024-03-31"]])

// Fetch audience demographics
FetchFromDAL("audience_insights", [], "demographics")
\`\`\`

## Available Datasets

| Dataset ID | Description | Query Types |
|------------|-------------|-------------|
| kpi_revenue_2024 | Revenue, Transactions, AOV, Margin | main, summary |
| campaign_performance | CTR, ROI, Impressions, CPC | main, summary |
| audience_insights | Age, Gender, Region, Income | main, demographics |
| channel_analytics | Media channel metrics | main, summary |
| qa_validation_logs | UI audit trail | main, summary |

## Data Refresh

The data source is configured to refresh every 5 minutes automatically. You can also manually refresh by:
1. Right-clicking on the dataset in the **Fields** pane
2. Selecting **Refresh data**

## Troubleshooting

### Connection Issues
- Verify DAL_ENDPOINT is accessible: $DAL_ENDPOINT
- Check bearer token is valid
- Ensure firewall allows outbound HTTPS connections

### Authentication Errors
- Verify POWERBI_TOKEN environment variable
- Check token hasn't expired
- Confirm token has appropriate permissions

### Data Issues
- Check dataset ID is correct: $DATASET_ID
- Verify filters are properly formatted
- Review query logs in Power BI Desktop

## Support

For technical support, contact the Scout Analytics team or check the project documentation.

EOF

    print_success "Instructions generated: $instructions_file"
}

# Function to upload to Power BI Service (placeholder)
upload_to_service() {
    if [[ $UPLOAD_TO_SERVICE == false ]]; then
        return
    fi
    
    print_status "Preparing for Power BI Service upload..."
    
    if [[ -z "$POWERBI_CLIENT_ID" || -z "$POWERBI_CLIENT_SECRET" ]]; then
        print_warning "Power BI Service credentials not configured"
        print_warning "Set POWERBI_CLIENT_ID and POWERBI_CLIENT_SECRET to enable upload"
        return
    fi
    
    # This would require Power BI REST API integration
    print_warning "Power BI Service upload not yet implemented"
    print_status "Manual upload required:"
    echo "  1. Open Power BI Service"
    echo "  2. Navigate to workspace: $WORKSPACE"
    echo "  3. Upload the generated .pbix file"
    echo "  4. Configure scheduled refresh if needed"
}

# Function to create summary log
create_summary() {
    local log_file="$OUTPUT_DIR/logs/deployment_$(date +%Y%m%d_%H%M%S).log"
    
    cat > "$log_file" << EOF
Scout Analytics Power BI Deployment Summary
==========================================

Timestamp: $(date)
Dataset ID: $DATASET_ID
Workspace: $WORKSPACE
Theme Applied: $THEME_APPLY
Upload Attempted: $UPLOAD_TO_SERVICE

Environment:
- DAL Endpoint: $DAL_ENDPOINT
- Output Directory: $OUTPUT_DIR

Files Generated:
- DataSource: datasources/DataSource_${DATASET_ID}.m
- Function: functions/FetchFromDAL.m
- Theme: themes/scout_analytics_theme.json
- Instructions: DEPLOYMENT_INSTRUCTIONS.md

Status: SUCCESS
EOF

    print_success "Deployment log created: $log_file"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dataset-id)
            DATASET_ID="$2"
            shift 2
            ;;
        --workspace)
            WORKSPACE="$2"
            shift 2
            ;;
        --no-theme)
            THEME_APPLY=false
            shift
            ;;
        --upload)
            UPLOAD_TO_SERVICE=true
            shift
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Load environment variables from .env if it exists
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    print_status "Loading environment from .env file"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Main execution
main() {
    echo "🚀 Scout Analytics Power BI Deployment Script"
    echo "=============================================="
    echo ""
    
    validate_environment
    setup_output_directory
    generate_datasource
    generate_function
    setup_theme
    generate_instructions
    upload_to_service
    create_summary
    
    echo ""
    print_success "✅ Power BI deployment completed successfully!"
    echo ""
    echo "📁 Output directory: $OUTPUT_DIR"
    echo "📊 Dataset: $DATASET_ID"
    echo "🎨 Theme: $([ $THEME_APPLY == true ] && echo "Applied" || echo "Skipped")"
    echo ""
    echo "Next steps:"
    echo "1. Open Power BI Desktop"
    echo "2. Follow instructions in $OUTPUT_DIR/DEPLOYMENT_INSTRUCTIONS.md"
    echo "3. Import the generated data source and theme"
    echo ""
}

# Run main function
main "$@"
