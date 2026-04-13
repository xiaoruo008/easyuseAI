#!/bin/bash
# scripts/nightly-report.sh
# 汇总截图/日志/结果，输出简明总结

SCREENSHOTS_DIR="public/screenshots"
REPORT_FILE="public/browser-report.json"
CONSOLE_ERRORS="public/console-errors.log"
NETWORK_ERRORS="public/network-errors.log"
OPS_STATUS="public/ops-status.json"

echo "=== Nightly Report: $(date -u '+%Y-%m-%dT%H:%M:%SZ') ==="

# Screenshots
echo "--- Screenshots ---"
if [ -d "$SCREENSHOTS_DIR" ]; then
  ls -la "$SCREENSHOTS_DIR"/*.png 2>/dev/null | tail -10
else
  echo "No screenshots directory"
fi

# Browser Report
echo "--- Browser Report ---"
if [ -f "$REPORT_FILE" ]; then
  cat "$REPORT_FILE" | grep -E '"summary"|"passed"|"failed"' | head -5
else
  echo "No browser report"
fi

# Errors
echo "--- Console Errors ---"
if [ -f "$CONSOLE_ERRORS" ]; then
  echo "$(wc -l < "$CONSOLE_ERRORS") errors found"
  cat "$CONSOLE_ERRORS"
else
  echo "No console errors"
fi

echo "--- Network Errors ---"
if [ -f "$NETWORK_ERRORS" ]; then
  echo "Network errors found:"
  cat "$NETWORK_ERRORS"
else
  echo "No network errors"
fi

# Ops Status
echo "--- Ops Status ---"
if [ -f "$OPS_STATUS" ]; then
  cat "$OPS_STATUS"
else
  echo "No ops status"
fi

echo "--- Done ---"
