#!/bin/bash
set -e

# Install dependencies at the root level
cd ../..
pnpm install --frozen-lockfile

# Build workspace packages
pnpm --filter "./packages/*" build

# Return to CES tenant directory and build
cd tenants/ces
pnpm build 