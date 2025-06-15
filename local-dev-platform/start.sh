#!/bin/bash

# Local Development Platform Startup Script
# Reverse engineered capabilities of Rork AI, Lovable.dev, Bolt.new, and Replit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Local Development Platform"
echo "======================================"

# Check if Ollama is running
check_ollama() {
    echo "🔍 Checking Ollama status..."
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama is running"
        return 0
    else
        echo "❌ Ollama is not running"
        echo "💡 Start Ollama with: ollama serve"
        echo "📥 Install Devstral with: ollama pull devstral:latest"
        return 1
    fi
}

# Check if Devstral model is available
check_devstral() {
    echo "🔍 Checking Devstral model..."
    if curl -s http://localhost:11434/api/tags | grep -q "devstral"; then
        echo "✅ Devstral model is available"
        return 0
    else
        echo "⚠️  Devstral model not found"
        echo "💡 Install with: ollama pull devstral:latest"
        echo "⏳ This may take a while (14GB download)"
        
        read -p "Continue anyway? (y/N): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            return 0
        else
            return 1
        fi
    fi
}

# Install dependencies if needed
install_deps() {
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    else
        echo "✅ Dependencies already installed"
    fi
}

# Run security tests
test_security() {
    echo "🛡️  Running security sandbox tests..."
    npm run sandbox-test
}

# Start the platform
start_platform() {
    echo "🚀 Starting Local Development Platform..."
    echo ""
    echo "🌐 Web Interface: http://localhost:3000"
    echo "📡 WebSocket API: ws://localhost:3001"
    echo "🔌 REST API: http://localhost:3000/api/*"
    echo ""
    echo "📋 Available capabilities:"
    echo "   🎨 Lovable.dev Component Factory"
    echo "   ⚡ Bolt.new Prototype Engine"
    echo "   👥 Replit Collaboration Server"
    echo "   🔄 Rork Workflow Orchestration"
    echo "   🧠 Devstral AI Integration"
    echo "   🛡️  Security Sandbox"
    echo ""
    echo "Press Ctrl+C to stop..."
    echo ""
    
    # Start with development settings
    npm run dev
}

# Main execution
main() {
    echo "🔧 Prerequisites check..."
    
    # Check Ollama
    if ! check_ollama; then
        echo "❌ Ollama is required but not running"
        echo "🚀 Start Ollama in another terminal:"
        echo "   ollama serve"
        exit 1
    fi
    
    # Check Devstral (optional)
    check_devstral
    
    # Install dependencies
    install_deps
    
    # Test security
    echo ""
    test_security
    
    echo ""
    echo "✅ All checks passed!"
    echo ""
    
    # Start platform
    start_platform
}

# Handle script arguments
case "${1:-start}" in
    start|dev)
        main
        ;;
    test)
        install_deps
        test_security
        ;;
    install)
        install_deps
        ;;
    check)
        check_ollama
        check_devstral
        ;;
    help|--help|-h)
        echo "Local Development Platform - Startup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start    Start the platform (default)"
        echo "  dev      Start in development mode"
        echo "  test     Run security tests only"
        echo "  install  Install dependencies only"
        echo "  check    Check prerequisites only"
        echo "  help     Show this help"
        echo ""
        echo "Environment variables:"
        echo "  PORT        HTTP server port (default: 3000)"
        echo "  WS_PORT     WebSocket port (default: 3001)"
        echo "  OLLAMA_HOST Ollama host (default: http://localhost:11434)"
        echo "  MODEL_NAME  AI model name (default: devstral:latest)"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "💡 Use '$0 help' for usage information"
        exit 1
        ;;
esac