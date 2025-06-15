#!/usr/bin/env bash
set -euo pipefail

# Extract Cursor-style rules from public prompts
CURSOR_REPO="research/prompts/system-prompts-and-models-of-ai-tools"
RULES_DIR="rules"

# Create rules directory if it doesn't exist
mkdir -p "$RULES_DIR"

# Extract and normalize Cursor rules
echo "🔍 Extracting Cursor rules..."

# Extract agent roles and goals
cat "$CURSOR_REPO/cursor/rules/agent-roles.md" > "$RULES_DIR/1-agent-roles-and-goals.mdc" 2>/dev/null || true

# Extract structured I/O design
cat "$CURSOR_REPO/cursor/rules/structured-io.md" > "$RULES_DIR/2-structured-io-design.mdc" 2>/dev/null || true

# Extract behavior tuning
cat "$CURSOR_REPO/cursor/rules/behavior-tuning.md" > "$RULES_DIR/3-agent-behavior-tuning.mdc" 2>/dev/null || true

# Extract reasoning and tools
cat "$CURSOR_REPO/cursor/rules/reasoning-tools.md" > "$RULES_DIR/4-reasoning-and-tools.mdc" 2>/dev/null || true

# Extract multi-agent orchestration
cat "$CURSOR_REPO/cursor/rules/multi-agent.md" > "$RULES_DIR/5-multi-agent-orchestration.mdc" 2>/dev/null || true

# Extract memory and RAG
cat "$CURSOR_REPO/cursor/rules/memory-rag.md" > "$RULES_DIR/6-memory-and-rag.mdc" 2>/dev/null || true

# Extract modal capabilities
cat "$CURSOR_REPO/cursor/rules/modal-capabilities.md" > "$RULES_DIR/7-modal-capabilities.mdc" 2>/dev/null || true

# Extract output formatting
cat "$CURSOR_REPO/cursor/rules/output-formatting.md" > "$RULES_DIR/8-output-formatting.mdc" 2>/dev/null || true

# Extract UI/API wrapping
cat "$CURSOR_REPO/cursor/rules/ui-api-wrapping.md" > "$RULES_DIR/9-ui-api-wrapping.mdc" 2>/dev/null || true

echo "✅ Cursor rules extracted and normalized under: $RULES_DIR/" 