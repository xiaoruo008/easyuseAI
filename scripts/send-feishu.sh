#!/usr/bin/env bash
set -euo pipefail

if [ -z "${FEISHU_WEBHOOK_URL:-}" ]; then
  echo "FEISHU_WEBHOOK_URL not set"
  exit 1
fi

MSG="${1:-Hermes 状态正常}"
ESCAPED_MSG=$(printf '%s' "$MSG" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')

curl -sS -X POST "$FEISHU_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"msg_type\":\"text\",\"content\":{\"text\":${ESCAPED_MSG}}}"
