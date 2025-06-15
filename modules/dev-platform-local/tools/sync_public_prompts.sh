#!/usr/bin/env bash
set -euo pipefail

# Pull top-tier prompt repos into Pulser research folder
mkdir -p research/prompts

repos=(
  "https://github.com/jujumilk3/leaked-system-prompts"
  "https://github.com/asgeirtj/system_prompts_leaks"
  "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools"
  "https://github.com/elder-plinius/CL4R1T4S"
)

for repo in "${repos[@]}"; do
  git clone --depth=1 "$repo" "research/prompts/$(basename "$repo")" || true
done

echo "✅ Prompt repositories synced under: research/prompts/" 