#!/usr/bin/env bash
set -euo pipefail

echo "=== agent status ==="
pgrep -af "claude --permission-mode dontAsk" || echo "claude: not running"
pgrep -af "qwen --approval-mode yolo" || echo "qwen: not running"
pgrep -af "hermes gateway run" || echo "hermes: not running"

echo
echo "=== logs mtime ==="
for f in ops/EXECUTOR_LOG.md ops/QWEN_LOG.md ops/HERMES_REPORT.md ops/SITE_STATUS.md ops/METRICS.md; do
  if [ -f "$f" ]; then
    stat -c "%y %n" "$f"
  else
    echo "missing $f"
  fi
done
