#!/bin/bash

# Node + tooling setup
apt update && apt install -y curl git unzip build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PNPM
corepack enable
corepack prepare pnpm@8.10.5 --activate

# Clone or pull monorepo
cd /workspace/ai-agency
pnpm install

# Optional: link MCP CLI
pnpm link --global packages/pulser-cli

# Final startup
echo "✅ Environment initialized for Pulser 4 + MCP"