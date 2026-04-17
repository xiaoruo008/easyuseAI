#!/bin/bash
# easyuseAI 系统状态检查
# 用法: bash scripts/status.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  easyuseAI 系统状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 前端 (Next.js)
echo -n "[前端] localhost:3005 ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 | grep -q "200"; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 未运行${NC}"
fi

# 2. Hermes Gateway
echo -n "[Gateway] 127.0.0.1:8642 ... "
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8642/health | grep -q "200"; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 未运行${NC}"
fi

# 3. Hermes Web UI
echo -n "[Web UI] localhost:5173 ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 未运行${NC}"
fi

# 4. n8n
echo -n "[n8n] localhost:5678 ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 | grep -q "200"; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 未运行${NC}"
fi

# 5. /api/leads 测试
echo -n "[API] /api/leads ... "
RESPONSE=$(curl -s -X POST http://localhost:3005/api/leads \
    -H "Content-Type: application/json" \
    -d '{"name":"状态检查","wechat":"check","category":"test","resultType":"traffic"}' \
    -w "\n%{http_code}" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ 正常 (201)${NC}"
else
    echo -e "${RED}❌ 异常 ($HTTP_CODE)${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
