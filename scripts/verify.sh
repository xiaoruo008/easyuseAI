#!/bin/bash
# easyuseAI 快速验证脚本
# 回家后一键运行，验证链路是否打通

echo "🔍 开始验证 easyuseAI 链路..."
echo ""

# 1. 测试 leads API
echo "① 测试 /api/leads 接口..."
RESP=$(curl -s -X POST http://localhost:3000/api/leads \
    -H "Content-Type: application/json" \
    -d '{"name":"回家测试","wechat":"home_test","category":"女装","resultType":"traffic"}' \
    -w "\n%{http_code}")
CODE=$(echo "$RESP" | tail -1)
if [ "$CODE" = "201" ]; then
    echo "   ✅ /api/leads 正常 (201)"
else
    echo "   ❌ /api/leads 失败 ($CODE)"
fi

# 2. 检查 n8n webhook
echo ""
echo "② 测试 n8n webhook..."
N8N_RESP=$(curl -s -X POST http://localhost:5678/webhook/easyuse-lead \
    -H "Content-Type: application/json" \
    -d '{"name":"test","wechat":"test","selectedProvider":"minimax"}' \
    -w "\n%{http_code}" 2>/dev/null)
N8N_CODE=$(echo "$N8N_RESP" | tail -1)
if [ "$N8N_CODE" = "200" ] || [ "$N8N_CODE" = "201" ]; then
    echo "   ✅ n8n webhook 正常"
elif [ "$N8N_CODE" = "404" ]; then
    echo "   ❌ n8n workflow 未激活 → 请打开 http://localhost:5678 点 Activate"
else
    echo "   ⚠️  n8n webhook 返回 $N8N_CODE"
fi

# 3. 检查飞书
echo ""
echo "③ 飞书通知..."
echo "   ⚠️  请人工确认：飞书群是否收到消息"

# 4. 总结
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$CODE" = "201" ] && [ "$N8N_CODE" = "200" ] || [ "$N8N_CODE" = "201" ]; then
    echo "🎉 链路已完全打通！可以开始接单了"
else
    echo "⚠️  链路未完全打通，请检查上述问题"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
