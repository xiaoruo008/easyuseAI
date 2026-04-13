#!/bin/bash
# scripts/nightly-check.sh
# Hermes 调度入口：跑 dev 健康检查 + browser 验证

BASE_URL=${BASE_URL:-http://localhost:3000}
REPORT_FILE="public/ops-status.json"

echo "=== Nightly Check: $(date -u '+%Y-%m-%dT%H:%M:%SZ') ==="

# 1. Dev server 健康检查
echo "--- 1. Dev Server Health ---"
if curl -sf "$BASE_URL" > /dev/null 2>&1; then
  echo "✓ Dev server is up"
else
  echo "✗ Dev server is DOWN"
  exit 1
fi

# 2. Session API 检查
echo "--- 2. Session API ---"
SESSION_RESP=$(curl -sf -X POST "$BASE_URL/api/diagnosis/session")
if [ -n "$SESSION_RESP" ]; then
  SESSION_ID=$(echo "$SESSION_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✓ Session created: $SESSION_ID"
else
  echo "✗ Session API failed"
fi

# 3. Browser 测试
echo "--- 3. Browser Tests ---"
pnpm browser home > /dev/null 2>&1 && echo "✓ home" || echo "✗ home"
pnpm browser diagnosis > /dev/null 2>&1 && echo "✓ diagnosis flow" || echo "✗ diagnosis flow"
pnpm browser mobile > /dev/null 2>&1 && echo "✓ mobile" || echo "✗ mobile"

echo "--- Done ---"
