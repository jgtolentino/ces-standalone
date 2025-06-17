#!/bin/bash

# Scout Analytics v3.3.0 - Open Source Dashboard Runner
# Streamlit-based alternative to Power BI - No tokens required!

set -euo pipefail

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

echo "🚀 Scout Analytics v3.3.0 - Open Source Dashboard"
echo "================================================"
echo "📊 Streamlit-based alternative to Power BI"
echo "🆓 No Power BI tokens required - completely free!"
echo ""

# Check Python installation
if ! command -v python3 >/dev/null 2>&1; then
    print_error "Python 3 is required but not installed"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
print_success "Python $PYTHON_VERSION detected"

# Check if virtual environment exists
VENV_DIR="venv"
if [[ ! -d "$VENV_DIR" ]]; then
    print_status "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Install dependencies
print_status "Installing dependencies..."
pip install -r requirements.txt

print_success "Dependencies installed"

# Set environment variables (optional)
if [[ -f ".env" ]]; then
    print_status "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    print_warning "No .env file found - using defaults"
    print_status "Creating sample .env file..."
    cat > .env << EOF
# Scout Analytics Open Source Dashboard Configuration
# Optional: Set these to connect to live DAL endpoint

# DAL_ENDPOINT=https://your-domain.vercel.app/api/powerbi/dal
# POWERBI_TOKEN=your_bearer_token_here

# If not set, dashboard will use mock data for demonstration
EOF
    print_success "Sample .env file created"
fi

# Display configuration
echo ""
print_status "🔧 Configuration:"
echo "  DAL Endpoint: ${DAL_ENDPOINT:-'http://localhost:3000/api/powerbi/dal (default)'}"
echo "  Token: ${POWERBI_TOKEN:+Set (${#POWERBI_TOKEN} chars)} ${POWERBI_TOKEN:-'Not set (will use mock data)'}"
echo "  Dashboard: Streamlit on http://localhost:8501"
echo ""

# Launch dashboard
print_status "🚀 Launching Scout Analytics Dashboard..."
echo ""
print_success "✅ Dashboard starting at: http://localhost:8501"
echo ""
echo "📊 Features available:"
echo "  • 📈 Transaction Trends"
echo "  • 🛒 SKU Mix & Substitution"
echo "  • 🧠 Consumer Behavior"
echo "  • 👥 Consumer Profiles"
echo "  • 🤖 AI Recommendations"
echo ""
echo "🎨 Theme: Scout Advisor UI (Navigation Blue #1D4ED8)"
echo "🔌 Data: ${DAL_ENDPOINT:+Live DAL}${DAL_ENDPOINT:-Mock data for demo}"
echo ""
echo "Press Ctrl+C to stop the dashboard"
echo ""

# Run Streamlit
streamlit run streamlit-dashboard.py \
    --server.port 8501 \
    --server.address 0.0.0.0 \
    --server.headless false \
    --browser.gatherUsageStats false \
    --theme.primaryColor "#1D4ED8" \
    --theme.backgroundColor "#F8FAFC" \
    --theme.secondaryBackgroundColor "#FFFFFF" \
    --theme.textColor "#0F172A"
