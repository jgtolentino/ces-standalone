#!/bin/bash

echo "🚀 Starting Claude-Jules OS..."

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not installed. Get it from https://ollama.ai"
    exit 1
fi

# Check Devstral model
if ! ollama list | grep -q "devstral"; then
    echo "📥 Pulling Devstral model..."
    ollama pull devstral
fi

# Start Ollama
echo "🤖 Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

sleep 3

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Claude-Jules OS
echo "🧠 Starting Claude-Jules OS..."
npm run dev

# Cleanup
trap "kill $OLLAMA_PID" EXIT