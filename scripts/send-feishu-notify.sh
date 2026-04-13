#!/bin/bash
# send-feishu-notify.sh - 发送飞书通知
# 用法: bash scripts/send-feishu-notify.sh <title> <message>
#   例: bash scripts/send-feishu-notify.sh "检查失败" "diagnosis 入口无法点击"

WEBHOOK_URL=$(grep FEISHU_WEBHOOK /mnt/e/AI/easyuseAI/.env.local 2>/dev/null | cut -d'=' -f2)

TITLE="$1"
MESSAGE="$2"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

PAYLOAD=$(cat <<EOF
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": { "tag": "plain_text", "content": "🤖 $TITLE" },
      "template": "red"
    },
    "elements": [
      { "tag": "div", "text": { "tag": "lark_md", "content": "**时间**: $TIMESTAMP\n\n**内容**: $MESSAGE" } },
      { "tag": "div", "text": { "tag": "lark_md", "content": "**项目**: /mnt/e/AI/easyuseAI" } }
    ]
  }
}
EOF
)

if [ -z "$WEBHOOK_URL" ]; then
  # 未配置飞书，写入本地待发送文件
  NOTIFY_FILE="/mnt/e/AI/easyuseAI/public/pending-notifications.json"
  mkdir -p "$(dirname "$NOTIFY_FILE")"
  echo "$(date -Iseconds) | $TITLE | $MESSAGE" >> "$NOTIFY_FILE"
  echo "[通知已保存到本地] $TITLE: $MESSAGE"
else
  RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
  if echo "$RESPONSE" | grep -q '"StatusCode":0'; then
    echo "[飞书通知成功] $TITLE"
  else
    echo "[飞书通知失败] $RESPONSE"
  fi
fi
