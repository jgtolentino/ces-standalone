#!/bin/bash

# Load environment
source .env

# Start in parallel
docker-compose up -d devstral-agent yummy-agent ces-agent

# Start pulse monitor
node modules/pulser-monitor.js &

# Register with service discovery
curl -X POST http://discovery-service/register \
  -H "Content-Type: application/json" \
  -d '{
    "service": "agent-orchestrator",
    "endpoint": "'$HOSTNAME':8080",
    "tags": ["ai", "orchestration"]
  }' 