#!/bin/bash

# Scout Analytics Power BI Integration - Release Tagging Script
# Version: 3.3.0

set -euo pipefail

VERSION="3.3.0"
RELEASE_NAME="Scout Advisor UI Integration"
RELEASE_DATE="2025-06-17"

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

echo "🏷️  Scout Analytics Power BI Integration - Release Tagger v${VERSION}"
echo "=================================================================="
echo ""

# Validate Git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    git status --porcelain
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Validate release files exist
print_status "Validating release files..."

REQUIRED_FILES=(
    "static_deploy/generate_pbix_connected.sh"
    "static_deploy/pbix_config_scout_advisor.json"
    "static_deploy/FetchFromDAL.m"
    "static_deploy/DataSource.m"
    "static_deploy/README.md"
    "themes/pbix_config_scout_advisor.json"
    "powerbi/FetchFromDAL.m"
    "powerbi/DataSource.m"
    "scripts/generate_pbix_connected.sh"
    "app/api/powerbi/dal/route.ts"
    "release.yaml"
    "CHANGELOG.md"
    "README.md"
    "IMPLEMENTATION_SUMMARY.md"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        MISSING_FILES+=("$file")
    fi
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    print_error "Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

print_success "All required files present"

# Validate JSON files
print_status "Validating JSON files..."
if command -v jq >/dev/null 2>&1; then
    JSON_FILES=(
        "static_deploy/pbix_config_scout_advisor.json"
        "themes/pbix_config_scout_advisor.json"
    )
    
    for json_file in "${JSON_FILES[@]}"; do
        if jq empty "$json_file" 2>/dev/null; then
            print_success "✓ $json_file is valid"
        else
            print_error "✗ $json_file is invalid JSON"
            exit 1
        fi
    done
else
    print_warning "jq not found - skipping JSON validation"
fi

# Check if tag already exists
if git tag -l | grep -q "^v${VERSION}$"; then
    print_warning "Tag v${VERSION} already exists"
    read -p "Delete existing tag and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -d "v${VERSION}"
        print_success "Deleted existing tag v${VERSION}"
    else
        exit 1
    fi
fi

# Stage all Power BI integration files
print_status "Staging Power BI integration files..."
git add scout-cdb-platform/
git add app/api/powerbi/
git add .env.example

# Create commit if there are staged changes
if ! git diff-index --quiet --cached HEAD --; then
    print_status "Creating release commit..."
    
    COMMIT_MESSAGE="🚀 Power BI Integration v${VERSION} - ${RELEASE_NAME}

✨ Features:
- Scout Advisor UI theme integration (#1D4ED8 navigation blue)
- Complete DAL connectivity with 5 dataset registry
- Dynamic Power BI functions with multi-dataset support
- Automated deployment script with file preservation
- Enterprise security with bearer token authentication
- Comprehensive documentation and troubleshooting guides

🔧 Components:
- Power BI theme: pbix_config_scout_advisor.json
- DAL endpoint: api/powerbi/dal/route.ts
- Dynamic function: FetchFromDAL.m
- Static connector: DataSource.m
- Deployment script: generate_pbix_connected.sh
- Final package: static_deploy/

🔐 Security:
- Bearer token authentication
- Environment variable protection
- Input validation and sanitization
- Secure error handling

📦 Deployment:
- One-command setup: ./generate_pbix_connected.sh
- File preservation (original .pbix unchanged)
- Theme validation and application
- Comprehensive setup instructions

Release Date: ${RELEASE_DATE}
Version: ${VERSION}
Type: Major Release"

    git commit -m "$COMMIT_MESSAGE"
    print_success "Release commit created"
else
    print_status "No changes to commit"
fi

# Create annotated tag
print_status "Creating release tag v${VERSION}..."

TAG_MESSAGE="Scout Analytics Power BI Integration v${VERSION}

${RELEASE_NAME}

🎨 Scout Advisor UI Integration:
- Perfect visual theme matching Scout Advisor UI
- Navigation bar blue (#1D4ED8) exact color match
- KPI highlight cards with semantic colors
- Inter font family and professional styling

🔌 Complete DAL Integration:
- 5 dataset registry with dynamic filtering
- Bearer token authentication
- Multi-query type support
- Comprehensive error handling

🚀 Enterprise Deployment:
- Automated deployment script
- File preservation and safety
- Environment variable injection
- Power BI Service upload support

📦 Ready-to-Use Package:
- All files in static_deploy/ directory
- Comprehensive documentation
- Troubleshooting guides
- Migration instructions

Release Date: ${RELEASE_DATE}
Compatibility: Power BI Desktop >=2.0, Power BI Service >=1.0
Security: Bearer token auth, HTTPS only, environment isolation

For setup instructions, see: scout-cdb-platform/static_deploy/README.md"

git tag -a "v${VERSION}" -m "$TAG_MESSAGE"
print_success "Created annotated tag v${VERSION}"

# Display release summary
echo ""
print_success "🎉 Release v${VERSION} tagged successfully!"
echo ""
echo "📋 Release Summary:"
echo "  Version: ${VERSION}"
echo "  Name: ${RELEASE_NAME}"
echo "  Date: ${RELEASE_DATE}"
echo "  Commit: $(git rev-parse --short HEAD)"
echo "  Tag: v${VERSION}"
echo ""
echo "📦 Package Location: scout-cdb-platform/static_deploy/"
echo "📖 Documentation: scout-cdb-platform/static_deploy/README.md"
echo "📝 Changelog: scout-cdb-platform/CHANGELOG.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Push to remote: git push origin main --tags"
echo "  2. Create GitHub release from tag v${VERSION}"
echo "  3. Deploy to production environment"
echo "  4. Update documentation if needed"
echo ""
echo "🔗 Quick Commands:"
echo "  git push origin main --tags"
echo "  cd scout-cdb-platform/static_deploy && ./generate_pbix_connected.sh"
echo ""

# Optional: Push to remote
read -p "Push to remote repository now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Pushing to remote..."
    git push origin main --tags
    print_success "Pushed to remote repository"
else
    print_warning "Remember to push manually: git push origin main --tags"
fi

print_success "✅ Release v${VERSION} process completed!"
