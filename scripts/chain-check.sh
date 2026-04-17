#!/bin/bash
# easyuseAI 链路打通进度检查
# 检查: 前端提交 → /api/leads → n8n webhook → 飞书通知

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔗 easyuseAI 链路打通进度"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 环节1: 前端
echo -e "${BLUE}[1/4] 前端提交页${NC}"
echo -n "  Next.js :3005 ... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 | grep -q "200" && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}"

# 环节2: /api/leads
echo -e "${BLUE}[2/4] /api/leads 接口${NC}"
echo -n "  创建 lead ... "
RESP=$(curl -s -X POST http://localhost:3005/api/leads \
    -H "Content-Type: application/json" \
    -d '{"name":"链路检查","wechat":"check","category":"女装","resultType":"traffic"}' \
    -w "\n%{http_code}" 2>/dev/null)
CODE=$(echo "$RESP" | tail -1)
if [ "$CODE" = "201" ]; then
    echo -e "${GREEN}✅ 201 已创建${NC}"
else
    echo -e "${RED}❌ $CODE${NC}"
fi

# 环节3: n8n webhook (检查 workflow 是否激活)
echo -e "${BLUE}[3/4] n8n webhook${NC}"
echo -n "  Webhook 响应 ... "
N8N_RESP=$(curl -s -X POST http://localhost:5678/webhook/easyuse-lead \
    -H "Content-Type: application/json" \
    -d '{"name":"test","wechat":"test"}' \
    -w "\n%{http_code}" 2>/dev/null)
N8N_CODE=$(echo "$N8N_RESP" | tail -1)
if [ "$N8N_CODE" = "200" ] || [ "$N8N_CODE" = "201" ]; then
    echo -e "${GREEN}✅ workflow 被触发${NC}"
elif [ "$N8N_CODE" = "404" ]; then
    echo -e "${RED}❌ workflow 未激活${NC} ← 需要在 n8n UI 点 Activate"
elif [ "$N8N_CODE" = "400" ]; then
    echo -e "${YELLOW}⚠️ workflow 激活但参数错误${NC}"
else
    echo -e "${YELLOW}⚠️ $N8N_CODE${NC}"
fi

# 环节4: 飞书通知 (检查最近一次 execution)
echo -e "${BLUE}[4/4] 飞书通知${NC}"
echo -e "  ${YELLOW}需要人工确认：飞书群是否收到消息${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  链路状态: ${YELLOW}3/4 可自动化${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "下一步:"
echo "  1. 打开 http://localhost:5678"
echo "  2. 找到 'EasyUseAI Lead Router'"
echo "  3. 点右上角 Activate (变绿色)"
echo "  4. 再次运行: bash scripts/chain-check.sh"
echo ""
