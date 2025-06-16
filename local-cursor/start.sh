#!/bin/bash

echo "🚀 Starting Local Cursor..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install from https://ollama.ai"
    exit 1
fi

# Check if Devstral model exists
if ! ollama list | grep -q "devstral"; then
    echo "📥 Devstral model not found. Pulling..."
    ollama pull devstral
fi

# Start Ollama in background
echo "🤖 Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 3

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the app
echo "🎨 Starting Local Cursor..."
npm run dev

# Cleanup on exit
trap "kill $OLLAMA_PID" EXIT